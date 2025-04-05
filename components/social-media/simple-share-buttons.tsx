"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Share2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface SimpleShareButtonsProps {
  url: string
  title?: string
}

export function SimpleShareButtons({ url, title }: SimpleShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false)

  console.log("[SimpleShareButtons] Rendering with:", { url, title })

  const handleShare = (platform: string) => {
    console.log(`[SimpleShareButtons] Sharing to ${platform}:`, { url, title })

    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = title ? encodeURIComponent(title) : ""

    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        window.open(shareUrl, "_blank")
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
        window.open(shareUrl, "_blank")
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
        window.open(shareUrl, "_blank")
        break
      case "instagram":
        // Instagram doesn't have a direct share URL, so we copy to clipboard
        navigator.clipboard.writeText(url)
        toast({
          title: "Link kopiert",
          description: "Der Link wurde in die Zwischenablage kopiert. Fügen Sie ihn in Instagram ein.",
        })
        break
      default:
        // Just copy the link
        navigator.clipboard.writeText(url)
        toast({
          title: "Link kopiert",
          description: "Der Link wurde in die Zwischenablage kopiert.",
        })
    }

    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Teilen
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleShare("facebook")}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare("twitter")}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
          X (Twitter)
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.94 8.94 0 0 0-7.64 13.5L4 22l4.59-.39a8.9 8.9 0 0 0 3.46.68 8.93 8.93 0 0 0 8.94-8.94 8.91 8.91 0 0 0-3.39-7.03zm-5.55 13.72a7.4 7.4 0 0 1-3.79-.97l-.27-.16-2.82.74.75-2.75-.18-.28a7.43 7.43 0 0 1-1.14-3.99 7.44 7.44 0 0 1 7.44-7.44c1.97 0 3.83.77 5.23 2.17a7.4 7.4 0 0 1 2.17 5.25 7.44 7.44 0 0 1-7.39 7.43zm4.08-5.56c-.22-.11-1.32-.65-1.53-.73s-.35-.11-.5.11c-.15.22-.58.73-.71.88s-.26.17-.48.06a6.09 6.09 0 0 1-3.12-2.73c-.23-.4.23-.37.67-1.25.07-.15.04-.29-.02-.4-.06-.11-.5-1.2-.69-1.65-.18-.43-.37-.37-.5-.38h-.43a.84.84 0 0 0-.61.28c-.21.23-.8.78-.8 1.9s.82 2.2.93 2.35c.12.15 1.67 2.55 4.05 3.58.57.24 1.01.39 1.36.5.57.18 1.09.15 1.5.09.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.44-.27z" />
          </svg>
          WhatsApp
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare("instagram")}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          Instagram
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare("copy")}>
          <svg
            className="h-4 w-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Link kopieren
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

