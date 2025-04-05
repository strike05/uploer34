"use client"

import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Instagram, ExternalLink } from "lucide-react"
import { generateSocialMediaShareUrl } from "@/lib/social-media-service"
import { toast } from "@/components/ui/use-toast"
import type { SocialMediaSettings } from "@/types"

interface SocialMediaButtonsProps {
  url: string
  title?: string
  description?: string
  imageUrl?: string
  settings?: SocialMediaSettings
}

export function SocialMediaButtons({ url, title, description, imageUrl, settings }: SocialMediaButtonsProps) {
  // Use default settings if none provided
  const {
    instagramEnabled = true,
    facebookEnabled = true,
    twitterEnabled = true,
    whatsappEnabled = true,
    customButtonEnabled = false,
    customButtonLabel = "",
    customButtonUrl = "",
  } = settings || {}

  // Prüfen, ob mindestens eine Social-Media-Option aktiviert ist
  const hasEnabledOptions =
    instagramEnabled || facebookEnabled || twitterEnabled || whatsappEnabled || customButtonEnabled

  if (!hasEnabledOptions) {
    return null
  }

  const handleShare = (platform: string) => {
    const shareUrl = generateSocialMediaShareUrl(platform, url, title, description, imageUrl)

    if (platform.toLowerCase() === "instagram") {
      // Für Instagram kopieren wir den Link in die Zwischenablage
      navigator.clipboard.writeText(url)
      toast({
        title: "Link kopiert",
        description: "Der Link wurde in die Zwischenablage kopiert. Fügen Sie ihn in Instagram ein.",
      })
      return
    }

    // Für andere Plattformen öffnen wir ein neues Fenster
    window.open(shareUrl, "_blank", "noopener,noreferrer")
  }

  const handleCustomButtonClick = () => {
    if (customButtonUrl) {
      // Ersetze Platzhalter im benutzerdefinierten URL
      const processedUrl = customButtonUrl
        .replace("{url}", encodeURIComponent(url))
        .replace("{title}", encodeURIComponent(title || ""))
        .replace("{description}", encodeURIComponent(description || ""))

      window.open(processedUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {facebookEnabled && (
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
          onClick={() => handleShare("facebook")}
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
      )}

      {twitterEnabled && (
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
          onClick={() => handleShare("twitter")}
        >
          <Twitter className="h-4 w-4 mr-2" />X
        </Button>
      )}

      {whatsappEnabled && (
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
          onClick={() => handleShare("whatsapp")}
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.94 8.94 0 0 0-7.64 13.5L4 22l4.59-.39a8.9 8.9 0 0 0 3.46.68 8.93 8.93 0 0 0 8.94-8.94 8.91 8.91 0 0 0-3.39-7.03zm-5.55 13.72a7.4 7.4 0 0 1-3.79-.97l-.27-.16-2.82.74.75-2.75-.18-.28a7.43 7.43 0 0 1-1.14-3.99 7.44 7.44 0 0 1 7.44-7.44c1.97 0 3.83.77 5.23 2.17a7.4 7.4 0 0 1 2.17 5.25 7.44 7.44 0 0 1-7.39 7.43zm4.08-5.56c-.22-.11-1.32-.65-1.53-.73s-.35-.11-.5.11c-.15.22-.58.73-.71.88s-.26.17-.48.06a6.09 6.09 0 0 1-3.12-2.73c-.23-.4.23-.37.67-1.25.07-.15.04-.29-.02-.4-.06-.11-.5-1.2-.69-1.65-.18-.43-.37-.37-.5-.38h-.43a.84.84 0 0 0-.61.28c-.21.23-.8.78-.8 1.9s.82 2.2.93 2.35c.12.15 1.67 2.55 4.05 3.58.57.24 1.01.39 1.36.5.57.18 1.09.15 1.5.09.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.44-.27z" />
          </svg>
          WhatsApp
        </Button>
      )}

      {instagramEnabled && (
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
          onClick={() => handleShare("instagram")}
        >
          <Instagram className="h-4 w-4 mr-2" />
          Instagram
        </Button>
      )}

      {customButtonEnabled && customButtonLabel && (
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
          onClick={handleCustomButtonClick}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {customButtonLabel}
        </Button>
      )}
    </div>
  )
}

