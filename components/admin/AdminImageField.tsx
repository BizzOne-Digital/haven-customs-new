"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { useToast } from "./Toast";
import { CHUNK_BYTES, DIRECT_UPLOAD_MAX_BYTES, MAX_UPLOAD_BYTES, type UploadFolder } from "@/lib/constants";

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif"];

type UploadResult = { success: true; url: string; filename: string; size: number; folder: string };

async function readJson(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error ?? `Upload failed (${res.status})`);
  return json;
}

/** Direct upload for small files; chunked (1MB parts) for larger ones up to 8MB. */
export async function uploadImage(file: File, folder: UploadFolder, onProgress?: (p: number) => void): Promise<UploadResult> {
  if (file.size <= DIRECT_UPLOAD_MAX_BYTES) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    onProgress?.(0.3);
    const json = await readJson(await fetch("/api/upload", { method: "POST", body: fd }));
    onProgress?.(1);
    return json;
  }
  const init = await readJson(
    await fetch("/api/upload/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder, totalSize: file.size, originalName: file.name }),
    })
  );
  const { sessionId, chunkCount } = init as { sessionId: string; chunkCount: number };
  try {
    for (let i = 0; i < chunkCount; i++) {
      const part = file.slice(i * CHUNK_BYTES, Math.min(file.size, (i + 1) * CHUNK_BYTES));
      let attempt = 0;
      // Chunk PUTs are idempotent, so a failed part can simply be re-sent.
      for (;;) {
        try {
          await readJson(await fetch(`/api/upload/session/${sessionId}/chunk/${i}`, { method: "PUT", body: part }));
          break;
        } catch (e) {
          if (++attempt >= 3) throw e;
        }
      }
      onProgress?.((i + 1) / (chunkCount + 1));
    }
    const done = await readJson(await fetch(`/api/upload/session/${sessionId}`, { method: "POST" }));
    onProgress?.(1);
    return done;
  } catch (e) {
    await fetch(`/api/upload/session/${sessionId}`, { method: "DELETE" }).catch(() => null);
    throw e;
  }
}

export default function AdminImageField({
  value,
  onChange,
  folder,
  label = "Image",
  disabled,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  label?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const toast = useToast();
  const busy = progress !== null;

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function onFile(file?: File) {
    if (!file) return;
    if (!ACCEPT.includes(file.type)) return toast.error("Use a JPEG, PNG, WebP or GIF image.");
    if (file.size > MAX_UPLOAD_BYTES) return toast.error("Image must be 8MB or smaller.");
    const local = URL.createObjectURL(file);
    setPreview(local);
    setProgress(0);
    try {
      const res = await uploadImage(file, folder, setProgress);
      onChange(res.url); // only the saved server URL is ever stored — never the blob: preview
      toast.success("Image uploaded. Save to publish it.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProgress(null);
      setPreview(null);
      if (input.current) input.current.value = "";
    }
  }

  const shown = preview ?? value;
  const legacy = value.startsWith("/uploads/");

  return (
    <div>
      <span className="label" id={`${id}-label`}>{label}</span>
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-36 shrink-0 overflow-hidden border border-mist bg-cloud">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover opacity-70" />
          ) : shown ? (
            <SafeImage src={shown} alt="" fill sizes="144px" className="object-cover" fallbackLabel={legacy ? "Legacy" : "Missing"} />
          ) : (
            <div className="grid h-full place-items-center text-silver"><ImagePlus className="h-6 w-6" aria-hidden /></div>
          )}
          {busy && (
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/70">
              <div className="h-full bg-race transition-[width]" style={{ width: `${Math.round((progress ?? 0) * 100)}%` }} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={input}
            id={id}
            type="file"
            accept={ACCEPT.join(",")}
            className="sr-only"
            aria-labelledby={`${id}-label`}
            disabled={disabled || busy}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button type="button" onClick={() => input.current?.click()} disabled={disabled || busy} className="btn btn-outline min-h-[38px] px-3 py-1.5 text-xs disabled:opacity-50">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : value ? <RefreshCw className="h-3.5 w-3.5" aria-hidden /> : <ImagePlus className="h-3.5 w-3.5" aria-hidden />}
            {busy ? `Uploading ${Math.round((progress ?? 0) * 100)}%` : value ? "Replace" : "Upload"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} disabled={disabled || busy} className="btn min-h-[38px] px-3 py-1.5 text-xs text-race hover:bg-race/5 disabled:opacity-50">
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
            </button>
          )}
          {legacy && (
            <p className="flex items-center gap-1 text-xs text-race"><AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Legacy file — please replace.</p>
          )}
          <p className="text-[0.7rem] text-steel">JPEG, PNG, WebP or GIF · up to 8MB</p>
        </div>
      </div>
    </div>
  );
}
