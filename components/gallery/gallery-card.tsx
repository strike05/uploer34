"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Share2, Settings, Trash2, Copy, Calendar, Lock, Link2OffIcon as LinkOff } from "lucide-react"
import type { GalleryCardProps } from "@/types"

export function GalleryCard({ gallery, onEdit, onShare, onDelete, onCopyLink, onView }: GalleryCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "Unbegrenzt"
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  // Bestimme den Status des Share-Links
  const getShareStatus = () => {
    if (!gallery.shareEnabled) {
      return { label: "Deaktiviert", color: "destructive", icon: LinkOff }
    }

    if (gallery.shareExpiresAt && gallery.shareExpiresAt < new Date()) {
      return { label: "Abgelaufen", color: "destructive", icon: Calendar }
    }

    if (gallery.sharePassword) {
      return { label: "Passwortgeschützt", color: "warning", icon: Lock }
    }

    if (gallery.shareAccess === "public") {
      return { label: "Öffentlich", color: "success", icon: Eye }
    }

    if (gallery.shareAccess === "restricted") {
      return { label: "Eingeschränkt", color: "warning", icon: EyeOff }
    }

    return { label: "Privat", color: "secondary", icon: EyeOff }
  }

  const shareStatus = getShareStatus()

  // Stelle sicher, dass der Share-Link das richtige Format hat
  const ensureCorrectShareLink = (link: string, shareId: string): string => {
    // Wenn der Link bereits mit /s/ beginnt, ist er korrekt
    if (link.includes("/s/")) {
      // Entferne /view/ aus der URL, falls vorhanden
      return link.replace("/view/s/", "/s/")
    }

    // Wenn der Link mit /gallery/ beginnt, ersetze es durch /s/
    if (link.includes("/gallery/")) {
      return link.replace("/gallery/", "/s/")
    }

    // Wenn der Link weder /s/ noch /gallery/ enthält, füge /s/ hinzu
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
    const shareUrl = baseUrl ? `${baseUrl}/s/${shareId}` : `/s/${shareId}`

    // Logge den korrigierten Link für Debugging-Zwecke
    console.log("Korrigierter Share-Link:", shareUrl)

    return shareUrl
  }

  const correctedShareLink = ensureCorrectShareLink(gallery.shareLink, gallery.shareId)

  return (
    <Card
      key={gallery.id}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onView && onView(gallery.id)}
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{gallery.name}</span>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(gallery.id)
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onShare(gallery.id)
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(gallery.id)
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>Ordner: {gallery.folderName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Erstellt am:</span>
            <span>{formatDate(gallery.createdAt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gültig bis:</span>
            <span>{formatDate(gallery.expiresAt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className="flex items-center">
              {gallery.isPublic ? (
                <>
                  <Eye className="h-3 w-3 mr-1 text-green-500" />
                  Öffentlich
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3 mr-1 text-amber-500" />
                  Privat
                </>
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Share-Link:</span>
            <Badge variant={shareStatus.color as any}>
              <shareStatus.icon className="h-3 w-3 mr-1" />
              {shareStatus.label}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Aufrufe:</span>
            <span>{gallery.views}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <Input
            value={correctedShareLink}
            readOnly
            className="text-xs"
            disabled={!gallery.shareEnabled}
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onCopyLink(correctedShareLink)
            }}
            disabled={!gallery.shareEnabled}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

