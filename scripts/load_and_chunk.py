import os
from unstructured.partition.auto import partition
import sys

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

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python load_and_chunk.py <directory_path>")
        sys.exit(1)

    documents_directory = sys.argv[1]
    data_chunks = load_and_chunk_documents(documents_directory)
    print(f"Total number of data chunks: {len(data_chunks)}")

    # You might want to save these chunks to a temporary file for the next step
    # For simplicity in the POC, we'll just pass them in memory in the next script.
    # If you have a very large dataset, consider saving to disk.
    # Example of saving to a temporary file:
    # with open("temp_chunks.txt", "w") as f:
    #     for chunk in data_chunks:
    #         f.write(chunk + "\n")
