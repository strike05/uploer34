"use client"

import { useState, useEffect } from "react"
import { getProblematicFiles, repairFile, adminDeleteFile } from "@/lib/services/admin-service"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, ExternalLink, FileX, RefreshCw, Wrench, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function FileModeration() {
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<any | null>(null)
  const [isRepairDialogOpen, setIsRepairDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const loadFiles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const problematicFiles = await getProblematicFiles()
      setFiles(problematicFiles)
    } catch (error: any) {
      setError(error.message || "Fehler beim Laden der Dateien")
      toast({
        title: "Fehler",
        description: "Problematische Dateien konnten nicht geladen werden",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepairFile = async () => {
    if (!selectedFile) return

    try {
      setIsProcessing(true)
      await repairFile(selectedFile.id)
      
      toast({
        title: "Datei repariert",
        description: "Die Datei wurde erfolgreich repariert.",
      })
      
      // Entferne die Datei aus der Liste oder lade die Liste neu
      setFiles(files.filter(file => file.id !== selectedFile.id))
      
      // Schließe den Dialog
      setIsRepairDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Die Datei konnte nicht repariert werden.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setSelectedFile(null)
    }
  }

  const handleDeleteFile = async () => {
    if (!selectedFile) return

    try {
      setIsProcessing(true)
      await adminDeleteFile(selectedFile.id)
      
      toast({
        title: "Datei gelöscht",
        description: "Die Datei wurde erfolgreich aus dem System entfernt.",
      })
      
      // Entferne die Datei aus der Liste oder lade die Liste neu
      setFiles(files.filter(file => file.id !== selectedFile.id))
      
      // Schließe den Dialog
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Die Datei konnte nicht gelöscht werden.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setSelectedFile(null)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const formatDate = (date?: Date) => {
    if (!date) return "Unbekannt"
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 Bytes"
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Number.parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Dateimoderation</CardTitle>
            <CardDescription>Problematische Dateien identifizieren und verwalten</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadFiles} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Aktualisieren</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </p>
            <Button onClick={loadFiles} className="mt-4">
              Erneut versuchen
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileX className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Keine problematischen Dateien gefunden</p>
            <p className="text-sm text-muted-foreground mt-2">Alle Dateien im System scheinen in Ordnung zu sein.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Ordner</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Größe</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.name || "Ohne Namen"}</TableCell>
                    <TableCell>{file.folderId || "Unbekannt"}</TableCell>
                    <TableCell>{file.userId || "Unbekannt"}</TableCell>
                    <TableCell>{formatBytes(file.size)}</TableCell>
                    <TableCell>{formatDate(file.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{file.issue}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {file.url && (
                          <Button variant="outline" size="sm" onClick={() => window.open(file.url, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Öffnen
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(file)
                            setIsRepairDialogOpen(true)
                          }}
                        >
                          <Wrench className="h-4 w-4 mr-2" />
                          Reparieren
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => {
                            setSelectedFile(file)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Reparieren-Dialog */}
      <AlertDialog open={isRepairDialogOpen} onOpenChange={setIsRepairDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Datei reparieren</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Datei "{selectedFile?.name || 'Unbekannt'}" reparieren? 
              Das System wird versuchen, fehlende Metadaten und Links zu korrigieren.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRepairFile}
              disabled={isProcessing}
              className="bg-primary hover:bg-primary/90"
            >
              {isProcessing ? "Wird repariert..." : "Reparieren"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Löschen-Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Datei löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Datei "{selectedFile?.name || 'Unbekannt'}" wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden und entfernt alle Metadaten und Dateien.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFile}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Wird gelöscht..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

