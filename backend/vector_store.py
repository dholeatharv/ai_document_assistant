import faiss
import numpy as np
from embeddings import get_embedding

chunk_records = []
index = None


def chunk_text(text: str, chunk_size: int = 120, overlap: int = 40):
    words = text.split()
    chunks = []

    start = 0
    step = chunk_size - overlap

    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end]).strip()

        if chunk:
            chunks.append(chunk)

        start += step

    return chunks


def rebuild_faiss_index():
    global index, chunk_records

    if not chunk_records:
        index = None
        return

    embeddings = [record["embedding"] for record in chunk_records]
    embedding_matrix = np.array(embeddings).astype("float32")

    dimension = embedding_matrix.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embedding_matrix)


def clear_index():
    global chunk_records, index
    chunk_records = []
    index = None


def add_document(text: str, document_name: str):
    global chunk_records

    chunks = chunk_text(text, chunk_size=120, overlap=40)

    if not chunks:
        raise ValueError("No valid text found to index.")

    start_index = len(chunk_records)

    for offset, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)

        chunk_records.append(
            {
                "chunk_id": start_index + offset,
                "document_name": document_name,
                "text": chunk,
                "embedding": embedding,
            }
        )

    rebuild_faiss_index()
    return len(chunks)


def rebuild_from_saved_documents(saved_documents):
    clear_index()

    for doc in saved_documents:
        add_document(doc["text"], doc["name"])


def search_similar_chunks(question: str, k: int = 3):
    global index, chunk_records

    if index is None or not chunk_records:
        raise ValueError("No documents have been uploaded and indexed yet.")

    question_embedding = get_embedding(question)
    query_vector = np.array([question_embedding]).astype("float32")

    distances, indices = index.search(query_vector, min(k, len(chunk_records)))

    results = []
    for rank, i in enumerate(indices[0], start=1):
        results.append(
            {
                "rank": rank,
                "chunk_id": chunk_records[i]["chunk_id"],
                "document_name": chunk_records[i]["document_name"],
                "text": chunk_records[i]["text"],
            }
        )

    return results


def get_document_count():
    return len({record["document_name"] for record in chunk_records})


def get_documents():
    grouped = {}

    for record in chunk_records:
        name = record["document_name"]
        grouped.setdefault(name, 0)
        grouped[name] += 1

    documents = []
    for name, chunk_count in grouped.items():
        file_type = "PDF" if name.lower().endswith(".pdf") else "TXT"
        documents.append(
            {
                "name": name,
                "type": file_type,
                "status": "Indexed",
                "chunks": chunk_count,
            }
        )

    documents.sort(key=lambda d: d["name"].lower())
    return documents