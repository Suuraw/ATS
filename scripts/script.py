import sys
import pdfplumber
import docx
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    try:
        text = ""
        logger.info(f"Opening PDF file: {pdf_path}")
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                logger.info(f"Processing page {page_num}")
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
                else:
                    logger.warning(f"No text extracted from page {page_num}")
        
        if not text.strip():
            logger.warning("No text was extracted from the PDF")
            return "Error: No text could be extracted from the PDF"
            
        return text.strip()
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        return f"Error: {str(e)}"

# Function to extract text from DOCX
def extract_text_from_docx(docx_path):
    try:
        logger.info(f"Opening DOCX file: {docx_path}")
        doc = docx.Document(docx_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        
        if not text.strip():
            logger.warning("No text was extracted from the DOCX")
            return "Error: No text could be extracted from the DOCX"
            
        return text.strip()
    except Exception as e:
        logger.error(f"Error processing DOCX: {str(e)}")
        return f"Error: {str(e)}"

# Main function
def main():
    if len(sys.argv) < 2:
        print("Error: No file provided")
        return

    file_path = sys.argv[1]
    logger.info(f"Processing file: {file_path}")

    try:
        if file_path.lower().endswith(".pdf"):
            result = extract_text_from_pdf(file_path)
        elif file_path.lower().endswith(".docx"):
            result = extract_text_from_docx(file_path)
        else:
            print("Error: Unsupported file format. Please use PDF or DOCX files.")
            return

        print(result)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
