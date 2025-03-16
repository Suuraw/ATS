import sys
import pdfplumber
import docx

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text.strip()

# Function to extract text from DOCX
def extract_text_from_docx(docx_path):
    doc = docx.Document(docx_path)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text.strip()

# Main function
def main():
    if len(sys.argv) < 2:
        print("No file provided")
        return

    file_path = sys.argv[1]

    if file_path.endswith(".pdf"):
        print(extract_text_from_pdf(file_path))
    elif file_path.endswith(".docx"):
        print(extract_text_from_docx(file_path))
    else:
        print("Unsupported file format")

if __name__ == "__main__":
    main()
