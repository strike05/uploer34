"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import {
  getGalleriesByUser,
  createGalleryFromFolder,
  deleteGallery,
  updateGallery,
  regenerateShareLink,
  enableShareLink,
  disableShareLink,
  enableMultipleShareLinks,
  disableMultipleShareLinks,
  deleteMultipleGalleries,
  exportGalleryData,
} from "@/lib/services/gallery-service"
import { getUserFolders, getFolderFiles } from "@/lib/storage-service"
import type { Gallery, Folder, CreateGalleryOptions, ShareLinkAccess, FileItem } from "@/types"

export function useGalleries(userId: string) {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog-States
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [selectedGallery, setSelectedGallery] = useState<string | null>(null)

  // Formular-States
  const [newGalleryName, setNewGalleryName] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("")

  // Dateien für die Galerie-Vorschau
  const [folderFiles, setFolderFiles] = useState<FileItem[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)

  // Lade Galerien und Ordner
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        // Lade Galerien
        const userGalleries = await getGalleriesByUser(userId)
        setGalleries(userGalleries)

        // Lade Ordner für die Auswahl
        const userFolders = await getUserFolders(userId)
        setFolders(userFolders)
      } catch (err: any) {
        console.error("Fehler beim Laden der Daten:", err)
        setError(err.message || "Fehler beim Laden der Daten")
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadData()
    }
  }, [userId])

  // Handler-Funktionen
  const handleCreateGallery = async (options: CreateGalleryOptions) => {
    if (!options.name || !selectedFolder) return

    try {
      const folderObj = folders.find((f) => f.id === selectedFolder)
      if (!folderObj) {
        throw new Error("Ausgewählter Ordner nicht gefunden")
      }

      const result = await createGalleryFromFolder(userId, folderObj, options)

      if (result.success && result.gallery) {
        setGalleries([...galleries, result.gallery])
        setNewGalleryName("")
        setSelectedFolder("")
        setIsCreateDialogOpen(false)

        toast({
          title: "Galerie erstellt",
          description: `Die Galerie "${options.name}" wurde erfolgreich erstellt.`,
        })
      } else {
        throw new Error(result.error || "Fehler beim Erstellen der Galerie")
      }
    } catch (err: any) {
      console.error("Fehler beim Erstellen der Galerie:", err)
      toast({
        title: "Fehler",
        description: err.message || "Fehler beim Erstellen der Galerie",
        variant: "destructive",
      })
    }
  }

  const handleUpdateGallery = async (galleryId: string, updates: Partial<Gallery>) => {
    try {
      const result = await updateGallery(galleryId, updates)

      if (result.success) {
        // Aktualisiere die Galerie in der lokalen State
        setGalleries(galleries.map((gallery) => (gallery.id === galleryId ? { ...gallery, ...updates } : gallery)))

        setIsEditDialogOpen(false)

        toast({
          title: "Galerie aktualisiert",
          description: "Die Galerie wurde erfolgreich aktualisiert.",
        })
      } else {
        throw new Error(result.error || "Fehler beim Aktualisieren der Galerie")
      }
    } catch (err: any) {
      console.error("Fehler beim Aktualisieren der Galerie:", err)
      toast({
        title: "Fehler",
        description: err.message || "Fehler beim Aktualisieren der Galerie",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGallery = async (id: string) => {
    try {
      const result = await deleteGallery(id)

      if (result.success) {
        setGalleries(galleries.filter((gallery) => gallery.id !== id))
        toast({
          title: "Galerie gelöscht",
          description: "Die Galerie wurde erfolgreich gelöscht.",
        })
      } else {
        throw new Error(result.error || "Fehler beim Löschen der Galerie")
      }
    } catch (err: any) {
      console.error("Fehler beim Löschen der Galerie:", err)
      toast({
        title: "Fehler",
        description: err.message || "Fehler beim Löschen der Galerie",
        variant: "destructive",
      })
    }
  }

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast({
      title: "Link kopiert",
      description: "Der Galerie-Link wurde in die Zwischenablage kopiert.",
    })
  }

  const handleShareGallery = (id: string) => {
    setSelectedGallery(id)
    setIsShareDialogOpen(true)
  }

  const handleEditGallery = (id: string) => {
    setSelectedGallery(id)
    setIsEditDialogOpen(true)
  }

  const handleRegenerateShareLink = async (
    galleryId: string,
    options?: {
      expiresAt?: Date
      password?: string | null
      access?: ShareLinkAccess
    },
  ) => {
    try {
      const result = await regenerateShareLink(galleryId, options)

      if (result.success && result.shareLink) {
        // Aktualisiere die Galerie in der lokalen State
        setGalleries(
          galleries.map((gallery) => {
            if (gallery.id === galleryId) {
              return {
                ...gallery,
                shareLink: result.shareLink!,
                shareEnabled: true,
                shareExpiresAt: options?.expiresAt || null,
                sharePassword: options?.password || null,
                shareAccess: options?.access || "public",
              }
            }
            return gallery
          }),
        )

        toast({
          title: "Link aktualisiert",
          description: "Der Share-Link wurde erfolgreich aktualisiert.",
        })
      } else {
        throw new Error(result.error || "Fehler beim Aktualisieren des Share-Links")
      }
    } catch (err: any) {
      console.error("Fehler beim Aktualisieren des Share-Links:", err)
      toast({
        title: "Fehler",
        description: err.message || "Fehler beim Aktualisieren des Share-Links",
        variant: "destructive",
      })
    }
  }

  const handleToggleShareLink = async (galleryId: string, enabled: boolean) => {
    try {
      const result = enabled ? await enableShareLink(galleryId) : await disableShareLink(galleryId)

      if (result.success) {
        // Aktualisiere die Galerie in der lokalen State
        setGalleries(
          galleries.map((gallery) => {
            if (gallery.id === galleryId) {
              return { ...gallery, shareEnabled: enabled }
            }
            return gallery
          }),
        )

        toast({
          title: enabled ? "Link aktiviert" : "Link deaktiviert",
          description: `Der Share-Link wurde erfolgreich ${enabled ? "aktiviert" : "deaktiviert"}.`,
        })
      } else {
        throw new Error(result.error || `Fehler beim ${enabled ? "Aktivieren" : "Deaktivieren"} des Share-Links`)
      }
    } catch (err: any) {
      console.error(`Fehler beim ${enabled ? "Aktivieren" : "Deaktivieren"} des Share-Links:`, err)
      toast({
        title: "Fehler",
        description: err.message || `Fehler beim ${enabled ? "Aktivieren" : "Deaktivieren"} des Share-Links`,
        variant: "destructive",
      })
    }
  }

  // Lade Dateien für einen Ordner (für die Galerie-Vorschau)
  const loadFolderFiles = useCallback(async (folderId: string) => {
    if (!folderId) return

    setIsLoadingFiles(true)
    try {
      const files = await getFolderFiles(folderId)
      // Filtere nur Bilder und Videos
      const mediaFiles = files.filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))
      setFolderFiles(mediaFiles)
    } catch (err: any) {
      console.error("Fehler beim Laden der Dateien:", err)
      toast({
        title: "Fehler",
        description: "Die Dateien konnten nicht geladen werden.",
        variant: "destructive",
      })
      setFolderFiles([])
    } finally {
      setIsLoadingFiles(false)
    }
  }, [])

  // Batch-Operationen für mehrere Galerien
  const handleDeleteMultipleGalleries = async (galleryIds: string[]) => {
    try {
      const result = await deleteMultipleGalleries(galleryIds)

      if (result.success) {
        // Aktualisiere die Galerie-Liste
        setGalleries(galleries.filter((gallery) => !galleryIds.includes(gallery.id)))

        toast({
          title: "Galerien gelöscht",
          description: `${galleryIds.length} Galerien wurden erfolgreich gelöscht.`,
        })

        return true
      } else {
        throw new Error(result.error || "Fehler beim Löschen der Galerien")
      }
    } catch (err: any) {
      console.error("Fehler beim Löschen mehrerer Galerien:", err)
      toast({
        title: "Fehler",
        description: err.message || "Fehler beim Löschen der Galerien",
        variant: "destructive",
      })
      return false
    }
  }

  const handleEnableMultipleShareLinks = async (galleryIds: string[]) => {
    try {
      const result = await enableMultipleShareLinks(galleryIds)

      if (result.success) {
        // Aktualisiere die Galerie-Liste
        setGalleries(
          galleries.map((gallery) => {
            if (galleryIds.includes(gallery.id)) {
              return { ...gallery, shareEnabled: true }
            }
            return gallery
          }),
        )

        toast({
          title: "Share-Links aktiviert",
          description: `Share-Links für ${galleryIds.length} Galerien wurden aktiviert.`,
        })

        return true
      } else {
        throw new Error(result.error || "Fehler beim Aktivieren der Share-Links")
      }
    } catch (err: any) {
      console.error("Fehler beim Aktivieren mehrerer Share-Links:", err)
      toast({
        title: "Fehler",
        description: err.message || "Fehler beim Aktivieren der Share-Links",
        variant: "destructive",
      })
      return false
    }
  }

  const handleDisableMultipleShareLinks = async (galleryIds: string[]) => {
    try {
      const result = await disableMultipleShareLinks(galleryIds)

      if (result.success) {
        // Aktualisiere die Galerie-Liste
        setGalleries(
          galleries.map((gallery) => {
            if (galleryIds.includes(gallery.id)) {
              return { ...gallery, shareEnabled: false }
            }
            return gallery
          }),
        )

        toast({
          title: "Share-Links deaktiviert",
          description: `Share-Links für ${galleryIds.length} Galerien wurden deaktiviert.`,
        })

        return true
      } else {
        throw new Error(result.error || "Fehler beim Deaktivieren der Share-Links")
      }
    } catch (err: any) {
      console.error("Fehler beim Deaktivieren mehrerer Share-Links:", err)
      toast({
        title: "Fehler",
        description: err.message || "Fehler beim Deaktivieren der Share-Links",
        variant: "destructive",
      })
      return false
    }
  }

  const handleExportGalleryData = async (selectedGalleries: Gallery[]) => {
    try {
      // Exportiere die Daten als JSON
      const jsonData = exportGalleryData(selectedGalleries)

      // Erstelle einen Blob und einen Download-Link
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      // Erstelle einen temporären Link und klicke ihn an
      const link = document.createElement("a")
      link.href = url
      link.download = `gallery-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()

      // Bereinige
      URL.revokeObjectURL(url)
      document.body.removeChild(link)

      toast({
        title: "Daten exportiert",
        description: `Daten für ${selectedGalleries.length} Galerien wurden exportiert.`,
      })

      return true
    } catch (err: any) {
      console.error("Fehler beim Exportieren der Galerie-Daten:", err)
      toast({
        title: "Fehler",
        description: err.message || "Fehler beim Exportieren der Daten",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    galleries,
    folders,
    isLoading,
    error,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isShareDialogOpen,
    setIsShareDialogOpen,
    selectedGallery,
    setSelectedGallery,
    newGalleryName,
    setNewGalleryName,
    selectedFolder,
    setSelectedFolder,
    folderFiles,
    isLoadingFiles,
    loadFolderFiles,
    handleCreateGallery,
    handleUpdateGallery,
    handleDeleteGallery,
    handleCopyLink,
    handleShareGallery,
    handleEditGallery,
    handleRegenerateShareLink,
    handleToggleShareLink,
    // Neue Batch-Operationen
    handleDeleteMultipleGalleries,
    handleEnableMultipleShareLinks,
    handleDisableMultipleShareLinks,
    handleExportGalleryData,
  }
}

