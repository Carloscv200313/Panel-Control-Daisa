"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/components/admin/Button";

export interface UploadedAsset {
  url: string;
  publicId: string;
}

interface UploaderProps {
  label: string;
  description?: string;
  folder: string;
  value: UploadedAsset[];
  onChange: (value: UploadedAsset[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  maxFiles?: number;
}

async function uploadSingleFile(file: File, folder: string) {
  const signResponse = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ folder }),
  });

  if (!signResponse.ok) {
    const payload = (await signResponse.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "No se pudo firmar la subida a Cloudinary.");
  }

  const signed = (await signResponse.json()) as {
    apiKey: string;
    cloudName: string;
    folder: string;
    signature: string;
    timestamp: number;
  };

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signed.apiKey);
  formData.append("folder", signed.folder);
  formData.append("signature", signed.signature);
  formData.append("timestamp", String(signed.timestamp));

  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = (await cloudinaryResponse.json()) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string };
  };

  if (!cloudinaryResponse.ok || !payload.secure_url || !payload.public_id) {
    throw new Error(payload.error?.message ?? "Cloudinary devolvió un error al subir la imagen.");
  }

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
  };
}

export function Uploader({
  label,
  description,
  folder,
  value,
  onChange,
  multiple = true,
  disabled,
  maxFiles = 10,
}: UploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const selected = Array.from(files).slice(0, maxFiles);
      const uploaded = await Promise.all(selected.map((file) => uploadSingleFile(file, folder)));
      const nextValue = multiple ? [...value, ...uploaded].slice(0, maxFiles) : uploaded.slice(0, 1);
      onChange(nextValue);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.";
      setError(message);
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) {
      return;
    }

    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="rounded-[26px] border border-[var(--color-line)] bg-[rgba(255,250,244,0.68)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold text-[var(--color-paper)]">{label}</div>
          {description ? (
            <div className="mt-1 text-xs leading-6 text-[rgba(96,74,56,0.54)]">{description}</div>
          ) : null}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading || value.length >= maxFiles}
        >
          {uploading ? "Subiendo..." : multiple ? "Subir imágenes" : "Subir imagen"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {error ? <div className="mt-3 text-sm text-[var(--color-danger)]">{error}</div> : null}

      {value.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {value.map((image, index) => (
            <div
              key={`${image.publicId}-${index}`}
              className="overflow-hidden rounded-[24px] border border-[var(--color-line)] bg-[rgba(242,232,221,0.84)]"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={image.url}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex items-center justify-between gap-3 p-3">
                <span className="text-xs font-semibold tracking-[0.14em] text-[rgba(96,74,56,0.54)] uppercase">
                  Orden {index + 1}
                </span>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => moveItem(index, -1)}>
                    ↑
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => moveItem(index, 1)}>
                    ↓
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => removeItem(index)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[20px] border border-dashed border-[var(--color-line)] px-4 py-8 text-sm text-[rgba(96,74,56,0.46)]">
          Todavía no hay imágenes cargadas.
        </div>
      )}
    </div>
  );
}
