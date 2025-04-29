from dotenv import load_dotenv
import os
from pinecone import Pinecone

load_dotenv()  # Load environment variables from .env

def check_pinecone():
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    
    if not pinecone_api_key:
        print("Error: PINECONE_API_KEY not found in .env file")
        return
        
    print("Connecting to Pinecone...")
    pc = Pinecone(api_key=pinecone_api_key)
    
    try:
        indexes = pc.list_indexes()
        print(f"Available indexes: {[idx['name'] for idx in indexes]}")
        
        # Check if our index exists
        index_name = "poc-file-kb"
        if any(idx["name"] == index_name for idx in indexes):
            index = pc.Index(index_name)
            stats = index.describe_index_stats()
            print(f"Index '{index_name}' found!")
            print(f"Dimension: {stats.get('dimension')}")
            print(f"Total vectors: {stats.get('total_vector_count', 0)}")
        else:
            print(f"Index '{index_name}' not found. Please create it in your Pinecone dashboard.")
            print(f"Required dimension: 768")
            print(f"Required metric: cosine")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_pinecone() 