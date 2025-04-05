"use client"

import { useState, useEffect } from "react"
import { getSystemStats } from "@/lib/services/admin-service"
import type { SystemStats } from "@/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, FileText, Image, HardDrive } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { AreaChart, BarChart3 } from "@/components/ui/charts"

export function SystemStatistics() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const systemStats = await getSystemStats()
      setStats(systemStats)
    } catch (error: any) {
      setError(error.message || "Fehler beim Laden der Statistiken")
      toast({
        title: "Fehler",
        description: "Systemstatistiken konnten nicht geladen werden",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Number.parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button onClick={loadStats} className="mt-4">
          Erneut versuchen
        </Button>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p>Keine Statistiken verfügbar</p>
        <Button onClick={loadStats} className="mt-4">
          Statistiken laden
        </Button>
      </div>
    )
  }

  // Beispieldaten für Charts
  const userActivityData = [
    { name: "Jan", Nutzer: 10 },
    { name: "Feb", Nutzer: 15 },
    { name: "Mär", Nutzer: 20 },
    { name: "Apr", Nutzer: 25 },
    { name: "Mai", Nutzer: 22 },
    { name: "Jun", Nutzer: 30 },
  ]

  const storageUsageData = [
    { name: "Bilder", value: 60 },
    { name: "Videos", value: 25 },
    { name: "Dokumente", value: 10 },
    { name: "Andere", value: 5 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{stats.activeUsers} aktive Benutzer in den letzten 30 Tagen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dateien</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">In {stats.totalFolders} Ordnern</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Speicherplatz</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats.totalStorage)}</div>
            <p className="text-xs text-muted-foreground">Gesamter belegter Speicherplatz</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Galerien</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGalleries}</div>
            <p className="text-xs text-muted-foreground">Erstellte Galerien</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Benutzeraktivität</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={userActivityData}
              index="name"
              categories={["Nutzer"]}
              colors={["blue"]}
              valueFormatter={(value) => `${value} Nutzer`}
              className="h-72"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Speichernutzung nach Dateityp</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart3
              data={storageUsageData}
              index="name"
              categories={["value"]}
              colors={["blue"]}
              valueFormatter={(value) => `${value}%`}
              className="h-72"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

