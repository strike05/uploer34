"use client"

import { useState, useEffect, useCallback } from "react"
import { X } from "lucide-react"
import { FolderControlBar } from "@/components/social-media/folder-control-bar"
import { Button } from "@/components/ui/button"

interface DirectLinkViewerProps {
  imageUrl: string
  fileName: string
  folderId: string
  fileId?: string
  onClose?: () => void
}

export function DirectLinkViewer({ imageUrl, fileName, folderId, fileId, onClose }: DirectLinkViewerProps) {
  const [imgError, setImgError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [proxyUrl, setProxyUrl] = useState<string | null>(null)

  // Debugging-Ausgabe
  useEffect(() => {
    console.log("DirectLinkViewer props:", {
      imageUrl,
      fileName,
      folderId,
      fileId,
    })

    // Erstelle eine Proxy-URL über unsere eigene API
    if (imageUrl && imageUrl.includes("firebasestorage.googleapis.com")) {
      const encodedUrl = encodeURIComponent(imageUrl)
      const proxy = `/api/proxy-image?url=${encodedUrl}`
      console.log("Using proxy URL:", proxy)
      setProxyUrl(proxy)
    } else {
      setProxyUrl(imageUrl)
    }
  }, [imageUrl, fileName, folderId, fileId])

  // Fehlerbehandlung für Bilder
  const handleImageError = useCallback(() => {
    console.error(`Error loading image: ${proxyUrl || imageUrl}`)
    setImgError(true)
    setIsLoading(false)
  }, [imageUrl, proxyUrl])

  const handleImageLoad = useCallback(() => {
    console.log("Image loaded successfully:", proxyUrl || imageUrl)
    setIsLoading(false)
  }, [imageUrl, proxyUrl])

  // Direkter Download-Link
  const handleDirectDownload = () => {
    // Erstelle einen Download-Link für die Datei
    const downloadUrl = `/api/download?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(fileName)}`
    window.open(downloadUrl, "_blank")
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

      {/* Ladeindikator */}
      {isLoading && !imgError && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Hauptbild-Container */}
      <div className="relative flex-1 flex items-center justify-center w-full max-w-6xl mx-auto p-4 pb-0">
        {imgError ? (
          <div className="text-center p-8 bg-gray-800/50 rounded-lg">
            <p className="text-xl font-medium mb-2">Bild konnte nicht geladen werden</p>
            <p className="text-gray-400">Das Bild "{fileName}" konnte nicht angezeigt werden.</p>
            <p className="text-gray-400 mt-4">Sie können versuchen, es direkt herunterzuladen.</p>
            <Button onClick={handleDirectDownload} className="mt-4">
              Direkt herunterladen
            </Button>
            <div className="mt-4 p-4 bg-gray-700/50 rounded text-xs overflow-auto max-w-full">
              <p>Debug-Info:</p>
              <p>URL: {proxyUrl || imageUrl}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full">
            {proxyUrl && (
              <img
                src={proxyUrl || "/placeholder.svg"}
                alt={fileName}
                className={`max-h-[80vh] max-w-full object-contain rounded-t-lg shadow-2xl ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                crossOrigin="anonymous"
              />
            )}

            {/* Steuerelemente - direkt unter dem Bild */}
            {!isLoading && !imgError && (
              <FolderControlBar folderId={folderId} fileName={fileName} imageUrl={imageUrl} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

