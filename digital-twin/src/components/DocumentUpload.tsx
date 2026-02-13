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

  const extractPdfText = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const textParts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        textParts.push(pageText);
      }
      return textParts.join("\n\n");
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const readFileContent = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".pdf")) {
      setStatus(`Extracting text from ${file.name}...`);
      setStatusType("info");
      const text = await extractPdfText(file);
      if (!text.trim()) throw new Error(`Could not extract text from "${file.name}".`);
      return text;
    }
    const content = await file.text();
    const sample = content.slice(0, 10240);
    const binaryRatio = (sample.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length / (sample.length || 1);
    if (binaryRatio > 0.1) throw new Error(`"${file.name}" appears to be a binary file.`);
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed (${response.status})`);
      }

      const result = await response.json();
      if (onUpload) onUpload(documents);

      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setStatus(`✓ Ingested ${documents.length} document(s) — ${result.vectorCount || 0} chunks`);
      setStatusType("success");
      setTimeout(() => setStatus(""), 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload";
      setStatus(`Error: ${errorMessage}`);
      setStatusType("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Select Files Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600
                       text-slate-300 text-sm font-medium transition-all duration-200
                       hover:bg-slate-600 hover:text-white hover:border-slate-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            Select Files
          </button>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading || isLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${files.length > 0 && !uploading && !isLoading
                ? "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500"
                : "bg-slate-700 text-slate-500 border border-slate-600 cursor-not-allowed"
              }`}
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>
            ) : (
              <><Upload className="w-4 h-4" />Upload {files.length > 0 && `(${files.length})`}</>
            )}
          </button>

          {/* Status */}
          {status && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
              ${statusType === "error" ? "bg-red-900/40 text-red-400 border border-red-700"
                : statusType === "success" ? "bg-emerald-900/40 text-emerald-400 border border-emerald-700"
                : "bg-slate-700 text-slate-300 border border-slate-600"}`}>
              {statusType === "error" ? <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                : statusType === "success" ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                : <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />}
              <span className="truncate max-w-xs">{status}</span>
            </div>
          )}

          {/* Hint */}
          {!status && files.length === 0 && (
            <span className="text-xs text-slate-500">Supports: .txt, .md, .pdf</span>
          )}
        </div>

        {/* Selected files list */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={index}
                className="flex items-center gap-2 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[160px]">{file.name}</span>
                <button onClick={() => removeFile(index)} className="text-slate-500 hover:text-red-400 transition-colors ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
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
    </div>
  );
}
