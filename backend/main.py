from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from schemas import QuestionRequest
from rag import answer_question, stream_answer
from vector_store import (
    add_document,
    get_document_count,
    get_documents,
    rebuild_from_saved_documents,
)
from pdf_utils import extract_text_from_pdf
from storage import load_documents, save_documents


@asynccontextmanager
async def lifespan(app: FastAPI):
    saved_documents = load_documents()
    if saved_documents:
        rebuild_from_saved_documents(saved_documents)
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://your-frontend-name.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "AI Document Assistant backend is running"}


@app.get("/status")
def get_status():
    return {"documents_indexed": get_document_count()}


@app.get("/documents")
def list_documents():
    return {"documents": get_documents()}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        if not file.filename:
            raise HTTPException(
                status_code=400, detail="Uploaded file must have a filename."
            )

        content = await file.read()

        if file.filename.endswith(".txt"):
            text = content.decode("utf-8", errors="ignore")
        elif file.filename.endswith(".pdf"):
            text = extract_text_from_pdf(content)
        else:
            raise HTTPException(
                status_code=400,
                detail="Only .txt and .pdf files are supported for now",
            )

        saved_documents = load_documents()

        already_exists = any(doc["name"] == file.filename for doc in saved_documents)
        if already_exists:
            raise HTTPException(
                status_code=400,
                detail=f"Document '{file.filename}' is already uploaded.",
            )

        chunk_count = add_document(text, file.filename)

        saved_documents.append(
            {
                "name": file.filename,
                "text": text,
            }
        )
        save_documents(saved_documents)

        return {
            "message": f"File '{file.filename}' uploaded and indexed successfully.",
            "chunks_added": chunk_count,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/ask")
def ask_question(request: QuestionRequest):
    try:
        result = answer_question(request.question)

        return {
            "question": request.question,
            "answer": result["answer"],
            "sources": result["sources"],
            "retrieved_results": result["retrieved_results"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/ask-stream")
def ask_stream(request: QuestionRequest):
    try:
        generator = stream_answer(request.question)
        return StreamingResponse(generator(), media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))