import pinecone
import os
import sys

def initialize_pinecone():
    pinecone_api_key = os.environ.get("PINECONE_API_KEY")
    pinecone_environment = os.environ.get("PINECONE_ENVIRONMENT")

    if not pinecone_api_key or not pinecone_environment:
        print("Error: Please set the PINECONE_API_KEY and PINECONE_ENVIRONMENT environment variables.")
        sys.exit(1)

    pinecone.init(api_key=pinecone_api_key, environment=pinecone_environment)

def get_pinecone_index(index_name="poc-file-kb"):
    try:
        index = pinecone.Index(index_name)
        return index
    except pinecone.exceptions.IndexNotFoundError:
        print(f"Error: Index '{index_name}' not found. Please create it in your Pinecone dashboard.")
        sys.exit(1)

def deinitialize_pinecone():
    pinecone.deinit()

# You can move the upsert and query logic here for a more modular design
# For this simple POC, keeping it in the main scripts might be sufficient.
