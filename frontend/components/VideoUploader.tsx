"use client";

import { useRef, useState } from "react";
import { Video, Loader2, X, Film, UploadCloud, AlertCircle } from "lucide-react";
import { uploadApi } from "@/lib/api";

export default function VideoUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
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
      const res = await uploadApi.video(file);
      onChange(res.data.url);
    } catch {
      setError("Upload failed. Make sure you're signed in and the file is a video under 50MB.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        /* Video Preview Player Card */
        <div className="group relative w-full overflow-hidden rounded-2xl border border-line/80 bg-paper shadow-sm backdrop-blur-md">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={value}
            controls
            className="aspect-video w-full rounded-2xl bg-black/5 object-cover"
          />
          
          {/* Overlay Remove Button */}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-3 rounded-full bg-ink/80 p-2 text-white shadow-md backdrop-blur-md transition-all hover:bg-rose-600 hover:scale-110 active:scale-95"
            aria-label="Remove video"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Dropzone Upload Button */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="group relative flex aspect-video w-full flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-line/80 bg-paper/60 p-6 text-ink/60 shadow-inner transition-all hover:border-plum/60 hover:bg-plum/5 hover:text-plum focus:outline-none"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-plum" />
              <span className="font-mono text-xs font-semibold text-plum">Uploading Video Reel...</span>
              <span className="text-[10px] text-ink/40">Please wait while your media is processing</span>
            </div>
          ) : (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-plum/10 text-plum transition-transform group-hover:scale-110">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-ink group-hover:text-plum">
                  Click to upload a recipe video reel
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-ink/40">
                  MP4, WebM or MOV (max 50MB · Optional)
                </p>
              </div>
            </>
          )}
        </button>
      )}

      {/* Error Message Pill */}
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}