from dotenv import load_dotenv
import os
from sentence_transformers import SentenceTransformer
import pinecone
import sys

load_dotenv()  # Load environment variables from .env

def query_pinecone(query):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    query_embedding = model.encode([query])[0].tolist()

    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    pinecone_environment = os.getenv("PINECONE_ENVIRONMENT")

    if not pinecone_api_key or not pinecone_environment:
        print("Error: Please check your .env file for PINECONE_API_KEY and PINECONE_ENVIRONMENT.")
        sys.exit(1)

    pinecone.init(api_key=pinecone_api_key, environment=pinecone_environment)
    index_name = "poc-file-kb"

    try:
        index = pinecone.Index(index_name)
        results = index.query(
            vector=query_embedding,
            top_k=2,
            include_metadata=True
        )

        print(f"\nQuery: {query}")
        for match in results['matches']:
            print(f"  Score: {match['score']:.4f}")
            print(f"  Text: {match['metadata']['text']}")
    except pinecone.exceptions.IndexNotFoundError:
        print(f"Error: Index '{index_name}' not found. Please create it in your Pinecone dashboard.")
    finally:
        pinecone.deinit()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python query_knowledge_base.py \"your search query\"")
        sys.exit(1)

    user_query = sys.argv[1]
    query_pinecone(user_query)
