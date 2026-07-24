"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, X, Loader2, ImagePlus, AlertCircle } from "lucide-react";
import { uploadApi } from "@/lib/api";

export default function GalleryUploader({
  value,
  onChange,
  max = 6,
  folder = "recipes",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  folder?: "recipes" | "avatars";
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
      const res = await uploadApi.image(file, folder);
      onChange([...value, res.data.url]);
    } catch {
      setError("Upload failed. Make sure you're signed in and the file is an image under 5MB.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Grid Container */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {/* Thumbnails */}
        {value.map((url, i) => (
          <div
            key={url + i}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-line/80 bg-paper shadow-xs transition-all hover:border-plum/40 hover:shadow-md"
          >
            <Image
              src={url}
              alt={`Photo ${i + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-108"
            />
            {/* Remove Badge */}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1.5 top-1.5 rounded-full bg-ink/80 p-1 text-white shadow-md backdrop-blur-md transition-all hover:bg-rose-600 hover:scale-110 active:scale-95"
              aria-label={`Remove photo ${i + 1}`}
            >
              <X className="h-3 w-3" />
            </button>
            <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/40 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white backdrop-blur-xs">
              #{i + 1}
            </span>
          </div>
        ))}

        {/* Add Tile Button */}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="group flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-line/80 bg-paper/60 p-2 text-ink/60 shadow-inner transition-all hover:border-plum/60 hover:bg-plum/5 hover:text-plum focus:outline-none"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-plum" />
                <span className="font-mono text-[10px] font-semibold text-plum">Uploading</span>
              </>
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-plum/10 text-plum transition-transform group-hover:scale-110">
                  <ImagePlus className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-semibold text-ink group-hover:text-plum">Add Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Helper & Counter Bar */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-ink/50">
        <span>Upload extra angles, ingredient shots, or plating photos.</span>
        <span className="font-mono font-semibold text-plum">
          {value.length} / {max}
        </span>
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}