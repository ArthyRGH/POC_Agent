# POC Agent for Knowledge Base Querying

This project demonstrates a Proof of Concept (POC) agent that can query a knowledge base stored in files using vector embeddings and Pinecone. The system processes documents from various formats, generates vector embeddings, and enables semantic search through natural language queries.

## Features

- **Multi-format Document Processing**: Supports text files, PDFs, and Word documents
- **Efficient Chunking**: Intelligently splits documents into meaningful chunks
- **Parallel Processing**: Configurable batch size and parallel workers for faster embedding generation
- **Interactive Query Mode**: User-friendly interface for exploring the knowledge base
- **Similarity Threshold Filtering**: Filter results based on relevance scores
- **Source Attribution**: Each result includes information about its source document

## Setup

1. **Clone the repository** (if you're using Git).
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Additional dependencies for document processing:**
   ```bash
   pip install pypdf python-docx
   ```
4. **Set up Pinecone:**
   * Create a free account on [https://www.pinecone.io/](https://www.pinecone.io/).
   * Obtain your API key and environment from the Pinecone console.
   * Create a new index named `poc-file-kb` with dimension `384` and metric `Cosine`.
5. **Environment Variables:**
   * Create a `.env` file in the project root with your Pinecone credentials:
     ```
     PINECONE_API_KEY=your_api_key_here
     PINECONE_ENVIRONMENT=your_environment_here
     ```
6. **Place your knowledge base files** in the `data/documents/` directory.

## Running the Scripts

1. **Load and chunk data:**
   ```bash
   python scripts/load_and_chunk.py data/documents/
   ```
   This processes documents and creates text chunks with source information.

2. **Generate embeddings and load into Pinecone:**
   ```bash
   # Basic usage
   python scripts/generate_embeddings.py

   # With custom batch size and parallel processing
   python scripts/generate_embeddings.py --batch-size 10 --workers 4 --parallel

   # Process only a subset of chunks (for testing)
   python scripts/generate_embeddings.py --limit 50
   ```

3. **Query the knowledge base:**
   ```bash
   # Basic usage
   python scripts/query_knowledge_base.py "Your search query here"

   # With custom parameters
   python scripts/query_knowledge_base.py "Your search query here" --top-k 5 --threshold 0.3

   # Interactive mode
   python scripts/query_knowledge_base.py --interactive
   ```

## Command-Line Options

### Generate Embeddings
- `--batch-size`: Number of chunks to process at once (default: 20)
- `--workers`: Number of parallel workers (default: 1)
- `--parallel`: Enable parallel processing
- `--limit`: Limit the number of chunks to process

### Query Knowledge Base
- `--top-k`: Number of results to return (default: 5)
- `--threshold`: Minimum similarity score threshold (default: 0.0)
- `--interactive`: Run in interactive mode

## Next Steps (Beyond POC)

* Implement more sophisticated NLU using LLMs
* Improve the agent's core logic and decision-making
* Build a user interface or API for easier interaction
* Implement more robust state management
* Consider more scalable deployment options
* Add support for more document formats
* Implement incremental updates to the knowledge base
