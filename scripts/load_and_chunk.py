import os
import sys
from pathlib import Path
import re

# Import document processing libraries
try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False
    print("Warning: pypdf package not available. PDF processing will be limited.")
    print("To install: pip install pypdf")

try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    print("Warning: python-docx package not available. DOCX processing will be limited.")
    print("To install: pip install python-docx")

def clean_text(text):
    """Clean text by removing extra whitespace and non-printable characters"""
    if not text:
        return ""

    # Replace multiple whitespace with a single space
    text = re.sub(r'\s+', ' ', text)

    # Remove non-printable characters
    text = ''.join(c if ord(c) >= 32 or c in '\n\r\t' else ' ' for c in text)

    return text.strip()

def chunk_text(text, min_length=50, max_length=1000):
    """Split text into reasonable chunks"""
    # First try to split by double newlines (paragraphs)
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]

    # If we have reasonable paragraphs, use them
    if paragraphs and all(len(p) < max_length for p in paragraphs):
        return [p for p in paragraphs if len(p) >= min_length]

    # Otherwise, split by sentences and then combine into reasonable chunks
    chunks = []
    current_chunk = ""

    # Simple sentence splitting (not perfect but good enough)
    sentences = re.split(r'(?<=[.!?])\s+', text)

    for sentence in sentences:
        if not sentence.strip():
            continue

        # If adding this sentence would make the chunk too long, start a new chunk
        if len(current_chunk) + len(sentence) > max_length and len(current_chunk) >= min_length:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
        else:
            if current_chunk:
                current_chunk += " " + sentence
            else:
                current_chunk = sentence

    # Add the last chunk if it's not empty
    if current_chunk and len(current_chunk) >= min_length:
        chunks.append(current_chunk.strip())

    return chunks

def process_text_file(filepath):
    """Process a plain text file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            content = clean_text(content)
            return chunk_text(content)
    except Exception as e:
        print(f"Error processing text file {filepath}: {e}")
        return []

def process_pdf_file(filepath):
    """Process a PDF file"""
    if PYPDF_AVAILABLE:
        chunks = []
        try:
            with open(filepath, 'rb') as f:
                pdf = pypdf.PdfReader(f)
                full_text = ""

                for page_num in range(len(pdf.pages)):
                    page = pdf.pages[page_num]
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n\n"

                full_text = clean_text(full_text)
                return chunk_text(full_text)
        except Exception as e:
            print(f"Error processing PDF {filepath}: {e}")
            return []
    return ["[PDF content not extracted - pypdf not available]"]

def process_docx_file(filepath):
    """Process a Word document"""
    if DOCX_AVAILABLE:
        try:
            doc = docx.Document(filepath)
            full_text = ""

            for para in doc.paragraphs:
                if para.text:
                    full_text += para.text + "\n\n"

            full_text = clean_text(full_text)
            return chunk_text(full_text)
        except Exception as e:
            print(f"Error processing DOCX {filepath}: {e}")
            return []
    return ["[DOCX content not extracted - python-docx not available]"]

def load_and_chunk_documents(directory):
    """Load and chunk documents from a directory"""
    chunks = []
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.isfile(filepath):
            file_ext = Path(filepath).suffix.lower()

            try:
                # Process based on file type
                if file_ext in ['.txt', '.md', '.csv']:
                    # Text files
                    file_chunks = process_text_file(filepath)
                elif file_ext == '.pdf':
                    # PDF files
                    file_chunks = process_pdf_file(filepath)
                elif file_ext in ['.docx', '.doc']:
                    # Word documents
                    file_chunks = process_docx_file(filepath)
                else:
                    print(f"Skipping unsupported file type: {filename}")
                    file_chunks = []

                # Add non-empty chunks with source information
                valid_chunks = []
                for chunk in file_chunks:
                    if chunk and len(chunk.strip()) > 20:
                        # Add source information to the chunk
                        chunk_with_source = f"{chunk.strip()} [Source: {filename}]"
                        valid_chunks.append(chunk_with_source)

                chunks.extend(valid_chunks)
                print(f"Processed: {filename} - Found {len(valid_chunks)} chunks.")
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

    # Save chunks to file
    with open("temp_chunks.txt", "w", encoding='utf-8') as f:
        for chunk in data_chunks:
            # Ensure the chunk is a string and clean it
            if chunk and isinstance(chunk, str):
                f.write(chunk + "\n")
