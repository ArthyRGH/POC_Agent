import os

def load_and_chunk_documents(directory):
    chunks = []
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.isfile(filepath):
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    paragraphs = content.split('\n\n')
                    chunks.extend(paragraphs)
                print(f"Processed: {filename} - Found {len(paragraphs)} chunks.")
            except Exception as e:
                print(f"Error processing {filename}: {e}")
    return chunks

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python load_and_chunk.py <directory_path>")
        sys.exit(1)

    documents_directory = sys.argv[1]
    data_chunks = load_and_chunk_documents(documents_directory)
    print(f"Total number of data chunks: {len(data_chunks)}")

    with open("temp_chunks.txt", "w", encoding='utf-8') as f:
        for chunk in data_chunks:
            f.write(chunk + "\n")
