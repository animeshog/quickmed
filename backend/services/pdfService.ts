import pdf from "pdf-parse";

export async function processFile(file: Express.Multer.File): Promise<string> {
  try {
    if (file.mimetype === "application/pdf") {
      // Use pdf-parse to extract text from buffer
      const data = await pdf(file.buffer);
      const text = (data && data.text) ? String(data.text).trim() : "";
      if (!text) {
        return `Failed to extract text from PDF: ${file.originalname}`;
      }
      return text;
    } else if (file.mimetype.startsWith("image/")) {
      // For images, we don't perform OCR here; return a simple message
      return `Image file received: ${file.originalname}`;
    } else {
      throw new Error("Unsupported file type");
    }
  } catch (error) {
    console.error("File processing error:", error);
    return "Failed to process file. Please try again with a different file.";
  }
}
