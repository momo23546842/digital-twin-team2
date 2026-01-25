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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    try {
      const documents = await Promise.all(
        files.map(async (file) => {
          const content = await file.text();
          return {
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content,
            title: file.name,
            source: "file-upload",
          };
        })
      );

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
      alert(`Successfully ingested ${documents.length} document(s)`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload documents");
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
            ({files.length} selected)
          </span>
        </div>

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
          accept=".txt,.md,.pdf"
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
