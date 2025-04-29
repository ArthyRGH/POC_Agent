import os
import argparse
from flask import Flask, render_template, request, jsonify
from scripts.llm_qa import LLMQueryEngine
from scripts.query_knowledge_base import QueryEngine
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

app = Flask(__name__)

# Initialize engines
query_engine = None
llm_engine = None

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/api/search', methods=['POST'])
def search():
    """API endpoint for searching the knowledge base."""
    try:
        data = request.json
        query = data.get('query', '')
        top_k = data.get('top_k', 5)
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
            
        # Initialize engine if needed
        global query_engine
        if query_engine is None:
            query_engine = QueryEngine()
            
        # Perform search
        matches = query_engine.hybrid_search(query, top_k=top_k)
        
        # Format results
        results = []
        for match in matches:
            results.append({
                'text': match['metadata']['text'],
                'source': match['metadata']['source'],
                'score': match['score']
            })
            
        return jsonify({"results": results})
        
    except Exception as e:
        app.logger.error(f"Error in search: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ask', methods=['POST'])
def ask():
    """API endpoint for asking questions with LLM."""
    try:
        data = request.json
        query = data.get('query', '')
        model = data.get('model', 'gpt-3.5-turbo')
        include_context = data.get('include_context', False)
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
            
        # Check if OpenAI key is set
        if not os.environ.get('OPENAI_API_KEY'):
            return jsonify({
                "error": "OpenAI API key not set. Please add OPENAI_API_KEY to your environment variables."
            }), 400
            
        # Initialize engine if needed
        global llm_engine
        if llm_engine is None:
            llm_engine = LLMQueryEngine()
            
        # Process question
        result = llm_engine.ask(query, model=model)
        
        # Remove context if not requested
        if not include_context:
            result.pop('context', None)
            
        return jsonify(result)
        
    except Exception as e:
        app.logger.error(f"Error in ask: {e}")
        return jsonify({"error": str(e)}), 500

def create_templates_folder():
    """Create the templates folder and HTML file if they don't exist."""
    templates_dir = os.path.join(os.path.dirname(__file__), 'templates')
    os.makedirs(templates_dir, exist_ok=True)
    
    index_html = os.path.join(templates_dir, 'index.html')
    if not os.path.exists(index_html):
        with open(index_html, 'w', encoding='utf-8') as f:
            f.write("""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Knowledge Base Explorer</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .result-card {
            margin-bottom: 15px;
            border-left: 4px solid #0d6efd;
        }
        .score-badge {
            font-size: 0.8rem;
        }
        .source {
            font-style: italic;
            color: #6c757d;
        }
        .loading {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container mt-4">
        <h1 class="mb-4">Knowledge Base Explorer</h1>
        
        <ul class="nav nav-tabs mb-4" id="queryTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="search-tab" data-bs-toggle="tab" data-bs-target="#search-pane" type="button" role="tab">Search Documents</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="ask-tab" data-bs-toggle="tab" data-bs-target="#ask-pane" type="button" role="tab">Ask Questions (LLM)</button>
            </li>
        </ul>
        
        <div class="tab-content" id="queryTabsContent">
            <!-- Search Tab -->
            <div class="tab-pane fade show active" id="search-pane" role="tabpanel">
                <div class="row mb-4">
                    <div class="col">
                        <div class="input-group">
                            <input type="text" id="searchQuery" class="form-control" placeholder="Search the knowledge base...">
                            <button class="btn btn-primary" id="searchButton">Search</button>
                        </div>
                    </div>
                </div>
                
                <div class="loading text-center" id="searchLoading">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Searching documents...</p>
                </div>
                
                <div id="searchResults"></div>
            </div>
            
            <!-- Ask Tab -->
            <div class="tab-pane fade" id="ask-pane" role="tabpanel">
                <div class="row mb-4">
                    <div class="col">
                        <div class="input-group">
                            <input type="text" id="askQuery" class="form-control" placeholder="Ask a question...">
                            <button class="btn btn-success" id="askButton">Ask</button>
                        </div>
                        <div class="form-text">Uses LLM to generate answers based on the knowledge base.</div>
                    </div>
                </div>
                
                <div class="loading text-center" id="askLoading">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Processing your question...</p>
                </div>
                
                <div id="askAnswer" class="d-none">
                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <span>Answer</span>
                            <span class="badge bg-secondary" id="modelBadge"></span>
                        </div>
                        <div class="card-body">
                            <div id="answerText"></div>
                        </div>
                    </div>
                    
                    <div class="accordion" id="contextAccordion">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="contextHeader">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#contextCollapse">
                                    Show Source Context
                                </button>
                            </h2>
                            <div id="contextCollapse" class="accordion-collapse collapse" data-bs-parent="#contextAccordion">
                                <div class="accordion-body" id="contextContent">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Search functionality
        document.getElementById('searchButton').addEventListener('click', async () => {
            const query = document.getElementById('searchQuery').value.trim();
            if (!query) return;
            
            const resultsDiv = document.getElementById('searchResults');
            const loadingDiv = document.getElementById('searchLoading');
            
            // Show loading
            resultsDiv.innerHTML = '';
            loadingDiv.style.display = 'block';
            
            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query, top_k: 5 })
                });
                
                const data = await response.json();
                
                // Hide loading
                loadingDiv.style.display = 'none';
                
                if (data.error) {
                    resultsDiv.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                    return;
                }
                
                if (!data.results || data.results.length === 0) {
                    resultsDiv.innerHTML = `<div class="alert alert-warning">No results found for "${query}"</div>`;
                    return;
                }
                
                // Display results
                let html = `<h3>Results for "${query}"</h3>`;
                
                data.results.forEach((result, index) => {
                    const score = Math.round(result.score * 100);
                    html += `
                        <div class="card result-card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h5 class="card-title">Result ${index + 1}</h5>
                                    <span class="badge bg-primary score-badge">Match: ${score}%</span>
                                </div>
                                <p class="source">Source: ${result.source}</p>
                                <p class="card-text">${result.text}</p>
                            </div>
                        </div>
                    `;
                });
                
                resultsDiv.innerHTML = html;
                
            } catch (error) {
                loadingDiv.style.display = 'none';
                resultsDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
            }
        });
        
        // Ask functionality
        document.getElementById('askButton').addEventListener('click', async () => {
            const query = document.getElementById('askQuery').value.trim();
            if (!query) return;
            
            const answerDiv = document.getElementById('askAnswer');
            const answerText = document.getElementById('answerText');
            const contextContent = document.getElementById('contextContent');
            const modelBadge = document.getElementById('modelBadge');
            const loadingDiv = document.getElementById('askLoading');
            
            // Show loading, hide answer
            answerDiv.classList.add('d-none');
            loadingDiv.style.display = 'block';
            
            try {
                const response = await fetch('/api/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        query, 
                        model: 'gpt-3.5-turbo',
                        include_context: true
                    })
                });
                
                const data = await response.json();
                
                // Hide loading
                loadingDiv.style.display = 'none';
                
                if (data.error) {
                    answerText.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                    answerDiv.classList.remove('d-none');
                    return;
                }
                
                // Display answer
                modelBadge.textContent = data.model || 'Unknown model';
                answerText.innerHTML = data.answer.replace(/\\n/g, '<br>');
                
                // Display context if available
                if (data.context) {
                    contextContent.innerHTML = `<pre>${data.context}</pre>`;
                } else {
                    contextContent.innerHTML = '<p>No context available.</p>';
                }
                
                answerDiv.classList.remove('d-none');
                
            } catch (error) {
                loadingDiv.style.display = 'none';
                answerText.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
                answerDiv.classList.remove('d-none');
            }
        });
        
        // Enter key handlers
        document.getElementById('searchQuery').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('searchButton').click();
            }
        });
        
        document.getElementById('askQuery').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('askButton').click();
            }
        });
    </script>
</body>
</html>""")
    
    # Create static folder if it doesn't exist
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    os.makedirs(static_dir, exist_ok=True)

def main():
    parser = argparse.ArgumentParser(description='Run the knowledge base web application')
    parser.add_argument('--host', default='127.0.0.1', help='Host to run the server on')
    parser.add_argument('--port', type=int, default=5000, help='Port to run the server on')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    args = parser.parse_args()
    
    # Create necessary directories and files
    create_templates_folder()
    
    print(f"Starting knowledge base web application on http://{args.host}:{args.port}")
    print("Press Ctrl+C to quit")
    
    app.run(host=args.host, port=args.port, debug=args.debug)

if __name__ == '__main__':
    main() 