"use client"

import { useState, useEffect } from "react"
import { getFolderFiles, deleteFile } from "@/lib/storage-service"
import type { FileItem } from "@/types"

// UI-Komponenten
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

// Importieren Sie die Konfiguration am Anfang der Datei
import { FILE_CONFIG } from "@/lib/config"

// Füge den Link-Icon zu den Imports hinzu, falls noch nicht vorhanden
// Icons
import {
  File,
  Image,
  FileText,
  FileCode,
  Music,
  Video,
  Package,
  MoreVertical,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LinkIcon,
} from "lucide-react"

// Typen
interface FileListProps {
  userId: string
  folderId: string
  refreshTrigger: number
}

// Unterkomponenten-Typen
interface FileActionsProps {
  file: FileItem
  onPreview: (file: FileItem) => void
  onDelete: (file: FileItem) => void
}

interface ImagePreviewProps {
  file: FileItem
  imageFiles: FileItem[]
  currentIndex: number
  onNavigate: (direction: "next" | "prev") => void
  onDelete: () => void
  isDeleting: boolean
}

interface DeleteConfirmationProps {
  fileName: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

// Hilfsfunktionen
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />
  if (fileType.startsWith("text/")) return <FileText className="h-4 w-4" />
  if (fileType.startsWith("audio/")) return <Music className="h-4 w-4" />
  if (fileType.startsWith("video/")) return <Video className="h-4 w-4" />
  if (fileType.includes("javascript") || fileType.includes("json") || fileType.includes("html"))
    return <FileCode className="h-4 w-4" />
  if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("tar"))
    return <Package className="h-4 w-4" />
  return <File className="h-4 w-4" />
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB"
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Ändern Sie die FileActions-Komponente, um die korrekte direkte URL-Struktur zu verwenden

