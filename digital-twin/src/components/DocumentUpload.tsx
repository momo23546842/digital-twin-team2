"use client";

import { CheckCircle, FileText, Loader2, Upload, X, AlertCircle, Plus, File } from "lucide-react";
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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const extractPdfText = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      
      const arrayBuffer = await file.arrayBuffer();
      let pdf;
      try {
        pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      } catch (error) {
        console.error("Error loading PDF via pdfjs-dist.", error);
        throw new Error("Failed to load PDF worker.");
      }
      
      const textParts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        textParts.push(pageText);
      }
      
      return textParts.join("\n\n");
    } catch (error) {
      console.error("Error extracting PDF text.", error);
      if (error instanceof Error) throw error;
      throw new Error("Unable to extract text from PDF.");
    }
  };

  const readFileContent = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith(".pdf")) {
      setStatus(`Extracting text from ${file.name}...`);
      setStatusType("info");
      const text = await extractPdfText(file);
      if (!text.trim()) {
        throw new Error(`Could not extract text from "${file.name}".`);
      }
      return text;
    }
    
    const content = await file.text();
    const MAX_BINARY_CHECK_CHARS = 10 * 1024;
    const sampleContent = content.length > MAX_BINARY_CHECK_CHARS ? content.slice(0, MAX_BINARY_CHECK_CHARS) : content;
    const nonPrintableCount = (sampleContent.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length;
    const binaryRatio = nonPrintableCount / (sampleContent.length || 1);
    
    if (binaryRatio > 0.1) {
      throw new Error(`"${file.name}" appears to be a binary file.`);
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

      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents }),
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      console.log("Documents ingested:", result);

      if (onUpload) onUpload(documents);

      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setStatus(`Successfully ingested ${documents.length} document(s) (${result.vectorCount} chunks)`);
      setStatusType("success");
      setTimeout(() => setStatus(""), 5000);
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
        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border-2 border-dashed transition-all duration-300
            ${isDragging 
              ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
              : 'border-[var(--border)] hover:border-[var(--border-hover)]'
            }
          `}
        >
          {/* File buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]
                       text-[var(--foreground)] text-sm font-medium transition-all duration-300
                       hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)] hover:scale-[1.02]
                       disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Files</span>
              <span className="sm:hidden">Add</span>
            </button>

            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading || isLoading}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 focus-ring
                ${files.length > 0 && !uploading && !isLoading
                  ? 'bg-gradient-to-r from-[var(--primary)] to-emerald-500 text-white shadow-lg shadow-[var(--primary)]/25 hover:shadow-[var(--primary)]/40 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)] cursor-not-allowed'
                }
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload{files.length > 0 && ` (${files.length})`}</span>
                </>
              )}
            </button>
          </div>

          {/* Status message */}
          {status && (
            <div className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm animate-message-appear
              ${statusType === "error" 
                ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                : statusType === "success" 
                  ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20"
                  : "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
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
            <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
              <File className="w-3.5 h-3.5" />
              <span>Drop files here or click to browse (.txt, .md, .pdf)</span>
            </div>
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
                className="group flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm
                         transition-all duration-300 hover:border-[var(--border-hover)] hover:scale-[1.02] animate-message-appear"
              >
                <FileText className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-[var(--foreground)] truncate max-w-[150px]">{file.name}</span>
                <span className="text-[var(--foreground-muted)] text-xs">
                  {(file.size / 1024).toFixed(1)}KB
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-1 p-1 rounded-md text-[var(--foreground-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
