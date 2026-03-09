from openai import OpenAI
from vector_store import search_similar_chunks

client = OpenAI()


def answer_question(question: str):
    retrieved_results = search_similar_chunks(question, k=3)

    context_chunks = [item["text"] for item in retrieved_results]
    context = "\n\n".join(context_chunks)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful document assistant. "
                    "Answer the question using only the provided context. "
                    "If the answer is not in the context, say you do not know."
                ),
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}",
            },
        ],
    )

    answer = response.choices[0].message.content

    source_documents = list({item["document_name"] for item in retrieved_results})

    return {
        "answer": answer,
        "sources": source_documents,
        "retrieved_results": retrieved_results,
    }


def stream_answer(question: str):
    retrieved_results = search_similar_chunks(question, k=3)

    context_chunks = [item["text"] for item in retrieved_results]
    context = "\n\n".join(context_chunks)

    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful document assistant. "
                    "Answer the question using only the provided context. "
                    "If the answer is not in the context, say you do not know."
                ),
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}",
            },
        ],
        stream=True,
    )

    def token_generator():
        for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                yield token

    return token_generator