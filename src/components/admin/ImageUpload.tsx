'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: Array<{ id?: string; url: string; alt: string }>;
  onChange: (images: Array<{ id?: string; url: string; alt: string }>) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Error al subir imagen');
        }

        const { url } = await res.json();
        return { url, alt: file.name };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedImages]);
      toast.success(`${uploadedImages.length} imagen(es) subida(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al subir imágenes');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const updateAlt = (index: number, alt: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], alt };
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-8">
          <ImageIcon className="h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No hay imágenes</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Texto alternativo"
                  value={image.alt}
                  onChange={(e) => updateAlt(index, e.target.value)}
                />
                <p className="text-xs text-gray-500">{image.url}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeImage(index)}
                className="shrink-0 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full gap-2"
      >
        <Upload className="h-4 w-4" />
        {isUploading ? 'Subiendo...' : 'Subir Imágenes'}
      </Button>

      <p className="text-xs text-gray-500">
        Formatos: JPG, PNG, WebP. Máximo 5MB por imagen.
      </p>
    </div>
  );
}
