"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface MediaGalleryClientProps {
  mediaUrls: string[];
  brand: string;
  model: string;
}

export default function MediaGalleryClient({ mediaUrls, brand, model }: MediaGalleryClientProps) {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {mediaUrls.map((url: string, imgIdx: number) => (
          url.match(/\.(mp4|webm|mov|x-m4v)$/i) || url.includes('video') ? (
            <video key={imgIdx} src={url} controls className="h-24 w-24 rounded-xl object-cover border-2 border-gray-200 flex-shrink-0" />
          ) : (
            <div key={imgIdx} onClick={() => setFullscreenImage(url)}>
              <img
                src={url}
                alt={`صورة ${brand} ${model}`}
                className="h-24 w-24 rounded-xl object-cover border-2 border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </div>
          )
        ))}
      </div>

      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm print:hidden"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex flex-col items-center justify-center">
            <button 
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={fullscreenImage} 
              alt="Fullscreen preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </>
  );
}