function FileActions({ file, onPreview, onDelete }: FileActionsProps) {
  // Erstelle die direkte URL mit dem richtigen Pfad
  const directUrl = FILE_CONFIG.directFileUrlPattern(file.folderId, file.name)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {file.type.startsWith("image/") && (
          <DropdownMenuItem onClick={() => onPreview(file)}>
            <Image className="h-4 w-4 mr-2" />
            Anzeigen
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <a href={directUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
            <LinkIcon className="h-4 w-4 mr-2" />
            Direkter Link
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Herunterladen
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            onDelete(file)
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Löschen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ImagePreview({ file, imageFiles, currentIndex, onNavigate, onDelete, isDeleting }: ImagePreviewProps) {
  return (
    <div className="flex justify-center items-center relative">
      {/* Navigationspfeile nur anzeigen, wenn es mehr als ein Bild gibt */}
      {imageFiles.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full"
            onClick={() => onNavigate("prev")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full"
            onClick={() => onNavigate("next")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Bildanzeige */}
      <div className="flex flex-col items-center justify-center w-full">
        <img
          src={FILE_CONFIG.directFileUrlPattern(file.folderId, file.name) || "/placeholder.svg"}
          alt={file.name}
          className="max-h-[70vh] max-w-full object-contain"
          onError={(e) => {
            console.error("Fehler beim Laden des Bildes:", FILE_CONFIG.directFileUrlPattern(file.folderId, file.name))
            e.currentTarget.onerror = null
            e.currentTarget.src = "/placeholder.svg?height=300&width=300"
            toast({
              title: "Bildvorschau nicht verfügbar",
              description: "Das Bild konnte nicht geladen werden. Sie können es trotzdem herunterladen.",
              variant: "warning",
            })
          }}
          crossOrigin="anonymous"
        />

        {/* Bildinfo und Link */}
        <div className="mt-2 text-sm text-gray-500">
          {imageFiles.length > 1 && (
            <span className="mr-2">
              Bild {currentIndex + 1} von {imageFiles.length}
            </span>
          )}
          {file.url ? (
            <a
              href={FILE_CONFIG.directFileUrlPattern(file.folderId, file.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Bild in neuem Tab öffnen
            </a>
          ) : (
            "Keine Bild-URL verfügbar"
          )}
        </div>
      </div>

      {/* Löschen-Button */}
      <div className="absolute bottom-2 right-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="opacity-70 hover:opacity-100"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Löschen
        </Button>
      </div>
    </div>
  )
}

function DeleteConfirmation({ fileName, onConfirm, onCancel, isDeleting }: DeleteConfirmationProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Datei löschen</h3>
        <p className="mb-6">
          Möchten Sie die Datei "{fileName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        <div className="flex justify-end gap-4">
          <Button variant="outline" size="default" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button variant="destructive" size="default" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Löschen...
              </>
            ) : (
              "Löschen"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Hauptkomponente
export function FileList({ userId, folderId, refreshTrigger }: FileListProps) {
  // State
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false)

  // Abgeleitete Werte
  const imageFiles = files.filter((f) => f.type.startsWith("image/"))
  const currentImageIndex = previewFile ? imageFiles.findIndex((f) => f.id === previewFile.id) : -1

  // Dateien laden
  useEffect(() => {
    const loadFiles = async () => {
      if (!folderId || !userId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const folderFiles = await getFolderFiles(folderId)
        setFiles(folderFiles)
      } catch (err: any) {
        console.error("Fehler beim Laden der Dateien:", err)
        setError(err.message || "Fehler beim Abrufen der Dateien")
      } finally {
        setIsLoading(false)
      }
    }

    loadFiles()
  }, [folderId, userId, refreshTrigger])

  // Event-Handler
  const handleDeleteFile = async (file: FileItem) => {
    if (!userId) return

    setIsDeleting(true)
    const result = await deleteFile(userId, file)
    setIsDeleting(false)

    if (result.success) {
      setFiles(files.filter((f) => f.id !== file.id))
      toast({
        title: "Datei gelöscht",
        description: `${file.name} wurde erfolgreich gelöscht.`,
      })

      // Wenn die Vorschau-Datei gelöscht wurde, Vorschau schließen
      if (previewFile?.id === file.id) {
        setPreviewFile(null)
      }
    } else {
      toast({
        title: "Fehler beim Löschen",
        description: "Die Datei konnte nicht gelöscht werden.",
        variant: "destructive",
      })
    }

    setFileToDelete(null)
    setShowDeleteConfirm(false)
  }

  // Navigation zwischen Bildern
  const navigateImages = (direction: "next" | "prev") => {
    if (imageFiles.length <= 1 || currentImageIndex === -1) return

    const newIndex =
      direction === "next"
        ? (currentImageIndex + 1) % imageFiles.length
        : (currentImageIndex - 1 + imageFiles.length) % imageFiles.length

    setPreviewFile(imageFiles[newIndex])
  }

  // Lade-Indikator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Fehleranzeige
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Dateien</h3>

      {/* Keine Dateien Anzeige */}
      {files.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">Keine Dateien in diesem Ordner</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Größe</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <span className="truncate max-w-[200px]" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>{formatDate(file.createdAt)}</TableCell>
                  <TableCell>
                    <FileActions file={file} onPreview={setPreviewFile} onDelete={setFileToDelete} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Bildvorschau-Dialog */}
      <Dialog open={previewFile !== null} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>

          {previewFile && (
            <ImagePreview
              file={previewFile}
              imageFiles={imageFiles}
              currentIndex={currentImageIndex}
              onNavigate={navigateImages}
              onDelete={() => setShowDeleteConfirm(true)}
              isDeleting={isDeleting}
            />
          )}

          {/* Lösch-Bestätigung */}
          {showDeleteConfirm && previewFile && (
            <DeleteConfirmation
              fileName={previewFile.name}
              onConfirm={() => handleDeleteFile(previewFile)}
              onCancel={() => setShowDeleteConfirm(false)}
              isDeleting={isDeleting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Lösch-Dialog für Dateiliste */}
      <AlertDialog open={fileToDelete !== null} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Datei löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Datei "{fileToDelete?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => fileToDelete && handleDeleteFile(fileToDelete)} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Löschen...
                </>
              ) : (
                "Löschen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

