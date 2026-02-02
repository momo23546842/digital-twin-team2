"use client";

import { CheckCircle, FileText, Loader2, Upload, X, AlertCircle } from "lucide-react";
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
  const [statusType, setStatusType] = useState<"info" | "success" | "error">("info");
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
      setStatusType("info");
      const text = await extractPdfText(file);
      if (!text.trim()) {
        throw new Error(`Could not extract text from "${file.name}". The PDF may be image-based or empty.`);
      }
      return text;
    }
    
    // Handle text files
    const content = await file.text();
    
    // Validate it's actually text
    const MAX_BINARY_CHECK_CHARS = 10 * 1024; // Check only the first 10KB for binary content
    const sampleContent =
      content.length > MAX_BINARY_CHECK_CHARS
        ? content.slice(0, MAX_BINARY_CHECK_CHARS)
        : content;
    const nonPrintableCount =
      (sampleContent.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length;
    const sampleLength = sampleContent.length || 1;
    const binaryRatio = nonPrintableCount / sampleLength;
    
    if (binaryRatio > 0.1) {
      throw new Error(`"${file.name}" appears to be a binary file. Please upload text files or PDFs.`);
    }
    
    return content;
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setStatus("Processing files...");
    setStatusType("info");

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
      setStatusType("success");
      setTimeout(() => setStatus(""), 5000); // Clear after 5 seconds
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload documents";
      setStatus(`Error: ${errorMessage}`);
      setStatusType("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 pt-4 pb-2">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* File info & buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 
                       text-gray-600 text-sm font-medium transition-all duration-200
                       hover:bg-gray-200 hover:text-gray-800 hover:border-gray-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Select Files
            </button>

            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading || isLoading}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                ${files.length > 0 && !uploading && !isLoading
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {files.length > 0 && `(${files.length})`}
                </>
              )}
            </button>
          </div>

          {/* Status message */}
          {status && (
            <div className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm
              ${statusType === "error" 
                ? "bg-red-50 text-red-600 border border-red-200" 
                : statusType === "success" 
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-primary-50 text-primary-600 border border-primary-200"
              }
            `}>
              {statusType === "error" ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              ) : statusType === "success" ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
              )}
              <span className="truncate">{status}</span>
            </div>
          )}

          {/* Supported formats hint */}
          {!status && files.length === 0 && (
            <span className="text-xs text-gray-400">
              Supports: .txt, .md, .pdf
            </span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".txt,.md,.text,.markdown,.pdf"
        />

        {/* Selected files */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="group flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-sm
                         transition-all duration-200 hover:bg-gray-200 hover:border-gray-300"
              >
                <FileText className="w-4 h-4 text-primary-500" />
                <span className="text-gray-600 truncate max-w-[180px]">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
