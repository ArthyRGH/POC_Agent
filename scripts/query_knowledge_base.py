from dotenv import load_dotenv
import os
import sys
from sentence_transformers import SentenceTransformer, util
from pinecone import Pinecone
import json
import re
import textwrap
import argparse
from typing import List, Dict, Any, Tuple

load_dotenv()  # Load environment variables from .env

class QueryEngine:
    def __init__(self):
        self.model = SentenceTransformer('all-mpnet-base-v2')  # 768 dimensions
        
        pinecone_api_key = os.getenv("PINECONE_API_KEY")

        if not pinecone_api_key:
            print("Error: Please check your .env file for PINECONE_API_KEY.")
            sys.exit(1)

        self.pc = Pinecone(api_key=pinecone_api_key)
        self.index_name = "poc-file-kb"
        
        try:
            self.index = self.pc.Index(self.index_name)
        except Exception as e:
            print(f"Error connecting to Pinecone index: {e}")
            sys.exit(1)
    
    def extract_keywords(self, query: str) -> List[str]:
        """Extract key terms from the query for keyword filtering."""
        # Remove common stop words and keep only meaningful terms
        stop_words = {'a', 'an', 'the', 'in', 'on', 'at', 'of', 'to', 'for', 'with', 
                     'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 
                     'had', 'do', 'does', 'did', 'but', 'and', 'or', 'as', 'if', 'while', 
                     'because', 'so', 'than', 'that', 'this', 'these', 'those', 'what', 
                     'which', 'who', 'whom', 'when', 'where', 'why', 'how'}
        
        # Split into words, convert to lowercase, remove punctuation
        words = re.findall(r'\b\w+\b', query.lower())
        
        # Filter out stop words and words less than 3 characters
        keywords = [word for word in words if word not in stop_words and len(word) >= 3]
        
        return keywords
    
    def rerank_results(self, query: str, matches: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        """Rerank the results using cross-attention between query and documents."""
        if not matches:
            return []
            
        # Extract texts from matches
        texts = [match['metadata']['text'] for match in matches]
        
        # Calculate similarity scores between query and each text
        query_embedding = self.model.encode(query)
        text_embeddings = self.model.encode(texts)
        
        # Calculate cosine similarity
        scores = util.pytorch_cos_sim(query_embedding, text_embeddings)[0].tolist()
        
        # Combine original scores with new scores
        for i, match in enumerate(matches):
            # Weight the semantic similarity more heavily (0.7) than the vector DB score (0.3)
            match['score'] = 0.3 * match['score'] + 0.7 * scores[i]
        
        # Resort based on new scores
        matches.sort(key=lambda x: x['score'], reverse=True)
        
        # Return top-k
        return matches[:top_k]
    
    def hybrid_search(self, query: str, top_k: int = 10, rerank: bool = True) -> List[Dict[str, Any]]:
        """
        Perform a hybrid search combining semantic and keyword search.
        
        Args:
            query: The search query
            top_k: Number of results to return
            rerank: Whether to rerank results for better relevance
            
        Returns:
            List of search results with metadata
        """
        # Generate embedding for the query
        query_embedding = self.model.encode(query).tolist()
        
        # Extract keywords for filtering
        keywords = self.extract_keywords(query)
        keyword_filter = None
        
        # Only add filter if we have meaningful keywords (at least 2)
        if len(keywords) >= 2:
            # Create a filter for Pinecone that matches any of the keywords
            # This is a simple keyword matching approach using metadata
            keyword_filter = {
                "$or": [
                    {"text": {"$contains": keyword}} for keyword in keywords
                ]
            }
        
        try:
            # Perform vector search with optional filtering
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k * 2,  # Get more results than needed for reranking
                include_metadata=True,
                filter=keyword_filter
            )
            
            if not results['matches']:
                # If no results with filter, try again without filter
                if keyword_filter:
                    results = self.index.query(
                        vector=query_embedding,
                        top_k=top_k * 2,
                        include_metadata=True
                    )
            
            matches = results['matches']
            
            # Rerank results if requested
            if rerank and matches:
                matches = self.rerank_results(query, matches, top_k)
            else:
                # Just take top-k
                matches = matches[:top_k]
                
            return matches
        
        except Exception as e:
            print(f"Error searching Pinecone: {e}")
            return []
    
    def format_results(self, query: str, matches: List[Dict[str, Any]]):
        """Format and display search results."""
        if not matches:
            print("\n⚠️ No relevant documents found for your query.")
            return
        
        print(f"\n🔍 Query: \"{query}\"\n")
        print(f"Found {len(matches)} relevant sections:\n")
        
        for i, match in enumerate(matches):
            metadata = match['metadata']
            score = match['score']
            
            # Format text for display (wrap long lines)
            text = metadata['text']
            wrapped_text = textwrap.fill(text, width=100)
            
            # Calculate match quality indicator
            quality = "⭐⭐⭐" if score > 0.8 else "⭐⭐" if score > 0.6 else "⭐"
            
            print(f"Result {i+1} {quality} (score: {score:.2f})")
            print(f"Source: {metadata['source']}")
            print(f"Text:\n{wrapped_text}\n")
            print("-" * 80)
    
    def query(self, query_text: str, top_k: int = 5):
        """Execute a search query and display results."""
        matches = self.hybrid_search(query_text, top_k=top_k)
        self.format_results(query_text, matches)
        return matches

def main():
    parser = argparse.ArgumentParser(description='Query the knowledge base')
    parser.add_argument('query', nargs='+', help='The search query')
    parser.add_argument('--top-k', type=int, default=5, help='Number of results to return')
    parser.add_argument('--json', action='store_true', help='Output results as JSON')
    args = parser.parse_args()
    
    query_text = ' '.join(args.query)
    engine = QueryEngine()
    matches = engine.query(query_text, top_k=args.top_k)
    
    if args.json:
        # Output as JSON for programmatic use
        results = []
        for match in matches:
            results.append({
                'text': match['metadata']['text'],
                'source': match['metadata']['source'],
                'score': match['score']
            })
        print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main() 