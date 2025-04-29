import argparse
import os
import json
import sys
from dotenv import load_dotenv
import requests
from typing import List, Dict, Any
from scripts.query_knowledge_base import QueryEngine

load_dotenv()  # Load environment variables from .env

class LLMQueryEngine:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            print("Error: Please set the OPENAI_API_KEY environment variable.")
            sys.exit(1)
            
        self.query_engine = QueryEngine()
        
    def get_relevant_context(self, query: str, max_results: int = 5) -> str:
        """Retrieve relevant documents for the query."""
        matches = self.query_engine.hybrid_search(query, top_k=max_results)
        
        if not matches:
            return "No relevant information found in the knowledge base."
            
        # Format context from matches
        context_parts = []
        for i, match in enumerate(matches):
            metadata = match['metadata']
            # Add source document and text
            context_parts.append(f"Document {i+1} (from {metadata['source']}):\n{metadata['text']}\n")
            
        # Join all parts
        return "\n".join(context_parts)
    
    def answer_with_openai(self, query: str, context: str, model: str = "gpt-3.5-turbo") -> Dict[str, Any]:
        """
        Use OpenAI to generate an answer based on the query and context.
        
        Args:
            query: User question
            context: Retrieved context from documents
            model: OpenAI model to use
            
        Returns:
            Dictionary with answer and metadata
        """
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.openai_api_key}"
        }
        
        prompt = f"""
You are a knowledgeable assistant that only answers based on the provided context.
If you don't know the answer based on the context, say "I don't have enough information to answer this question."
Don't make up information that's not in the context.

Context:
{context}

Question: {query}

Answer:
"""
        
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that only answers based on the provided content."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,  # Lower temperature for more factual responses
            "max_tokens": 500
        }
        
        try:
            response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=data)
            response.raise_for_status()
            
            result = response.json()
            answer = result["choices"][0]["message"]["content"].strip()
            
            return {
                "query": query,
                "answer": answer,
                "model": model,
                "context_used": True
            }
            
        except Exception as e:
            print(f"Error with OpenAI API: {e}")
            return {
                "query": query,
                "answer": "Sorry, I encountered an error trying to process your question.",
                "error": str(e),
                "context_used": False
            }
    
    def ask(self, query: str, model: str = "gpt-3.5-turbo") -> Dict[str, Any]:
        """
        Process a question using RAG (Retrieval Augmented Generation).
        
        Args:
            query: User question
            model: OpenAI model to use
            
        Returns:
            Dictionary with answer and metadata
        """
        # Retrieve relevant context
        context = self.get_relevant_context(query)
        
        # Get answer from LLM using context
        result = self.answer_with_openai(query, context, model)
        
        # Add context for transparency
        result["context"] = context
        
        return result

def main():
    parser = argparse.ArgumentParser(description='Ask questions using the knowledge base and LLM')
    parser.add_argument('query', nargs='+', help='The question to ask')
    parser.add_argument('--model', default="gpt-3.5-turbo", 
                        help='OpenAI model to use (default: gpt-3.5-turbo)')
    parser.add_argument('--verbose', action='store_true', 
                        help='Show detailed output including context')
    args = parser.parse_args()
    
    query_text = ' '.join(args.query)
    engine = LLMQueryEngine()
    result = engine.ask(query_text, model=args.model)
    
    # Print results
    print("\n📝 Question:", query_text)
    print("\n🤖 Answer:")
    print(result["answer"])
    
    if args.verbose:
        print("\n📚 Context used:")
        print(result["context"])
        print("\n⚙️ Model:", result["model"])
    
    print("\nNote: The answer is generated based on the retrieved documents and may not be complete.")

if __name__ == "__main__":
    main() 