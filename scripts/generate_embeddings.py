from dotenv import load_dotenv
import os
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import sys

load_dotenv()  # Load environment variables from .env

def generate_and_upsert_embeddings(data_chunks, batch_size=100):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    pinecone_api_key = os.getenv("PINECONE_API_KEY")

    if not pinecone_api_key:
        print("Error: Please check your .env file for PINECONE_API_KEY.")
        sys.exit(1)

    pc = Pinecone(api_key=pinecone_api_key)
    index_name = "poc-file-kb"

    try:
        index = pc.Index(index_name)
        for i in range(0, len(data_chunks), batch_size):
            batch = data_chunks[i:i+batch_size]
            embeddings = model.encode(batch)
            for j, embedding in enumerate(embeddings):
                index.upsert([
                    (f"chunk-{i+j}", embedding.tolist(), {"text": batch[j]})
                ])
            print(f"Processed batch {i//batch_size + 1}/{(len(data_chunks)+batch_size-1)//batch_size}")
        print(f"Successfully loaded {index.describe_index_stats()['total_vector_count']} vectors into Pinecone.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # No deinit needed for the new Pinecone API
        pass

if __name__ == "__main__":
    with open("temp_chunks.txt", "r", encoding='utf-8') as f:
        data_chunks = [line.strip() for line in f]
    generate_and_upsert_embeddings(data_chunks)
