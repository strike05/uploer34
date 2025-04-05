"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SocialMediaButtons } from "@/components/social-media/social-media-buttons"
import { Download, Link, ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { loadSocialMediaSettings, DEFAULT_SOCIAL_MEDIA_SETTINGS } from "@/lib/social-media-service"
import type { SocialMediaSettings } from "@/types"

interface EnhancedImageViewerProps {
  imageUrl: string
  filename: string
  folderId: string
  fileIndex?: number
  totalFiles?: number
  onPrevious?: () => void
  onNext?: () => void
}

export function EnhancedImageViewer({
  imageUrl,
  filename,
  folderId,
  fileIndex,
  totalFiles,
  onPrevious,
  onNext,
}: EnhancedImageViewerProps) {
  const [socialMediaSettings, setSocialMediaSettings] = useState<SocialMediaSettings>(DEFAULT_SOCIAL_MEDIA_SETTINGS)

  // Lade die Social Media Einstellungen für den Ordner
  useEffect(() => {
    const loadSettings = async () => {
      if (folderId) {
        try {
          console.log("Lade Social Media Einstellungen für Ordner:", folderId)
          const settings = await loadSocialMediaSettings(folderId)
          console.log("Geladene Einstellungen:", settings)
          setSocialMediaSettings(settings)
        } catch (error) {
          console.error("Fehler beim Laden der Social Media Einstellungen:", error)
          // Bei Fehler die Standardeinstellungen verwenden
          setSocialMediaSettings(DEFAULT_SOCIAL_MEDIA_SETTINGS)
        }
      }
    }

    loadSettings()
  }, [folderId])

  // Debug-Log für die aktuellen Einstellungen
  useEffect(() => {
    console.log("Aktuelle Social Media Einstellungen:", socialMediaSettings)
  }, [socialMediaSettings])

  const handleDownload = () => {
    // Erstelle einen temporären Link zum Herunterladen
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download gestartet",
      description: `Die Datei "${filename}" wird heruntergeladen.`,
    })
  }

  const handleCopyLink = () => {
    // Kopiere den Link in die Zwischenablage
    navigator.clipboard.writeText(window.location.href)

    toast({
      title: "Link kopiert",
      description: "Der Link wurde in die Zwischenablage kopiert.",
    })
  }

  // Erstelle den Titel für Social Media Sharing
  const shareTitle = `Bild: ${filename}`

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="relative max-w-6xl w-full">
        {/* Bild */}
        <div className="relative">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={filename}
            className="max-h-[80vh] w-auto mx-auto object-contain"
          />

          {/* Navigation Buttons (wenn mehrere Dateien vorhanden sind) */}
          {totalFiles && totalFiles > 1 && (
            <>
              {onPrevious && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={onPrevious}
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              )}

              {onNext && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={onNext}
                >
                  <ArrowRight className="h-6 w-6" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Steuerelemente */}
        <div className="flex items-center justify-between mt-4 bg-gray-900 p-3 rounded-md">
          <div className="text-white">
            <h2 className="text-lg font-medium">{filename}</h2>
            {fileIndex !== undefined && totalFiles && (
              <p className="text-sm text-gray-400">
                Bild {fileIndex + 1} von {totalFiles}
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Link className="h-4 w-4 mr-2" />
              Link kopieren
            </Button>

            <SocialMediaButtons
              url={window.location.href}
              title={shareTitle}
              imageUrl={imageUrl}
              settings={socialMediaSettings}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

