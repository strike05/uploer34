"use client"

import { useState, useEffect } from "react"
import { getUserFolders, createFolder } from "@/lib/storage-service"
import type { Folder } from "@/types"

// UI-Komponenten
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"

// Icons
import { FolderIcon, Plus, Loader2, AlertCircle } from "lucide-react"

// Typen
interface FolderListProps {
  userId: string
  onSelectFolder: (folder: Folder) => void
  selectedFolderId?: string
}

// Unterkomponenten
function NewFolderDialog({
  isOpen,
  onOpenChange,
  onCreateFolder,
  isCreating,
  error,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreateFolder: (name: string) => void
  isCreating: boolean
  error: string | null
}) {
  const [folderName, setFolderName] = useState("")

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuen Ordner erstellen</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="py-4">
          <Input placeholder="Ordnername" value={folderName} onChange={(e) => setFolderName(e.target.value)} />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Abbrechen</Button>
          </DialogClose>
          <Button onClick={() => onCreateFolder(folderName)} disabled={isCreating || !folderName.trim()}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Erstelle...
              </>
            ) : (
              "Erstellen"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hauptkomponente
export function FolderList({ userId, onSelectFolder, selectedFolderId }: FolderListProps) {
  // State
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Ordner laden
  useEffect(() => {
    const loadFolders = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const userFolders = await getUserFolders(userId)

        // Sortiere die Ordner nach Erstellungsdatum (neueste zuerst)
        const sortedFolders = userFolders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        setFolders(sortedFolders)

        // Wenn Ordner vorhanden sind und keiner ausgewählt ist, wähle den ersten nicht-Root Ordner
        if (sortedFolders.length > 0 && !selectedFolderId) {
          const nonRootFolders = sortedFolders.filter((folder) => !folder.isRoot && folder.name !== "Root")
          if (nonRootFolders.length > 0) {
            // Wähle den neuesten Ordner (sollte bereits der erste in der sortierten Liste sein)
            onSelectFolder(nonRootFolders[0])
          }
        }
      } catch (err: any) {
        console.error("Fehler beim Laden der Ordner:", err)
        setError(err.message || "Fehler beim Abrufen der Ordner")
      } finally {
        setIsLoading(false)
      }
    }

    loadFolders()
  }, [userId, selectedFolderId, onSelectFolder])

  // Neuen Ordner erstellen
  const handleCreateFolder = async (folderName: string) => {
    if (!folderName.trim() || !userId) return

    setIsCreating(true)
    setError(null)

    try {
      const result = await createFolder(userId, folderName)

      if (result.success) {
        setIsDialogOpen(false)
        // Ordnerliste aktualisieren
        const userFolders = await getUserFolders(userId)

        // Sortiere die Ordner nach Erstellungsdatum (neueste zuerst)
        const sortedFolders = userFolders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        setFolders(sortedFolders)

        // Wähle den neu erstellten Ordner automatisch aus
        if (result.folderId) {
          const newFolder = userFolders.find((folder) => folder.id === result.folderId)
          if (newFolder) {
            onSelectFolder(newFolder)
          }
        }
      } else {
        throw new Error("Fehler beim Erstellen des Ordners")
      }
    } catch (err: any) {
      console.error("Fehler beim Erstellen des Ordners:", err)
      setError(err.message || "Fehler beim Erstellen des Ordners")
    } finally {
      setIsCreating(false)
    }
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Meine Ordner</h3>
        <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Neuer Ordner
        </Button>
      </div>

      {/* Fehleranzeige */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Ordnerliste */}
      <div className="space-y-2">
        {folders.length === 0 ? (
          <div className="text-center p-4 border rounded-md bg-muted/20">
            <p className="text-muted-foreground">Keine Ordner vorhanden</p>
          </div>
        ) : (
          folders
            .filter((folder) => !folder.isRoot && folder.name !== "Root") // Filtere den Root-Ordner und Ordner mit Namen "Root" aus
            .map((folder) => (
              <Button
                key={folder.id}
                variant={selectedFolderId === folder.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSelectFolder(folder)}
              >
                <FolderIcon className="h-4 w-4 mr-2" />
                {folder.name === "Root" ? "Hauptverzeichnis" : folder.name}
              </Button>
            ))
        )}
      </div>

      {/* Dialog zum Erstellen eines neuen Ordners */}
      <NewFolderDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreateFolder={handleCreateFolder}
        isCreating={isCreating}
        error={error}
      />
    </div>
  )
}

