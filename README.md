# AI Document Assistant

A full-stack **AI-powered document question answering system** that allows users to upload documents and ask natural language questions.  
The system retrieves relevant context using vector similarity search and generates grounded answers using a language model.

## Live Demo
https://ai-document-assistant-seven.vercel.app
---

# Overview

AI Document Assistant is a **Retrieval Augmented Generation (RAG)** application that enables users to interact with documents through natural language.

Instead of generating answers purely from a language model, the system retrieves the most relevant document chunks using embeddings and vector search, ensuring answers are **context-aware, explainable, and grounded in real data**.

Users can:

- Upload TXT or PDF documents  
- Ask questions about the uploaded content  
- Receive answers generated from retrieved document context  
- View the source evidence used to generate the response  

This architecture is commonly used in modern:

- AI knowledge assistants  
- enterprise search tools  
- LLM-powered copilots  

---

## 🏗️ System Architecture

The application follows a **Retrieval-Augmented Generation (RAG)** architecture:

User
│
│  Upload Document
▼
FastAPI Backend
│
│  Extract Text
▼
Document Chunking
│
│  Generate Embeddings
▼
Vector Store (FAISS)
│
│
│  User Question
▼
Query Embedding
│
▼
Vector Similarity Search
│
▼
Top-K Relevant Chunks
│
▼
LLM (OpenAI API)
│
▼
Generated Answer
│
▼
React Frontend (Streaming Response + Sources)



---

# Tech Stack

## Frontend
- React
- Vite
- TailwindCSS
- Motion (Framer Motion)
- Lucide Icons

## Backend
- FastAPI
- Python
- OpenAI API
- FAISS (vector similarity search)

## Document Processing
- PyPDF
- Text chunking
- Embedding generation

## Infrastructure
- Vercel (Frontend hosting)
- Render (Backend hosting)
- GitHub for version control

---

# Key Features

## Document Upload
Supports TXT and PDF files and automatically indexes them.

## Semantic Search
Documents are split into chunks and embedded into vectors.  
FAISS performs fast similarity search to retrieve the most relevant content.

## Grounded AI Responses
Answers are generated only using retrieved document context, improving accuracy and reducing hallucinations.

## Streaming Responses
Responses are streamed to the UI for a real-time conversational experience.

## Source Evidence
The interface displays the exact chunks used to generate answers, improving transparency.

## Modern UI
Professional chat interface with evidence panels and document upload workflow.

---

## 📁 Project Structure

ai_document_assistant
│
├── backend
│   ├── main.py              # FastAPI entry point and API routes
│   ├── rag.py               # Retrieval-Augmented Generation pipeline
│   ├── vector_store.py      # FAISS vector indexing and similarity search
│   ├── embeddings.py        # OpenAI embedding generation
│   ├── pdf_utils.py         # PDF text extraction utilities
│   ├── storage.py           # Document persistence layer
│   ├── schemas.py           # Pydantic request/response models
│   └── requirements.txt     # Python dependencies
│
├── frontend
│   ├── src
│   │   ├── App.jsx          # Main React UI application
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # TailwindCSS styling
│   │
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # Frontend dependencies
│
└── README.md



---

# Running Locally

## Backend

```bash
cd backend
pip install -r requirements.txt
export OPENAI_API_KEY=your_api_key
uvicorn main:app --reload --port 8002
```
http://localhost:8002/docs

## Frontend
``` bash
cd frontend
npm install
npm run dev
```
http://localhost:5173

## Example Workflow

1.User uploads a document
2.System extracts text from the document
3.Text is split into chunks
4.Each chunk is converted into embeddings
5.FAISS indexes the vectors
6.User asks a question
7.Query embedding is generated
8.Vector search retrieves relevant chunks
9.Context + question are sent to the LLM
10.The generated answer is streamed back to the user

## Why This Project Matters

Large language models alone cannot reliably access external knowledge.
Retrieval Augmented Generation solves this by combining:

- Vector search
- Knowledge retrieval
- Language model reasoning

This architecture is used in many real-world AI systems including:
- AI knowledge assistants
- enterprise search platforms
- developer copilots
- document intelligence systems

## Future Improvements

Persistent vector database (Pinecone / Weaviate)
User authentication
Multi-document collections
Chat history persistence
Cloud file storage
Hybrid semantic + keyword search
Monitoring and analytics

## Author

Atharv Dhole
