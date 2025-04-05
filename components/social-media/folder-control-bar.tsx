"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download, Link, ExternalLink, Facebook, Twitter } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { loadSocialMediaSettings, DEFAULT_SOCIAL_MEDIA_SETTINGS } from "@/lib/social-media-service"
import type { SocialMediaSettings } from "@/types"

interface FolderControlBarProps {
  folderId: string
  fileName: string
  imageUrl: string
}

export function FolderControlBar({ folderId, fileName, imageUrl }: FolderControlBarProps) {
  const [socialMediaSettings, setSocialMediaSettings] = useState<SocialMediaSettings>(DEFAULT_SOCIAL_MEDIA_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // Lade die Social Media Einstellungen für den Ordner
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        console.log(`[FolderControlBar] Lade Social Media Einstellungen für Ordner:`, folderId)

        if (folderId) {
          const settings = await loadSocialMediaSettings(folderId)
          console.log(`[FolderControlBar] Geladene Social Media Einstellungen:`, settings)
          setSocialMediaSettings(settings)
        }
      } catch (error) {
        console.error(`[FolderControlBar] Fehler beim Laden der Social Media Einstellungen:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [folderId])

  // Download-Funktion
  const handleDownload = useCallback(() => {
    // Verwende die API-Route für den Download
    const downloadUrl = `/api/download?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(fileName)}`
    window.open(downloadUrl, "_blank")

    toast({
      title: "Download gestartet",
      description: `Die Datei "${fileName}" wird heruntergeladen.`,
    })
  }, [imageUrl, fileName])

  // Link kopieren
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link kopiert",
      description: "Der Link wurde in die Zwischenablage kopiert.",
    })
  }, [])

  // Social Media Sharing
  const handleShare = useCallback(
    (platform: string) => {
      const shareUrl = window.location.href
      const shareTitle = `Bild: ${fileName}`

      let url = ""
      switch (platform) {
        case "facebook":
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
          break
        case "twitter":
          url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`
          break
        case "whatsapp":
          url = `https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`
          break
        case "instagram":
          // Instagram hat keine direkte Share-URL, kopieren wir den Link
          navigator.clipboard.writeText(shareUrl)
          toast({
            title: "Link kopiert",
            description: "Der Link wurde in die Zwischenablage kopiert. Fügen Sie ihn in Instagram ein.",
          })
          return
      }

      if (url) {
        window.open(url, "_blank", "noopener,noreferrer")
      }
    },
    [fileName],
  )

  // Benutzerdefinierter Button Handler
  const handleCustomButtonClick = useCallback(() => {
    if (socialMediaSettings.customButtonEnabled && socialMediaSettings.customButtonUrl) {
      // Ersetze Platzhalter im benutzerdefinierten URL
      const shareUrl = window.location.href
      const shareTitle = `Bild: ${fileName}`

      const processedUrl = socialMediaSettings.customButtonUrl
        .replace("{url}", encodeURIComponent(shareUrl))
        .replace("{title}", encodeURIComponent(shareTitle))

      window.open(processedUrl, "_blank", "noopener,noreferrer")
    }
  }, [socialMediaSettings, fileName])

  // Bestimme die CSS-Klasse für die Position der Leiste
  const controlBarPositionClass =
    socialMediaSettings.controlBarPosition === "attached" ? "rounded-b-lg" : "rounded-lg mt-4"

  return (
    <div
      className={`w-full max-w-6xl mx-auto bg-gray-800/80 backdrop-blur-sm ${controlBarPositionClass} flex flex-wrap justify-center items-center gap-2 p-4`}
    >
      {/* Benutzerdefinierter Button - wird vor allen anderen angezeigt */}
      {socialMediaSettings.customButtonEnabled && socialMediaSettings.customButtonLabel && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCustomButtonClick}
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 flex items-center"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {socialMediaSettings.customButtonLabel}
        </Button>
      )}

      {/* Download Button - optional */}
      {socialMediaSettings.showDownloadButton !== false && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      )}

      {/* Link kopieren Button - optional */}
      {socialMediaSettings.showCopyLinkButton === true && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 flex items-center"
        >
          <Link className="h-4 w-4 mr-2" />
          Link kopieren
        </Button>
      )}

      {/* Social Media Buttons - direkt in der Leiste anzeigen */}
      {socialMediaSettings.facebookEnabled && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("facebook")}
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 flex items-center"
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
      )}

      {socialMediaSettings.twitterEnabled && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("twitter")}
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 flex items-center"
        >
          <Twitter className="h-4 w-4 mr-2" />X (Twitter)
        </Button>
      )}

      {socialMediaSettings.whatsappEnabled && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("whatsapp")}
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 flex items-center"
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.94 8.94 0 0 0-7.64 13.5L4 22l4.59-.39a8.9 8.9 0 0 0 3.46.68 8.93 8.93 0 0 0 8.94-8.94 8.91 8.91 0 0 0-3.39-7.03zm-5.55 13.72a7.4 7.4 0 0 1-3.79-.97l-.27-.16-2.82.74.75-2.75-.18-.28a7.43 7.43 0 0 1-1.14-3.99 7.44 7.44 0 0 1 7.44-7.44c1.97 0 3.83.77 5.23 2.17a7.4 7.4 0 0 1 2.17 5.25 7.44 7.44 0 0 1-7.39 7.43zm4.08-5.56c-.22-.11-1.32-.65-1.53-.73s-.35-.11-.5.11c-.15.22-.58.73-.71.88s-.26.17-.48.06a6.09 6.09 0 0 1-3.12-2.73c-.23-.4.23-.37.67-1.25.07-.15.04-.29-.02-.4-.06-.11-.5-1.2-.69-1.65-.18-.43-.37-.37-.5-.38h-.43a.84.84 0 0 0-.61.28c-.21.23-.8.78-.8 1.9s.82 2.2.93 2.35c.12.15 1.67 2.55 4.05 3.58.57.24 1.01.39 1.36.5.57.18 1.09.15 1.5.09.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.44-.27z" />
          </svg>
          WhatsApp
        </Button>
      )}

      {socialMediaSettings.instagramEnabled && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("instagram")}
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 flex items-center"
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          Instagram
        </Button>
      )}
    </div>
  )
}

