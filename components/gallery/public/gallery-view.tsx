"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Download, ChevronLeft, ChevronRight, X, MessageSquare } from "lucide-react"
import { CommentSection } from "./comment-section"
import type { Gallery, FileItem } from "@/types"
import { FILE_CONFIG } from "@/lib/config"

interface GalleryViewProps {
  gallery: Gallery
  files: FileItem[]
}

export function GalleryView({ gallery, files }: GalleryViewProps) {
  const searchParams = useSearchParams()
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [showComments, setShowComments] = useState(false)

  // Setze das Layout basierend auf den Galerie-Einstellungen
  const layout = gallery.layout || "grid"

  // Setze die Schriftart basierend auf den Galerie-Einstellungen
  const fontClass = {
    default: "font-sans",
    serif: "font-serif",
    "sans-serif": "font-sans",
    monospace: "font-mono",
    handwriting: "font-cursive",
  }[gallery.font || "default"]

  // Setze die Farben basierend auf den Galerie-Einstellungen
  const colorScheme = gallery.colorScheme || {
    primary: "#000000",
    secondary: "#4f46e5",
    background: "#ffffff",
    text: "#000000",
  }

  // Setze den Dunkelmodus basierend auf den Galerie-Einstellungen
  const darkMode = gallery.darkMode || false

  // Öffne ein Bild, wenn in der URL ein fileId-Parameter vorhanden ist
  useEffect(() => {
    const fileId = searchParams.get("fileId")
    if (fileId) {
      const file = files.find((f) => f.id === fileId)
      if (file) {
        setSelectedFile(file)
      }
    }
  }, [searchParams, files])

  // Funktion zum Navigieren zwischen Bildern
  const navigateFiles = (direction: "next" | "prev") => {
    if (!selectedFile) return

    const currentIndex = files.findIndex((f) => f.id === selectedFile.id)
    if (currentIndex === -1) return

    const newIndex =
      direction === "next" ? (currentIndex + 1) % files.length : (currentIndex - 1 + files.length) % files.length

    setSelectedFile(files[newIndex])
  }

  // Hilfsfunktion zum Ermitteln der Wasserzeichen-Position
  const getWatermarkPositionClass = (position = "bottomRight") => {
    switch (position) {
      case "center":
        return "inset-0 flex items-center justify-center"
      case "bottomRight":
        return "bottom-2 right-2"
      case "bottomLeft":
        return "bottom-2 left-2"
      case "topRight":
        return "top-2 right-2"
      case "topLeft":
        return "top-2 left-2"
      default:
        return "bottom-2 right-2"
    }
  }

  // Funktion zum Rendern des Layouts
  const renderLayout = () => {
    switch (layout) {
      case "masonry":
        return (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {files.map((file) => (
              <div key={file.id} className="break-inside-avoid">
                <Card
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedFile(file)}
                >
                  {file.type.startsWith("image/") ? (
                    <div className="relative aspect-auto">
                      <img
                        src={FILE_CONFIG.directFileUrlPattern(file.folderId, file.name) || "/placeholder.svg"}
                        alt={file.name}
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          console.error(
                            "Fehler beim Laden des Bildes:",
                            FILE_CONFIG.directFileUrlPattern(file.folderId, file.name),
                          )
                          e.currentTarget.onerror = null
                          e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                        }}
                        crossOrigin="anonymous"
                      />
                      {gallery.watermarkEnabled && gallery.watermarkText && (
                        <div
                          className={`absolute ${getWatermarkPositionClass(gallery.watermarkPosition)} p-2 text-white bg-black bg-opacity-30 text-sm`}
                        >
                          {gallery.watermarkText}
                        </div>
                      )}
                    </div>
                  ) : file.type.startsWith("video/") ? (
                    <div className="relative aspect-video">
                      <video src={file.url} className="w-full h-full object-cover" controls={false} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-16 border-l-white border-b-8 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </Card>
              </div>
            ))}
          </div>
        )

      case "carousel":
        return (
          <div className="relative">
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
              {files.map((file) => (
                <div key={file.id} className="flex-shrink-0 w-80 snap-center" onClick={() => setSelectedFile(file)}>
                  <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow h-full">
                    {file.type.startsWith("image/") ? (
                      <div className="relative aspect-square">
                        <img
                          src={FILE_CONFIG.directFileUrlPattern(file.folderId, file.name) || "/placeholder.svg"}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(
                              "Fehler beim Laden des Bildes:",
                              FILE_CONFIG.directFileUrlPattern(file.folderId, file.name),
                            )
                            e.currentTarget.onerror = null
                            e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                          }}
                          crossOrigin="anonymous"
                        />
                        {gallery.watermarkEnabled && gallery.watermarkText && (
                          <div
                            className={`absolute ${getWatermarkPositionClass(gallery.watermarkPosition)} p-2 text-white bg-black bg-opacity-30 text-sm`}
                          >
                            {gallery.watermarkText}
                          </div>
                        )}
                      </div>
                    ) : file.type.startsWith("video/") ? (
                      <div className="relative aspect-video">
                        <video src={file.url} className="w-full h-full object-cover" controls={false} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-16 border-l-white border-b-8 border-b-transparent ml-1"></div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )

      case "slideshow":
        return (
          <div className="relative">
            {files.length > 0 && (
              <div className="relative aspect-video max-h-[70vh]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    const currentIndex = selectedFile ? files.findIndex((f) => f.id === selectedFile.id) : 0
                    const prevIndex = (currentIndex - 1 + files.length) % files.length
                    setSelectedFile(files[prevIndex])
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="w-full h-full cursor-pointer" onClick={() => setSelectedFile(selectedFile || files[0])}>
                  {selectedFile ? (
                    selectedFile.type.startsWith("image/") ? (
                      <div className="relative w-full h-full">
                        <img
                          src={
                            FILE_CONFIG.directFileUrlPattern(selectedFile.folderId, selectedFile.name) ||
                            "/placeholder.svg"
                          }
                          alt={selectedFile.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            console.error("Fehler beim Laden des Bildes:", selectedFile.url)
                            e.currentTarget.onerror = null
                            e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                          }}
                          crossOrigin="anonymous"
                        />
                        {gallery.watermarkEnabled && gallery.watermarkText && (
                          <div
                            className={`absolute ${getWatermarkPositionClass(gallery.watermarkPosition)} p-2 text-white bg-black bg-opacity-30 text-sm`}
                          >
                            {gallery.watermarkText}
                          </div>
                        )}
                      </div>
                    ) : selectedFile.type.startsWith("video/") ? (
                      <video src={selectedFile.url} className="w-full h-full object-contain" controls autoPlay />
                    ) : null
                  ) : files[0].type.startsWith("image/") ? (
                    <div className="relative w-full h-full">
                      <img
                        src={FILE_CONFIG.directFileUrlPattern(files[0].folderId, files[0].name) || "/placeholder.svg"}
                        alt={files[0].name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error("Fehler beim Laden des Bildes:", files[0].url)
                          e.currentTarget.onerror = null
                          e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                        }}
                        crossOrigin="anonymous"
                      />
                      {gallery.watermarkEnabled && gallery.watermarkText && (
                        <div
                          className={`absolute ${getWatermarkPositionClass(gallery.watermarkPosition)} p-2 text-white bg-black bg-opacity-30 text-sm`}
                        >
                          {gallery.watermarkText}
                        </div>
                      )}
                    </div>
                  ) : files[0].type.startsWith("video/") ? (
                    <video src={files[0].url} className="w-full h-full object-contain" controls autoPlay />
                  ) : null}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    const currentIndex = selectedFile ? files.findIndex((f) => f.id === selectedFile.id) : 0
                    const nextIndex = (currentIndex + 1) % files.length
                    setSelectedFile(files[nextIndex])
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
        )

      // Standard-Grid-Layout
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <Card
                key={file.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedFile(file)}
              >
                {file.type.startsWith("image/") ? (
                  <div className="relative aspect-square">
                    <img
                      src={FILE_CONFIG.directFileUrlPattern(file.folderId, file.name) || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(
                          "Fehler beim Laden des Bildes:",
                          FILE_CONFIG.directFileUrlPattern(file.folderId, file.name),
                        )
                        e.currentTarget.onerror = null
                        e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                      }}
                      crossOrigin="anonymous"
                    />
                    {gallery.watermarkEnabled && gallery.watermarkText && (
                      <div
                        className={`absolute ${getWatermarkPositionClass(gallery.watermarkPosition)} p-2 text-white bg-black bg-opacity-30 text-sm`}
                      >
                        {gallery.watermarkText}
                      </div>
                    )}
                  </div>
                ) : file.type.startsWith("video/") ? (
                  <div className="relative aspect-video">
                    <video src={file.url} className="w-full h-full object-cover" controls={false} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-16 border-l-white border-b-8 border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        )
    }
  }

  return (
    <div
      className={`min-h-screen ${fontClass} ${darkMode ? "dark" : ""}`}
      style={{
        backgroundColor: darkMode ? "#121212" : colorScheme.background,
        color: darkMode ? "#ffffff" : colorScheme.text,
      }}
    >
      {/* Header */}
      <header
        className="p-4 md:p-6"
        style={{
          backgroundColor: darkMode ? "#1e1e1e" : colorScheme.primary,
          color: darkMode ? "#ffffff" : "#ffffff",
        }}
      >
        <div className="container mx-auto">
          {gallery.headerImage && (
            <div className="w-full h-40 md:h-60 mb-4 overflow-hidden rounded-lg">
              <img
                src={gallery.headerImage || "/placeholder.svg"}
                alt={gallery.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl md:text-4xl font-bold">{gallery.name}</h1>
          <p className="text-sm md:text-base opacity-80 mt-2">Ordner: {gallery.folderName}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6">
        {files.length === 0 ? (
          <div className="text-center p-12">
            <h2 className="text-xl font-semibold mb-2">Keine Bilder gefunden</h2>
            <p>Diese Galerie enthält keine Bilder oder Videos.</p>
          </div>
        ) : (
          renderLayout()
        )}
      </main>

      {/* Footer */}
      <footer
        className="p-4 text-center text-sm"
        style={{
          backgroundColor: darkMode ? "#1e1e1e" : colorScheme.primary,
          color: darkMode ? "#ffffff" : "#ffffff",
        }}
      >
        <p>© {new Date().getFullYear()} - Erstellt mit Firebase Gallery</p>
      </footer>

      {/* Bild-Vorschau-Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-transparent border-none">
          <div className="relative bg-black rounded-lg overflow-hidden">
            {/* Schließen-Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full"
              onClick={() => setSelectedFile(null)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation */}
            {files.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateFiles("prev")
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateFiles("next")
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Bild oder Video */}
            {selectedFile && (
              <div className="max-h-[80vh] flex items-center justify-center">
                {selectedFile.type.startsWith("image/") ? (
                  <div className="relative">
                    <img
                      src={
                        FILE_CONFIG.directFileUrlPattern(selectedFile.folderId, selectedFile.name) || "/placeholder.svg"
                      }
                      alt={selectedFile.name}
                      className="max-w-full max-h-[80vh] object-contain"
                      onError={(e) => {
                        console.error(
                          "Fehler beim Laden des Bildes:",
                          FILE_CONFIG.directFileUrlPattern(selectedFile.folderId, selectedFile.name),
                        )
                        e.currentTarget.onerror = null
                        e.currentTarget.src = "/placeholder.svg?height=300&width=300"
                      }}
                      crossOrigin="anonymous"
                    />
                    {gallery.watermarkEnabled && gallery.watermarkText && (
                      <div
                        className={`absolute ${getWatermarkPositionClass(gallery.watermarkPosition)} p-2 text-white bg-black bg-opacity-30 text-sm`}
                      >
                        {gallery.watermarkText}
                      </div>
                    )}
                  </div>
                ) : selectedFile.type.startsWith("video/") ? (
                  <video src={selectedFile.url} className="max-w-full max-h-[80vh]" controls autoPlay />
                ) : null}
              </div>
            )}

            {/* Aktionsleiste */}
            <div className="bg-black/80 text-white p-4 flex justify-between items-center">
              <div>{selectedFile && <p className="text-sm">{selectedFile.name}</p>}</div>
              <div className="flex gap-2">
                {gallery.allowComments && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white"
                    onClick={() => setShowComments(!showComments)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Kommentare
                  </Button>
                )}

                {gallery.allowDownload && selectedFile && (
                  <Button variant="ghost" size="sm" className="text-white" asChild>
                    <a
                      href={FILE_CONFIG.directFileUrlPattern(selectedFile.folderId, selectedFile.name)}
                      download={selectedFile.name}
                      onClick={(e) => {
                        e.preventDefault()
                        const link = document.createElement("a")
                        link.href = FILE_CONFIG.directFileUrlPattern(selectedFile.folderId, selectedFile.name)
                        link.download = selectedFile.name
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Kommentarbereich */}
            {gallery.allowComments && showComments && selectedFile && (
              <div className="bg-white dark:bg-gray-800 p-4 max-h-60 overflow-y-auto">
                <CommentSection galleryId={gallery.id} fileId={selectedFile.id} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

