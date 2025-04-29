# Enhanced Knowledge Base System

This project demonstrates an advanced knowledge base system that uses vector embeddings and large language models to provide intelligent document retrieval and question answering.

## Features

- **Advanced Document Processing**: Support for multiple file types (PDF, DOCX, TXT, etc.)
- **Intelligent Chunking**: Smart document segmentation with overlapping chunks for context preservation
- **Vector Embedding**: High-quality embeddings using state-of-the-art models
- **Hybrid Search**: Combines semantic search with keyword filtering for better results
- **Result Reranking**: Improves relevance with cross-encoding reranking
- **LLM Integration**: Uses OpenAI models to generate natural language answers
- **Web Interface**: Simple user interface for searching and asking questions
- **KB Maintenance**: Tools for monitoring and maintaining the knowledge base

## Setup

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Set up environment variables:**
   Create a `.env` file with the following:
   ```
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   OPENAI_API_KEY=your_openai_api_key  # Optional, for LLM features
   ```
4. **Set up Pinecone:**
   * Create a free account on [https://www.pinecone.io/](https://www.pinecone.io/)
   * Obtain your API key and environment from the Pinecone console
   * Create a new index named `poc-file-kb` with dimension `768` (for all-mpnet-base-v2) and metric `cosine`
5. **Place your knowledge base files** in the `data/documents/` directory

## Basic Usage

### Process Documents and Create Vector Database

1. **Load and intelligently chunk your documents:**
   ```bash
   python scripts/load_and_chunk.py data/documents/
   ```

2. **Generate embeddings and load into Pinecone:**
   ```bash
   python scripts/generate_embeddings.py
   ```

### Query the Knowledge Base

1. **Simple Document Search:**
   ```bash
   python scripts/query_knowledge_base.py "Your search query here"
   ```

2. **Ask Questions with LLM integration:**
   ```bash
   python scripts/llm_qa.py "Your question here"
   ```
   
   Options:
   * `--model MODEL`: Specify OpenAI model (default: gpt-3.5-turbo)
   * `--verbose`: Show detailed output including context

### Web Interface

Launch the web application:
```bash
python app.py
```

Then open your browser to http://127.0.0.1:5000

## Advanced Usage

### Knowledge Base Maintenance

The system includes a maintenance tool for managing your knowledge base:

```bash
python scripts/maintain_kb.py health  # Check health and stats
python scripts/maintain_kb.py health --visualize  # Generate visualizations

python scripts/maintain_kb.py update --documents /path/to/new/docs  # Add new documents

python scripts/maintain_kb.py purge --source "filename.pdf"  # Dry run purge for specific source
python scripts/maintain_kb.py purge --older-than 2023-01-01 --force  # Delete older documents
```

## Implementation Details

### Document Processing

The system processes documents through these steps:

1. **Loading**: Extracting text from various file formats
2. **Chunking**: Dividing text into manageable segments with smart breaks and overlap
3. **Embedding**: Converting chunks to vectors using the all-mpnet-base-v2 model
4. **Storage**: Storing vectors and metadata in Pinecone

### Retrieval System

The retrieval system uses:

1. **Semantic Search**: Finding vectors similar to the query embedding
2. **Keyword Filtering**: Filtering results based on extracted keywords
3. **Reranking**: Refining results using cross-attention between query and documents
4. **Context Building**: Assembling relevant chunks for LLM context

### LLM Integration

When using the LLM features, the system:

1. Converts the user query to a vector embedding
2. Retrieves relevant documents with hybrid search
3. Uses retrieved documents as context for the LLM
4. Generates a natural language answer with references to sources

## Next Steps

- Implement more sophisticated LLM prompting techniques
- Add document processing for more file types
- Add authentication and multi-user support to the web interface
- Integrate active learning for feedback-based improvement
- Implement caching for frequently asked questions
- Add a chatbot interface with conversation history

## License

This project is open-source. Feel free to use and modify as needed. 