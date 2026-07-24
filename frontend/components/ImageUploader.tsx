"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, Loader2, X, ImageIcon, AlertCircle } from "lucide-react";
import { uploadApi } from "@/lib/api";

export default function ImageUploader({
  value,
  onChange,
  folder = "recipes",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: "recipes" | "avatars" | "blog";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const res = await uploadApi.image(file, folder === "blog" ? "recipes" : folder);
      onChange(res.data.url);
    } catch {
      setError("Upload failed. Make sure you're signed in and the file is an image under 5MB.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const isAvatar = folder === "avatars";

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        /* Image Preview Card */
        <div
          className={`group relative overflow-hidden rounded-2xl border border-line/80 bg-paper shadow-sm backdrop-blur-md ${
            isAvatar ? "h-28 w-28 rounded-full mx-auto" : "aspect-[16/9] w-full"
          }`}
        >
          <Image
            src={value}
            alt="Uploaded preview"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Remove Image Overlay Button */}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-ink/80 p-1.5 text-white shadow-md backdrop-blur-md transition-all hover:bg-rose-600 hover:scale-110 active:scale-95"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Dropzone Trigger Button */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`group relative flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line/80 bg-paper/60 p-4 text-ink/60 shadow-inner transition-all hover:border-plum/60 hover:bg-plum/5 hover:text-plum focus:outline-none ${
            isAvatar
              ? "h-28 w-28 rounded-full mx-auto"
              : "aspect-[16/9] w-full rounded-2xl"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1.5">
              <Loader2 className="h-5 w-5 animate-spin text-plum" />
              <span className="font-mono text-[10px] font-semibold text-plum">Uploading...</span>
            </div>
          ) : (
            <>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-plum/10 text-plum transition-transform group-hover:scale-110">
                <UploadCloud className="h-4 w-4" />
              </div>
              <div className="text-center px-2">
                <p className="text-xs font-semibold text-ink group-hover:text-plum">
                  {isAvatar ? "Upload Photo" : "Upload High-Res Cover Photo"}
                </p>
                {!isAvatar && (
                  <p className="mt-0.5 font-mono text-[10px] text-ink/40">
                    PNG, JPG or WebP (max 5MB)
                  </p>
                )}
              </div>
            </>
          )}
        </button>
      )}

      {/* Error Feedback */}
      {error && (
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-rose-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}