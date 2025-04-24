import os
from unstructured.partition.auto import partition
from sentence_transformers import SentenceTransformer
import pinecone
import sys
from dotenv import load_dotenv

load_dotenv()

def load_and_chunk_documents(directory):
    chunks = []
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.isfile(filepath):
            try:
                elements = partition(filename=filepath)
                for element in elements:
                    if str(element).strip():
                        chunks.append(str(element))
                print(f"Processed: {filename} - Found {len(elements)} chunks.")
            except Exception as e:
                print(f"Error processing {filename}: {e}")
    return chunks

def generate_and_upsert_embeddings(data_chunks):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(data_chunks)
    print(f"Generated {len(embeddings)} embeddings of dimension {embeddings[0].shape[0]}")

    pinecone_api_key = os.environ.get("PINECONE_API_KEY")

    if not pinecone_api_key:
        print("Error: Please set the PINECONE_API_KEY environment variable.")
        sys.exit(1)

    pc = pinecone.Pinecone(api_key=pinecone_api_key)
    index_name = "poc-file-kb"

    try:
        index = pc.Index(index_name)
        for i, (text, embedding) in enumerate(zip(data_chunks, embeddings)):
            index.upsert([
                (f"chunk-{i}", embedding.tolist(), {"text": text})
            ])
        print(f"Successfully loaded {index.describe_index_stats()['total_vector_count']} vectors into Pinecone.")
    except Exception as e:
        print(f"Error: {e}")

def query_pinecone(query):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    query_embedding = model.encode([query])[0].tolist()

    pinecone_api_key = os.environ.get("PINECONE_API_KEY")

    if not pinecone_api_key:
        print("Error: Please set the PINECONE_API_KEY environment variable.")
        sys.exit(1)

    pc = pinecone.Pinecone(api_key=pinecone_api_key)
    index_name = "poc-file-kb"

    try:
        index = pc.Index(index_name)
        results = index.query(
            vector=query_embedding,
            top_k=2,
            include_metadata=True
        )

        print(f"\nQuery: {query}")
        for match in results['matches']:
            print(f"  Score: {match['score']:.4f}")
            print(f"  Text: {match['metadata']['text']}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python combined_knowledge_base.py <data_directory> \"your search query\"")
        sys.exit(1)

    documents_directory = sys.argv[1]
    user_query = sys.argv[2]

    data_chunks = load_and_chunk_documents(documents_directory)
    print(f"Total number of data chunks: {len(data_chunks)}")
    generate_and_upsert_embeddings(data_chunks)
    query_pinecone(user_query)