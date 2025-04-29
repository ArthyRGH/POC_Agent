#!/usr/bin/env python
"""
Knowledge Base Maintenance Tool

This script provides utilities for maintaining the knowledge base:
- Purging old/outdated documents
- Updating the vector database with new documents
- Monitoring the health and stats of the knowledge base
"""

import os
import sys
import argparse
import json
from datetime import datetime
import time
from dotenv import load_dotenv
from pinecone import Pinecone
import matplotlib.pyplot as plt
from pathlib import Path
from tqdm import tqdm

# Add the parent directory to the path so we can import our scripts
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.load_and_chunk import load_and_chunk_documents
from scripts.generate_embeddings import generate_and_upsert_embeddings

load_dotenv()  # Load environment variables from .env

def initialize_pinecone():
    """Initialize and return the Pinecone client and index."""
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    index_name = "poc-file-kb"
    
    if not pinecone_api_key:
        print("Error: Please check your .env file for PINECONE_API_KEY.")
        sys.exit(1)
        
    pc = Pinecone(api_key=pinecone_api_key)
    
    try:
        index = pc.Index(index_name)
        return pc, index
    except Exception as e:
        print(f"Error connecting to Pinecone index: {e}")
        sys.exit(1)

def get_health_stats():
    """Get health statistics about the knowledge base."""
    _, index = initialize_pinecone()
    
    try:
        stats = index.describe_index_stats()
        vector_count = stats.get('total_vector_count', 0)
        dimension = stats.get('dimension', 0)
        
        # Get detailed metadata about vectors to analyze sources
        # This is a simplified approach - for large databases, you'd need 
        # to implement pagination or sampling
        results = index.query(
            vector=[0.0] * dimension,  # Dummy vector
            top_k=min(vector_count, 1000),  # Get up to 1000 vectors
            include_metadata=True
        )
        
        # Analyze sources
        sources = {}
        token_counts = []
        for match in results.get('matches', []):
            metadata = match.get('metadata', {})
            source = metadata.get('source', 'unknown')
            sources[source] = sources.get(source, 0) + 1
            
            # Collect token counts for analysis
            token_count = metadata.get('token_count', 0)
            if token_count > 0:
                token_counts.append(token_count)
        
        return {
            'vector_count': vector_count,
            'dimension': dimension,
            'sources': sources,
            'token_counts': token_counts
        }
        
    except Exception as e:
        print(f"Error getting health stats: {e}")
        return None

def visualize_stats(stats):
    """Create visualizations of the knowledge base statistics."""
    if not stats:
        print("No statistics available to visualize.")
        return
        
    # Create a directory for stats if it doesn't exist
    stats_dir = Path("kb_stats")
    stats_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Visualize sources
    sources = stats.get('sources', {})
    if sources:
        plt.figure(figsize=(12, 6))
        plt.bar(sources.keys(), sources.values())
        plt.title('Document Sources in Knowledge Base')
        plt.xlabel('Source')
        plt.ylabel('Number of Chunks')
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        plt.savefig(stats_dir / f"sources_{timestamp}.png")
        plt.close()
        
        print(f"Sources visualization saved to kb_stats/sources_{timestamp}.png")
    
    # Visualize token count distribution
    token_counts = stats.get('token_counts', [])
    if token_counts:
        plt.figure(figsize=(10, 6))
        plt.hist(token_counts, bins=20)
        plt.title('Token Count Distribution')
        plt.xlabel('Tokens per Chunk')
        plt.ylabel('Frequency')
        plt.grid(True, alpha=0.3)
        plt.savefig(stats_dir / f"token_distribution_{timestamp}.png")
        plt.close()
        
        print(f"Token distribution visualization saved to kb_stats/token_distribution_{timestamp}.png")
    
    # Save raw stats
    with open(stats_dir / f"stats_{timestamp}.json", 'w') as f:
        # Convert stats to be JSON serializable
        stats_copy = stats.copy()
        stats_copy['timestamp'] = timestamp
        stats_copy.pop('token_counts', None)  # Remove the raw token counts
        stats_copy['token_stats'] = {
            'min': min(token_counts) if token_counts else 0,
            'max': max(token_counts) if token_counts else 0,
            'avg': sum(token_counts) / len(token_counts) if token_counts else 0,
            'count': len(token_counts)
        }
        
        json.dump(stats_copy, f, indent=2)
        print(f"Raw statistics saved to kb_stats/stats_{timestamp}.json")

