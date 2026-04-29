"use client";

import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";

interface ImageUploaderProps {
  existingUrl?: string;
  onFileChange: (file: File | null) => void;
  onClear: () => void;
}

export function ImageUploader({ existingUrl, onFileChange, onClear }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl ?? null);
  const [hasExisting, setHasExisting] = useState(Boolean(existingUrl));
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl && !hasExisting) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setHasExisting(false);
    onFileChange(file);
  }

  function handleClear() {
    if (previewUrl && !hasExisting) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setHasExisting(false);
    onFileChange(null);
    onClear();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-base font-medium text-gray-700">Picture</p>

      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Word picture preview"
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 flex items-end justify-between p-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold bg-white/90 px-3 py-1.5 rounded-full text-gray-700 shadow-sm active:bg-white"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-white/90 rounded-full p-1.5 shadow-sm active:bg-white"
              aria-label="Remove picture"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-36 flex flex-col items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 active:bg-gray-100 transition-colors"
        >
          <Camera className="w-6 h-6" />
          <span className="text-sm font-medium">Add a picture</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
