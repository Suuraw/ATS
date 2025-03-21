import sys
import pdfplumber
import docx
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')  # Add this line for Python 3.7+

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    try:
        text = ""
        page_count = 0
        logger.info(f"Opening PDF file: {pdf_path}")
        
        with pdfplumber.open(pdf_path) as pdf:
            page_count = len(pdf.pages)
            logger.info(f"Detected {page_count} pages in the PDF")
            
            if page_count == 0:
                logger.warning("PDF contains no pages")
                return "Error: Empty PDF file"
                
            for page_num, page in enumerate(pdf.pages, 1):
                logger.info(f"Processing page {page_num} of {page_count}")
                page_text = page.extract_text()
                
                if page_text:
                    text += f"\n--- Page {page_num} ---\n" + page_text
                else:
                    logger.warning(f"No text extracted from page {page_num}")
                    text += f"\n--- Page {page_num} ---\n[No text extracted]"
        
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
        text = ""
        page_num = 1
        
        for para in doc.paragraphs:
            if para.text.strip():
                text += para.text + "\n"
            if para.text.strip() == "" and len(text) > 0:
                text += f"\n--- Page {page_num} End ---\n"
                page_num += 1
                
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
        print("Error: No file provided", file=sys.stderr)
        return

    file_path = sys.argv[1]
    logger.info(f"Processing file: {file_path}")

    try:
        if file_path.lower().endswith(".pdf"):
            result = extract_text_from_pdf(file_path)
        elif file_path.lower().endswith(".docx"):
            result = extract_text_from_docx(file_path)
        else:
            print("Error: Unsupported file format. Please use PDF or DOCX files.", file=sys.stderr)
            return

        # Print with page count information, handling Unicode
        page_count = result.count("--- Page") if not result.startswith("Error:") else 0
        try:
            print(f"\nExtracted text from {page_count} pages:")
            print(result)
        except UnicodeEncodeError as e:
            # Fallback: encode and decode to handle problematic characters
            logger.warning(f"Unicode encoding issue: {str(e)}. Attempting fallback.")
            print(result.encode('utf-8', errors='replace').decode('utf-8'))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        print(f"Error: {str(e)}", file=sys.stderr)

if __name__ == "__main__":
    main()