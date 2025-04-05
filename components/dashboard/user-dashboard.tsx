"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, File, Image, Upload, Download, Clock, CreditCard } from "lucide-react"
import { getFolderFiles, getUserFolders } from "@/lib/storage-service"
import type { FileItem } from "@/types"

interface UserDashboardProps {
  userId: string
}

export function UserDashboard({ userId }: UserDashboardProps) {
  // State für Speichernutzung
  const [storageUsage, setStorageUsage] = useState<{
    used: number
    total: number
    percentage: number
  }>({
    used: 0,
    total: 1024 * 1024 * 1024, // 1GB als Beispiel
    percentage: 0,
  })

  // State für kürzlich hinzugefügte Dateien
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // State für Abonnement-Informationen
  const [planInfo, setPlanInfo] = useState({
    name: "Kostenlos",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Tage in der Zukunft
    isActive: true,
  })

  // Daten laden
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        // Berechne die tatsächliche Speichernutzung basierend auf den Dateien des Benutzers
        const folders = await getUserFolders(userId)
        let allFiles: FileItem[] = []
        let totalUsedStorage = 0

        // Sammle alle Dateien und berechne die Gesamtgröße
        for (const folder of folders) {
          const files = await getFolderFiles(folder.id)
          allFiles = [...allFiles, ...files]

          // Summiere die Dateigröße
          for (const file of files) {
            totalUsedStorage += file.size
          }
        }

        // Standardmäßig 1GB Gesamtspeicher (kann später angepasst werden)
        const totalStorage = 1024 * 1024 * 1024 // 1GB
        const usagePercentage = (totalUsedStorage / totalStorage) * 100

        setStorageUsage({
          used: totalUsedStorage,
          total: totalStorage,
          percentage: usagePercentage,
        })

        // Beispiel für kürzlich hinzugefügte Dateien
        const recentFolders = await getUserFolders(userId)
        let allFilesRecent: FileItem[] = []

        for (const folder of recentFolders) {
          const files = await getFolderFiles(folder.id)
          allFilesRecent = [...allFilesRecent, ...files]
        }

        // Sortiere nach Datum und nimm die neuesten 5
        allFilesRecent.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        setRecentFiles(allFilesRecent.slice(0, 5))
      } catch (error) {
        console.error("Fehler beim Laden der Dashboard-Daten:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [userId])

  // Hilfsfunktion zum Formatieren von Bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Lade-Indikator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Abonnement-Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Abonnement-Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">{planInfo.name} Plan</h3>
              <p className="text-sm text-muted-foreground">
                Gültig bis: {new Intl.DateTimeFormat("de-DE").format(planInfo.expiresAt)}
              </p>
            </div>
            <Badge variant={planInfo.isActive ? "default" : "destructive"}>
              {planInfo.isActive ? "Aktiv" : "Inaktiv"}
            </Badge>
          </div>
          <Button variant="outline" className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Upgrade auf Premium
          </Button>
        </CardContent>
      </Card>

      {/* Speichernutzung */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Speichernutzung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Verwendet: {formatBytes(storageUsage.used)}</span>
              <span>Gesamt: {formatBytes(storageUsage.total)}</span>
            </div>
            <Progress value={storageUsage.percentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {storageUsage.percentage.toFixed(1)}% des verfügbaren Speichers verwendet
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Aktivitätsübersicht */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Aktivitätsübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Uploads (30 Tage)</span>
              </div>
              <span className="font-medium">24</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Downloads (30 Tage)</span>
              </div>
              <span className="font-medium">87</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Letzte Anmeldung</span>
              </div>
              <span className="font-medium">Heute, 10:23 Uhr</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limits und Funktionen */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Limits und Funktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Max. Dateigröße</span>
              <span className="font-medium">100 MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Ordner</span>
              <span className="font-medium">Unbegrenzt</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Unterstützte Dateitypen</span>
              <span className="font-medium">Alle</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kürzlich hinzugefügte Dateien */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle>Kürzlich hinzugefügte Dateien</CardTitle>
        </CardHeader>
        <CardContent>
          {recentFiles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Größe</TableHead>
                  <TableHead>Datum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {file.type.startsWith("image/") ? <Image className="h-4 w-4" /> : <File className="h-4 w-4" />}
                        <span className="truncate max-w-[200px]">{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatBytes(file.size)}</TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(file.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-4">
              <p className="text-muted-foreground">Keine Dateien vorhanden</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

