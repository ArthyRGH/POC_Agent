from dotenv import load_dotenv
import os
import json
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import sys
import hashlib
import datetime
import uuid

load_dotenv()  # Load environment variables from .env

def generate_unique_id(text, source):
    """Generate a unique ID for a chunk based on its content and source."""
    hasher = hashlib.md5()
    hasher.update(f"{text}{source}".encode('utf-8'))
    return str(uuid.uuid4())[:8] + "-" + hasher.hexdigest()[:12]

def generate_and_upsert_embeddings(data_chunks, batch_size=32):
    """
    Generate embeddings for chunks and upsert them to Pinecone.
    
    Args:
        data_chunks: List of chunk dictionaries with text and metadata
        batch_size: Number of vectors to upsert in each batch
    """
    # Use a more advanced model for better embeddings
    print("Loading embedding model...")
    model = SentenceTransformer('all-mpnet-base-v2')  # 768 dimensions - Better quality than MiniLM
    
    pinecone_api_key = os.getenv("PINECONE_API_KEY")

    if not pinecone_api_key:
        print("Error: Please check your .env file for PINECONE_API_KEY.")
        sys.exit(1)

    print(f"Connecting to Pinecone...")
    pc = Pinecone(api_key=pinecone_api_key)
    index_name = "poc-file-kb"
    
    # Check if index exists, otherwise suggest creating it
    available_indexes = [idx["name"] for idx in pc.list_indexes()]
    if index_name not in available_indexes:
        print(f"Index '{index_name}' does not exist. Please create it with dimension 768 and metric cosine.")
        print(f"Available indexes: {available_indexes}")
        sys.exit(1)

    # Connect to the index
    try:
        index = pc.Index(index_name)
        
        # Process in batches
        total_batches = (len(data_chunks) + batch_size - 1) // batch_size
        print(f"Processing {len(data_chunks)} chunks in {total_batches} batches...")
        
        for i in range(0, len(data_chunks), batch_size):
            batch = data_chunks[i:i+batch_size]
            batch_texts = [chunk["text"] for chunk in batch]
            
            # Generate embeddings for the batch
            print(f"Generating embeddings for batch {i//batch_size + 1}/{total_batches}...")
            embeddings = model.encode(batch_texts)
            
            # Prepare vectors with IDs and metadata
            vectors_to_upsert = []
            for j, embedding in enumerate(embeddings):
                chunk = batch[j]
                unique_id = generate_unique_id(chunk["text"], chunk["source"])
                
                # Calculate approx token count for reference
                approx_token_count = len(chunk["text"].split()) * 1.3
                
                # Prepare metadata with useful information
                metadata = {
                    "text": chunk["text"],
                    "source": chunk["source"],
                    "chunk_id": chunk["chunk_id"],
                    "position": chunk["position"],
                    "token_count": int(approx_token_count),
                    "indexed_date": datetime.datetime.now().isoformat()
                }
                
                vectors_to_upsert.append(
                    (unique_id, embedding.tolist(), metadata)
                )
            
            # Upsert to Pinecone
            index.upsert(vectors=vectors_to_upsert)
            print(f"Upserted batch {i//batch_size + 1}/{total_batches}")
            
        # Get stats
        stats = index.describe_index_stats()
        print(f"Successfully loaded {stats['total_vector_count']} vectors into Pinecone index '{index_name}'.")
        print(f"Vector dimension: {stats['dimension']}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Check if the chunks file exists
    chunks_file = "temp_chunks.json"
    if not os.path.exists(chunks_file):
        print(f"Error: {chunks_file} not found. Please run load_and_chunk.py first.")
        sys.exit(1)
        
    # Load the chunks
    with open(chunks_file, "r", encoding='utf-8') as f:
        try:
            data_chunks = json.load(f)
            print(f"Loaded {len(data_chunks)} chunks from {chunks_file}")
        except json.JSONDecodeError:
            print(f"Error: {chunks_file} is not valid JSON.")
            sys.exit(1)
            
    generate_and_upsert_embeddings(data_chunks) 