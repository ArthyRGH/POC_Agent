from dotenv import load_dotenv
import os
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import sys
from tqdm import tqdm
import time
import argparse
import concurrent.futures

load_dotenv()  # Load environment variables from .env

def process_batch(batch_data):
    """
    Process a single batch of data

    Args:
        batch_data: Tuple of (start_idx, batch, model, index)

    Returns:
        Number of vectors processed
    """
    start_idx, batch, model, index = batch_data

    # Generate embeddings
    embeddings = model.encode(batch)

    # Prepare vectors for upsert
    vectors = []
    for j, embedding in enumerate(embeddings):
        # Create a unique ID for each vector
        vector_id = f"chunk-{start_idx+j}"

        # Store the text as metadata
        metadata = {"text": batch[j]}

        # Add to vectors list
        vectors.append((vector_id, embedding.tolist(), metadata))

    # Upsert to Pinecone
    index.upsert(vectors=vectors)

    return len(vectors)

def generate_and_upsert_embeddings(data_chunks, batch_size=20, workers=1, use_parallel=False):
    """
    Generate embeddings and upsert them to Pinecone

    Args:
        data_chunks: List of text chunks to process
        batch_size: Size of batches to process at once
        workers: Number of parallel workers (only used if use_parallel=True)
        use_parallel: Whether to use parallel processing
    """
    if use_parallel:
        print(f"Processing {len(data_chunks)} chunks with batch size {batch_size} using {workers} workers")
    else:
        print(f"Processing {len(data_chunks)} chunks with batch size {batch_size} (sequential processing)")

    # Load the model
    # model = SentenceTransformer('all-MiniLM-L6-v2')
    model = SentenceTransformer('all-mpnet-base-v2')  # 768 dimensions
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

        # Process data in batches
        total_vectors = 0
        total_batches = (len(data_chunks) + batch_size - 1) // batch_size
        start_time = time.time()

        if use_parallel and workers > 1:
            # Prepare batches for parallel processing
            batches = []
            for i in range(0, len(data_chunks), batch_size):
                batch = data_chunks[i:i+batch_size]
                batches.append((i, batch, model, index))

            # Process batches in parallel
            with tqdm(total=total_batches, desc="Processing batches") as pbar:
                with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
                    # Submit all batch processing tasks
                    future_to_batch = {executor.submit(process_batch, batch_data): batch_data for batch_data in batches}

                    # Process results as they complete
                    for future in concurrent.futures.as_completed(future_to_batch):
                        try:
                            vectors_processed = future.result()
                            total_vectors += vectors_processed
                            pbar.update(1)
                        except Exception as exc:
                            print(f"Batch processing generated an exception: {exc}")
        else:
            # Sequential processing
            with tqdm(total=total_batches, desc="Processing batches") as pbar:
                for i in range(0, len(data_chunks), batch_size):
                    batch = data_chunks[i:i+batch_size]

                    # Generate embeddings
                    embeddings = model.encode(batch)

                    # Prepare vectors for upsert
                    vectors = []
                    for j, embedding in enumerate(embeddings):
                        # Create a unique ID for each vector
                        vector_id = f"chunk-{i+j}"

                        # Store the text as metadata
                        metadata = {"text": batch[j]}

                        # Add to vectors list
                        vectors.append((vector_id, embedding.tolist(), metadata))

                    # Upsert to Pinecone
                    index.upsert(vectors=vectors)
                    total_vectors += len(vectors)

                    # Update progress bar
                    pbar.update(1)

        # Calculate processing time
        elapsed_time = time.time() - start_time
        vectors_per_second = total_vectors / elapsed_time if elapsed_time > 0 else 0

        # Get final stats
        print(f"Successfully loaded {total_vectors} vectors into Pinecone in {elapsed_time:.2f} seconds")
        print(f"Processing speed: {vectors_per_second:.2f} vectors/second")

        try:
            stats = index.describe_index_stats()
            print(f"Index stats: {stats['total_vector_count']} total vectors")
        except Exception as e:
            print(f"Could not get index stats: {e}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Generate embeddings and upload to Pinecone')
    parser.add_argument('--batch-size', type=int, default=20,
                        help='Batch size for processing (default: 20)')
    parser.add_argument('--workers', type=int, default=1,
                        help='Number of parallel workers (default: 1, sequential processing)')
    parser.add_argument('--parallel', action='store_true',
                        help='Use parallel processing (default: False)')
    parser.add_argument('--limit', type=int, default=None,
                        help='Limit the number of chunks to process (default: process all)')
    return parser.parse_args()

if __name__ == "__main__":
    # Parse command line arguments
    args = parse_arguments()

    # Load data chunks
    with open("temp_chunks.txt", "r", encoding='utf-8') as f:
        data_chunks = [line.strip() for line in f if line.strip()]

    # Apply limit if specified
    if args.limit and args.limit > 0 and args.limit < len(data_chunks):
        data_chunks = data_chunks[:args.limit]
        print(f"Limited to processing {args.limit} chunks")

    print(f"Loaded {len(data_chunks)} chunks from temp_chunks.txt")

    # Run the embedding generation
    generate_and_upsert_embeddings(
        data_chunks,
        batch_size=args.batch_size,
        workers=args.workers,
        use_parallel=args.parallel
    )
