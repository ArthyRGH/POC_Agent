from sentence_transformers import SentenceTransformer
import pinecone
import os
import sys

def generate_and_upsert_embeddings(data_chunks):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(data_chunks)
    print(f"Generated {len(embeddings)} embeddings of dimension {embeddings[0].shape[0]}")

    pinecone_api_key = os.environ.get("PINECONE_API_KEY")
    pinecone_environment = os.environ.get("PINECONE_ENVIRONMENT")

    if not pinecone_api_key or not pinecone_environment:
        print("Error: Please set the PINECONE_API_KEY and PINECONE_ENVIRONMENT environment variables.")
        sys.exit(1)

    pinecone.init(api_key=pinecone_api_key, environment=pinecone_environment)
    index_name = "poc-file-kb"

    try:
        index = pinecone.Index(index_name)
        for i, (text, embedding) in enumerate(zip(data_chunks, embeddings)):
            index.upsert([
                (f"chunk-{i}", embedding.tolist(), {"text": text})
            ])
        print(f"Successfully loaded {index.describe_index_stats()['total_vector_count']} vectors into Pinecone.")
    except pinecone.exceptions.IndexNotFoundError:
        print(f"Error: Index '{index_name}' not found. Please create it in your Pinecone dashboard.")
    finally:
        pinecone.deinit()

if __name__ == "__main__":
    # For simplicity in the POC, we'll assume the chunks are passed directly
    # or were saved to a temporary file.
    # If you saved to a file in load_and_chunk.py, you would load them here.
    # Example of loading from a temporary file:
    # with open("temp_chunks.txt", "r") as f:
    #     data_chunks = [line.strip() for line in f]

    # For this POC flow, we'll run load_and_chunk.py first and then manually
    # copy the printed chunks or modify this script to directly import.
    # A more robust solution would involve inter-process communication or saving to a file.
    print("Please run 'python scripts/load_and_chunk.py <data_directory>' first to get the data chunks.")
    print("Then, paste the list of chunks here (or modify this script to load them):")
    # This is a very basic way to get input for the POC.
    # In a real application, you'd manage the data flow more robustly.
    data_chunks_input = input()
    # Basic attempt to parse the input as a Python list (very error-prone for real data)
    try:
        data_chunks = eval(data_chunks_input)
        if isinstance(data_chunks, list):
            generate_and_upsert_embeddings(data_chunks)
        else:
            print("Error: Invalid input format for data chunks.")
    except:
        print("Error: Could not parse the input as a list of chunks.")