def purge_knowledge_base(source_filter=None, older_than=None, dry_run=True):
    """
    Purge vectors from the knowledge base based on filters.
    
    Args:
        source_filter: Only purge vectors from this source
        older_than: Only purge vectors older than this date (ISO format)
        dry_run: If True, only print what would be deleted without actually deleting
    """
    _, index = initialize_pinecone()
    
    # Build filter for vectors to delete
    filter_dict = {}
    
    if source_filter:
        filter_dict["source"] = {"$eq": source_filter}
        
    if older_than:
        try:
            older_than_date = datetime.fromisoformat(older_than)
            filter_dict["indexed_date"] = {"$lt": older_than.isoformat()}
        except ValueError:
            print(f"Error: Invalid date format. Please use ISO format (YYYY-MM-DD).")
            return
    
    # If no filters are specified, confirm with the user
    if not filter_dict and not dry_run:
        confirm = input("WARNING: You are about to delete ALL vectors from the knowledge base. " 
                       "This cannot be undone. Continue? (y/N): ")
        if confirm.lower() != 'y':
            print("Operation cancelled.")
            return
    
    try:
        # For dry run, just print what would be deleted
        if dry_run:
            # Get stats to estimate what would be deleted
            stats = index.describe_index_stats()
            total_vectors = stats.get('total_vector_count', 0)
            
            print(f"DRY RUN: Would delete vectors matching filter: {filter_dict}")
            print(f"Total vectors in database: {total_vectors}")
            print("To actually delete, run again with --force")
            return
            
        # Actually delete the vectors
        if filter_dict:
            # Delete by filter
            print(f"Deleting vectors matching filter: {filter_dict}")
            index.delete(filter=filter_dict)
        else:
            # Delete all vectors
            print("Deleting ALL vectors")
            index.delete(delete_all=True)
            
        # Get updated stats
        time.sleep(1)  # Give Pinecone a moment to update
        stats = index.describe_index_stats()
        print(f"Purge completed. Remaining vectors: {stats.get('total_vector_count', 0)}")
        
    except Exception as e:
        print(f"Error purging knowledge base: {e}")

def update_knowledge_base(documents_path):
    """
    Update the knowledge base with new documents.
    
    Args:
        documents_path: Path to the directory containing documents to add
    """
    if not os.path.isdir(documents_path):
        print(f"Error: {documents_path} is not a valid directory.")
        return
        
    try:
        print(f"Loading and chunking documents from {documents_path}")
        chunks = load_and_chunk_documents(documents_path)
        
        if not chunks:
            print("No documents found or processed.")
            return
            
        print(f"Generated {len(chunks)} chunks from documents.")
        
        # Save chunks to temporary file
        temp_file = "temp_chunks.json"
        with open(temp_file, "w", encoding='utf-8') as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)
            
        print(f"Saved chunks to {temp_file}")
        
        # Process and upsert embeddings
        print("Generating embeddings and upserting to Pinecone...")
        generate_and_upsert_embeddings(chunks)
        
        print("Update completed.")
        
    except Exception as e:
        print(f"Error updating knowledge base: {e}")

def main():
    parser = argparse.ArgumentParser(description='Knowledge Base Maintenance Tool')
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # Health check command
    health_parser = subparsers.add_parser('health', help='Check health and stats of the knowledge base')
    health_parser.add_argument('--visualize', action='store_true', 
                              help='Generate visualizations of the knowledge base statistics')
    
    # Purge command
    purge_parser = subparsers.add_parser('purge', help='Purge vectors from the knowledge base')
    purge_parser.add_argument('--source', help='Only purge vectors from this source')
    purge_parser.add_argument('--older-than', help='Only purge vectors older than this date (ISO format)')
    purge_parser.add_argument('--force', action='store_true', 
                             help='Actually perform the deletion (without this flag, it\'s a dry run)')
    
    # Update command
    update_parser = subparsers.add_parser('update', help='Update the knowledge base with new documents')
    update_parser.add_argument('--documents', required=True, 
                              help='Path to the directory containing documents to add')
    
    args = parser.parse_args()
    
    if args.command == 'health':
        stats = get_health_stats()
        
        if stats:
            print(f"\n--- Knowledge Base Health Report ---")
            print(f"Total vectors: {stats['vector_count']}")
            print(f"Vector dimension: {stats['dimension']}")
            
            print(f"\nSource distribution:")
            for source, count in stats['sources'].items():
                print(f"  {source}: {count} chunks")
                
            token_counts = stats.get('token_counts', [])
            if token_counts:
                avg_tokens = sum(token_counts) / len(token_counts)
                print(f"\nToken statistics:")
                print(f"  Average tokens per chunk: {avg_tokens:.1f}")
                print(f"  Min tokens: {min(token_counts)}")
                print(f"  Max tokens: {max(token_counts)}")
                
            if args.visualize:
                visualize_stats(stats)
        
    elif args.command == 'purge':
        purge_knowledge_base(
            source_filter=args.source,
            older_than=args.older_than,
            dry_run=not args.force
        )
        
    elif args.command == 'update':
        update_knowledge_base(args.documents)
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 