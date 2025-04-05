"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Calendar, Eye, Users } from "lucide-react"
import { getGalleryStatistics, getShareLinkStats } from "@/lib/services/gallery-service"
import { getGalleryById } from "@/lib/services/gallery-service"
import type { GalleryStatistics as GalleryStatsType, ShareLinkStats } from "@/types"

interface GalleryStatisticsProps {
  galleryId: string
}

export function GalleryStatistics({ galleryId }: GalleryStatisticsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [galleryStats, setGalleryStats] = useState<GalleryStatsType | null>(null)
  const [shareLinkStats, setShareLinkStats] = useState<ShareLinkStats | null>(null)
  const [gallery, setGallery] = useState<any>(null)

  useEffect(() => {
    async function loadStatistics() {
      setIsLoading(true)
      setError(null)

      try {
        // Lade die Galerie-Daten
        const galleryData = await getGalleryById(galleryId)
        if (galleryData) {
          setGallery(galleryData)

          // Lade die Galerie-Statistiken
          const stats = await getGalleryStatistics(galleryId)
          setGalleryStats(stats)

          // Lade die Share-Link-Statistiken, wenn ein Share-Link vorhanden ist
          if (galleryData.shareId) {
            const shareStats = await getShareLinkStats(galleryData.shareId)
            setShareLinkStats(shareStats)
          }
        } else {
          setError("Galerie nicht gefunden")
        }
      } catch (err: any) {
        console.error("Fehler beim Laden der Statistiken:", err)
        setError(err.message || "Fehler beim Laden der Statistiken")
      } finally {
        setIsLoading(false)
      }
    }

    if (galleryId) {
      loadStatistics()
    }
  }, [galleryId])

  // Formatiere das Datum
  const formatDate = (date: Date | null) => {
    if (!date) return "Nie"
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  // Wenn keine Statistiken vorhanden sind, zeige eine Meldung an
  if (!galleryStats && !shareLinkStats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-muted-foreground">Keine Statistiken verfügbar für diese Galerie.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Statistiken werden gesammelt, sobald Benutzer Ihre Galerie besuchen.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gesamtaufrufe */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
              Gesamtaufrufe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gallery?.views || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Seit {formatDate(gallery?.createdAt || null)}</p>
          </CardContent>
        </Card>

        {/* Unique Besucher */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              Unique Besucher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{galleryStats?.uniqueVisitors || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Basierend auf eindeutigen IP-Adressen</p>
          </CardContent>
        </Card>

        {/* Share-Link Klicks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
              Share-Link Klicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shareLinkStats?.totalClicks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Über alle geteilten Links</p>
          </CardContent>
        </Card>

        {/* Letzter Zugriff */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              Letzter Zugriff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatDate(shareLinkStats?.lastAccessed || galleryStats?.lastVisited || null)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Letzter Besuch der Galerie</p>
          </CardContent>
        </Card>
      </div>

      {/* Referrer-Statistiken */}
      {shareLinkStats?.referrers && Object.keys(shareLinkStats.referrers).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Referrer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(shareLinkStats.referrers)
                .sort(([, a], [, b]) => b - a)
                .map(([referrer, count]) => (
                  <div key={referrer} className="flex justify-between items-center">
                    <span className="text-sm">{referrer || "Direkt"}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tägliche Aufrufe */}
      {galleryStats?.dailyViews && galleryStats.dailyViews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tägliche Aufrufe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {galleryStats.dailyViews
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 7)
                .map((day) => (
                  <div key={day.date} className="flex justify-between items-center">
                    <span className="text-sm">
                      {new Date(day.date).toLocaleDateString("de-DE", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                    <span className="text-sm font-medium">{day.count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

