'use client';

import { useState, useRef, useCallback } from 'react';
import { SUPPORTED_EXTENSIONS } from '@/lib/types';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
    const extension = '.' + file.name.toLowerCase().split('.').pop();
    return SUPPORTED_EXTENSIONS.includes(extension as typeof SUPPORTED_EXTENSIONS[number]);
  }, []);

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      alert(`Unsupported file type. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`);
    }
  }, [onFileSelect, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const acceptedTypes = SUPPORTED_EXTENSIONS.join(',');

  return (
    <div className="w-full max-w-xl mx-auto mb-6">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragging
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-white/20 hover:border-violet-500/50 hover:bg-white/5'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleInputChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-violet-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {selectedFile ? (
            <div>
              <p className="text-lg font-medium text-white">{selectedFile.name}</p>
              <p className="text-sm text-white/40">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold text-white">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-white/40 mt-1">
                PDF, DOCX, PPTX, TXT, or Images
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedFile && !isLoading && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          className="mt-3 text-sm text-white/40 hover:text-white/70 underline"
        >
          Remove file
        </button>
      )}
    </div>
  );
}
