from dotenv import load_dotenv
import os
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import sys
import textwrap
import argparse

load_dotenv()  # Load environment variables from .env

def query_pinecone(query, top_k=5, threshold=0.0):
    """
    Query the Pinecone index with a natural language query

    Args:
        query: The natural language query
        top_k: Number of results to return
        threshold: Minimum similarity score threshold (0.0 to 1.0)
    """
    print(f"\nQuerying knowledge base with: '{query}'")

    # Load the model
    model = SentenceTransformer('all-MiniLM-L6-v2')

    # Convert query to embedding
    query_embedding = model.encode([query])[0].tolist()

    # Get Pinecone API key
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    if not pinecone_api_key:
        print("Error: Please check your .env file for PINECONE_API_KEY.")
        sys.exit(1)

    # Initialize Pinecone
    pc = Pinecone(api_key=pinecone_api_key)
    index_name = "poc-file-kb"

    try:
        # Get the index
        index = pc.Index(index_name)

        # Query the index
        results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )

        # Filter results by threshold if specified
        filtered_matches = [
            match for match in results['matches']
            if match['score'] >= threshold
        ]

        # Print results
        if filtered_matches:
            print(f"\nFound {len(filtered_matches)} results:")
            print("=" * 80)

            for i, match in enumerate(filtered_matches):
                score = match['score']
                text = match['metadata']['text']

                # Format the text for better readability
                wrapped_text = textwrap.fill(text, width=80)

                print(f"Result {i+1} (Similarity: {score:.4f})")
                print("-" * 80)
                print(wrapped_text)
                print("=" * 80)
        else:
            print("\nNo results found that meet the similarity threshold.")
            print(f"Try adjusting the threshold (current: {threshold}) or use a different query.")

    except Exception as e:
        print(f"Error querying Pinecone: {e}")

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Query the knowledge base')
    parser.add_argument('query', nargs='?', default=None,
                        help='The search query')
    parser.add_argument('--top-k', type=int, default=5,
                        help='Number of results to return (default: 5)')
    parser.add_argument('--threshold', type=float, default=0.0,
                        help='Minimum similarity score threshold (default: 0.0)')
    parser.add_argument('--interactive', action='store_true',
                        help='Run in interactive mode')
    return parser.parse_args()

def interactive_mode():
    """Run in interactive mode"""
    print("\n=== Knowledge Base Query System (Interactive Mode) ===")
    print("Type 'exit' or 'quit' to end the session")

    while True:
        query = input("\nEnter your query: ")
        if query.lower() in ['exit', 'quit']:
            print("Exiting interactive mode.")
            break

        # Get additional parameters
        try:
            top_k = int(input("Number of results to return (default: 5): ") or 5)
            threshold = float(input("Minimum similarity threshold (0.0-1.0, default: 0.0): ") or 0.0)
        except ValueError:
            print("Invalid input. Using default values.")
            top_k = 5
            threshold = 0.0

        # Execute query
        query_pinecone(query, top_k=top_k, threshold=threshold)

if __name__ == "__main__":
    # Parse command line arguments
    args = parse_arguments()

    if args.interactive:
        interactive_mode()
    elif args.query:
        query_pinecone(args.query, top_k=args.top_k, threshold=args.threshold)
    else:
        print("Error: Please provide a query or use --interactive mode")
        print("Usage: python query_knowledge_base.py \"your search query\"")
        print("       python query_knowledge_base.py --interactive")
        sys.exit(1)
