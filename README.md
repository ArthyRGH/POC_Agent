# POC Agent for Knowledge Base Querying

This project demonstrates a Proof of Concept (POC) agent that can query a knowledge base stored in files using vector embeddings and Pinecone.

## Setup

1.  **Clone the repository** (if you're using Git).
2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
3.  **Set up Pinecone:**
    * Create a free account on [https://www.pinecone.io/](https://www.pinecone.io/).
    * Obtain your API key and environment from the Pinecone console.
    * Create a new index named `poc-file-kb` with dimension `384` and metric `Cosine`.
4.  **Place your knowledge base files** in the `data/documents/` directory.

## Running the Scripts

1.  **Load and chunk data:**
    ```bash
    python scripts/load_and_chunk.py data/documents/
    ```
    *(Replace `data/documents/` with the actual path if needed)*

2.  **Generate embeddings and load into Pinecone:**
    * Set your Pinecone API key and environment as environment variables (recommended) or directly in the `scripts/generate_embeddings.py` file (for POC only, **not recommended for production**).
    ```bash
    # Example setting environment variables (replace with your actual values)
    export PINECONE_API_KEY="YOUR_PINECONE_API_KEY"
    export PINECONE_ENVIRONMENT="YOUR_PINECONE_ENVIRONMENT"
    python scripts/generate_embeddings.py
    ```

3.  **Query the knowledge base:**
    * Similarly, set your Pinecone API key and environment variables.
    ```bash
    export PINECONE_API_KEY="YOUR_PINECONE_API_KEY"
    export PINECONE_ENVIRONMENT="YOUR_PINECONE_ENVIRONMENT"
    python scripts/query_knowledge_base.py "Your search query here"
    ```
    *(Replace `"Your search query here"` with your actual query)*

## Next Steps (Beyond POC)

* Implement more sophisticated NLU using LLMs.
* Improve the agent's core logic and decision-making.
* Build a user interface or API for easier interaction.
* Implement more robust state management.
* Consider more scalable deployment options.
