import requests
from bs4 import BeautifulSoup
import PyPDF2
from docx import Document
import io
import logging

def parse_url(url: str) -> str:
    try:
        resp = requests.get(url, timeout=10)
        soup = BeautifulSoup(resp.content, "html.parser")
        paragraphs = soup.find_all("p")
        return " ".join([p.text for p in paragraphs])
    except Exception as e:
        logging.error(f"URL parsing failed: {e}")
        return ""

def parse_pdf(file_bytes: bytes) -> str:
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + " "
        return text
    except Exception as e:
        logging.error(f"PDF parsing failed: {e}")
        return ""

def parse_docx(file_bytes: bytes) -> str:
    try:
        doc = Document(io.BytesIO(file_bytes))
        return " ".join([p.text for p in doc.paragraphs])
    except Exception as e:
        logging.error(f"DOCX parsing failed: {e}")
        return ""
