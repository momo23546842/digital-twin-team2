"use client";

import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface DocumentUploadProps {
  onUpload?: (documents: Array<{ id: string; content: string; title: string }>) => void;
  isLoading?: boolean;
}

export default function DocumentUpload({
  onUpload,
  isLoading = false,
}: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Extract text from a PDF file using dynamically loaded pdfjs-dist
   */
  const extractPdfText = async (file: File): Promise<string> => {
    // Dynamically import pdfjs-dist only on client side
    const pdfjsLib = await import("pdfjs-dist");
    
    // Use local worker from public folder
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const textParts: string[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      textParts.push(pageText);
    }
    
    return textParts.join("\n\n");
  };

  /**
   * Read file content based on file type
   */
  const readFileContent = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();
    
    // Handle PDF files
    if (fileName.endsWith(".pdf")) {
      setStatus(`Extracting text from ${file.name}...`);
      const text = await extractPdfText(file);
      if (!text.trim()) {
        throw new Error(`Could not extract text from "${file.name}". The PDF may be image-based or empty.`);
      }
      return text;
    }
    
    // Handle text files
    const content = await file.text();
    
    // Validate it's actually text
    const nonPrintableCount = (content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length;
    const binaryRatio = nonPrintableCount / content.length;
    
    if (binaryRatio > 0.1) {
      throw new Error(`"${file.name}" appears to be a binary file. Please upload text files or PDFs.`);
    }
    
    return content;
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setStatus("Processing files...");

    try {
      const documents = await Promise.all(
        files.map(async (file) => {
          const content = await readFileContent(file);
          return {
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content,
            title: file.name,
            source: "file-upload",
          };
        })
      );

      setStatus("Uploading to knowledge base...");

      // Send to ingest API
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents }),
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      console.log("Documents ingested:", result);

      // Callback
      if (onUpload) {
        onUpload(documents);
      }

      // Clear files
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Show success message
      setStatus(`Successfully ingested ${documents.length} document(s) (${result.vectorCount} chunks)`);
      setTimeout(() => setStatus(""), 5000); // Clear after 5 seconds
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload documents";
      setStatus(`Error: ${errorMessage}`);
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Knowledge Base Documents
          </label>
          <span className="text-xs text-gray-500">
            ({files.length} selected) • Supports: .txt, .md, .pdf
          </span>
        </div>

        {status && (
          <div className={`text-sm px-3 py-2 rounded ${
            status.startsWith("Error") 
              ? "bg-red-100 text-red-700" 
              : status.startsWith("Success") 
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
          }`}>
            {status}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
          >
            <Upload size={16} />
            Select Files
          </button>

          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading || isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            Upload {files.length > 0 ? `(${files.length})` : ""}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".txt,.md,.text,.markdown,.pdf"
        />

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs"
              >
                <span className="truncate max-w-[200px]">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
