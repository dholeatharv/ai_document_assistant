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

# Architecture

The system follows a **Retrieval Augmented Generation pipeline**.
User Question
↓
Generate Query Embedding
↓
Vector Search (FAISS)
↓
Retrieve Top-K Document Chunks
↓
Pass Context + Question to LLM
↓
Stream Response to UI


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

# Project Structure
ai_document_assistant
│
├── backend
│ ├── main.py
│ ├── rag.py
│ ├── vector_store.py
│ ├── embeddings.py
│ ├── pdf_utils.py
│ ├── storage.py
│ ├── schemas.py
│ └── requirements.txt
│
├── frontend
│ ├── src
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── vite.config.js
│ └── package.json
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
