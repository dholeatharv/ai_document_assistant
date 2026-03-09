from io import BytesIO
from pypdf import PdfReader


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(pdf_bytes))

    extracted_pages = []

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            extracted_pages.append(page_text)

    full_text = "\n".join(extracted_pages).strip()

    if not full_text:
        raise ValueError("No extractable text found in the PDF.")

    return full_text