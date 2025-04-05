"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { FolderControlBar } from "@/components/social-media/folder-control-bar"

interface DirectLinkViewerProps {
  imageUrl: string
  filename: string
  folderId: string
  fileId?: string
  onClose?: () => void
}

export function DirectLinkViewer({ imageUrl, filename, folderId, fileId, onClose }: DirectLinkViewerProps) {
  const [imgError, setImgError] = useState(false)

  // Fehlerbehandlung für Bilder
  const handleImageError = () => {
    console.error(`Error loading image: ${imageUrl}`)
    setImgError(true)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Schließen-Button */}
      {onClose && (
        <button
          className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
      )}

      {/* Hauptbild-Container */}
      <div className="relative flex-1 flex items-center justify-center w-full max-w-6xl mx-auto p-4 pb-0">
        {imgError ? (
          <div className="text-center p-8 bg-gray-800/50 rounded-lg">
            <p className="text-xl font-medium mb-2">Bild konnte nicht geladen werden</p>
            <p className="text-gray-400">Das Bild "{filename}" konnte nicht angezeigt werden.</p>
            <p className="text-gray-400 mt-4">Sie können versuchen, es über den Download-Button herunterzuladen.</p>
          </div>
        ) : (
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={filename}
            className="max-h-[80vh] max-w-full object-contain rounded-t-lg shadow-2xl"
            crossOrigin="anonymous"
            onError={handleImageError}
          />
        )}
      </div>

      {/* Steuerelemente - jetzt als separate Komponente */}
      <FolderControlBar folderId={folderId} filename={filename} imageUrl={imageUrl} />
    </div>
  )
}

