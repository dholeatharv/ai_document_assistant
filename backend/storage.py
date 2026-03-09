import json
import os

DATA_DIR = "data"
DATA_FILE = os.path.join(DATA_DIR, "documents.json")


def ensure_data_file():
    os.makedirs(DATA_DIR, exist_ok=True)

    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)


def load_documents():
    ensure_data_file()

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_documents(documents):
    ensure_data_file()

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(documents, f, ensure_ascii=False, indent=2)