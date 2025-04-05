"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GalleryCard } from "./gallery-card"
import { CreateGalleryDialog } from "./create-gallery-dialog"
import { ShareGalleryDialog } from "./share-gallery-dialog"
import { EditGalleryDialog } from "./edit-gallery-dialog"
import { BatchOperations } from "./batch-operations"
import { useGalleries } from "@/hooks/use-galleries"
import { ImageGallery } from "@/components/image-gallery/image-gallery"
import { GalleryStatistics } from "./gallery-statistics"
import { Image, Plus, BarChart, Settings as SettingsIcon, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import type { GalleryViewProps } from "@/types"

export function GalleryView({ userId }: GalleryViewProps) {
  const router = useRouter()
  // State für aktiven Tab
  const [activeTab, setActiveTab] = useState("galleries")
  const [selectedStatisticsGallery, setSelectedStatisticsGallery] = useState<string | null>(null)
  const [selectedGalleryForPreview, setSelectedGalleryForPreview] = useState<string | null>(null)

  // Verwende den Custom Hook für die Galerie-Verwaltung
  const {
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
    newGalleryName,
    setNewGalleryName,
    selectedFolder,
    setSelectedFolder,
    handleCreateGallery,
    handleUpdateGallery,
    handleDeleteGallery,
    handleCopyLink,
    handleShareGallery,
    handleEditGallery,
    handleRegenerateShareLink,
    handleToggleShareLink,
    folderFiles,
    loadFolderFiles,
    // Neue Batch-Operationen
    handleDeleteMultipleGalleries,
    handleEnableMultipleShareLinks,
    handleDisableMultipleShareLinks,
    handleExportGalleryData,
  } = useGalleries(userId)

  // Lade Dateien für die ausgewählte Galerie zur Vorschau
  useEffect(() => {
    if (selectedGalleryForPreview) {
      const gallery = galleries.find((g) => g.id === selectedGalleryForPreview)
      if (gallery) {
        loadFolderFiles(gallery.folderId)
      }
    }
  }, [selectedGalleryForPreview, galleries, loadFolderFiles])

  // Öffne die Galerie-Vorschau, wenn eine Galerie erstellt wurde
  const handleGalleryCreated = async (options: any) => {
    const result = await handleCreateGallery(options)
    if (result && result.success && result.gallery) {
      // Wechsle zur Vorschau und zeige die neu erstellte Galerie an
      setSelectedGalleryForPreview(result.gallery.id)
      setActiveTab("preview")
    }
  }

  // Öffne die Galerie-Vorschau für eine bestehende Galerie
  const handleViewGallery = (galleryId: string) => {
    setSelectedGalleryForPreview(galleryId)
    setActiveTab("preview")
  }

  // Öffne die öffentliche Galerie-Ansicht
  const handleOpenPublicView = (galleryId: string) => {
    const gallery = galleries.find((g) => g.id === galleryId)
    if (gallery && gallery.shareId) {
      // Überprüfen, ob die Galerie für den öffentlichen Zugriff aktiviert ist
      if (!gallery.shareEnabled) {
        toast({
          title: "Galerie nicht öffentlich",
          description: "Diese Galerie ist derzeit nicht für den öffentlichen Zugriff aktiviert.",
          variant: "destructive",
        })
        return
      }
      
      // Überprüfen, ob die Galerie abgelaufen ist
      if (gallery.shareExpiresAt && new Date(gallery.shareExpiresAt) < new Date()) {
        toast({
          title: "Galerie abgelaufen",
          description: "Der Freigabe-Link für diese Galerie ist abgelaufen.",
          variant: "destructive",
        })
        return
      }
      
      // Öffne die öffentliche Ansicht in einem neuen Tab
      // Stelle sicher, dass wir immer den /s/ Pfad verwenden
      const origin = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_APP_URL || ""

      // Stelle sicher, dass der Link korrekt formatiert ist
      const shareUrl = `${origin}/s/${gallery.shareId}`

      console.log("Öffne Galerie-Link:", shareUrl)
      window.open(shareUrl, "_blank")
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Galerie verwalten</h1>
          <p className="text-muted-foreground">Erstellen und verwalten Sie Ihre öffentlichen Galerien</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Neue Galerie
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full bg-background shadow-sm border overflow-x-auto flex-nowrap">
          <TabsTrigger value="galleries" className="flex-1">
            Galerien
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1">
            Vorschau
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex-1">
            Statistik
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            Einstellungen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="galleries" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : galleries.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <Image className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Galerien vorhanden</h3>
              <p className="text-muted-foreground text-center mb-4">
                Sie haben noch keine Galerien erstellt. Erstellen Sie eine Galerie, um Ihre Bilder und Videos mit
                anderen zu teilen.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Neue Galerie
              </Button>
            </div>
          ) : (
            <>
              {/* Batch-Operationen für Galerien */}
              <BatchOperations
                galleries={galleries}
                onDeleteMultiple={handleDeleteMultipleGalleries}
                onEnableMultiple={handleEnableMultipleShareLinks}
                onDisableMultiple={handleDisableMultipleShareLinks}
                onExportData={handleExportGalleryData}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {galleries.map((gallery) => (
                  <div key={gallery.id} className="relative">
                    <div className="absolute top-2 right-2 z-10 flex space-x-1">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-white/80 hover:bg-white dark:bg-black/80 dark:hover:bg-black rounded-full"
                        onClick={() => handleViewGallery(gallery.id)}
                        title="Galerie-Vorschau"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-white/80 hover:bg-white dark:bg-black/80 dark:hover:bg-black rounded-full"
                        onClick={() => handleOpenPublicView(gallery.id)}
                        title="Öffentliche Ansicht"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>
                    <GalleryCard
                      gallery={gallery}
                      onEdit={handleEditGallery}
                      onShare={handleShareGallery}
                      onDelete={handleDeleteGallery}
                      onCopyLink={handleCopyLink}
                      onView={handleViewGallery}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {selectedGalleryForPreview ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  {galleries.find((g) => g.id === selectedGalleryForPreview)?.name || "Galerie-Vorschau"}
                </h2>
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleOpenPublicView(selectedGalleryForPreview)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    <span>Öffentlich</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleEditGallery(selectedGalleryForPreview)}
                  >
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Bearbeiten</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleShareGallery(selectedGalleryForPreview)}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    <span>Teilen</span>
                  </Button>
                </div>
              </div>

              {folderFiles.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <ImageGallery
                    files={folderFiles}
                    folderId={galleries.find((g) => g.id === selectedGalleryForPreview)?.folderId || ""}
                  />
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <p className="text-muted-foreground">Keine Bilder in dieser Galerie gefunden.</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setActiveTab("galleries")}>
                  Zurück zur Übersicht
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <Image className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Galerie ausgewählt</h3>
              <p className="text-muted-foreground text-center mb-4">
                Bitte wählen Sie eine Galerie aus der Übersicht aus oder erstellen Sie eine neue Galerie.
              </p>
              <Button onClick={() => setActiveTab("galleries")}>Zur Galerie-Übersicht</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Galerie-Statistiken
              </h3>
              <p className="text-muted-foreground">Sehen Sie sich die Nutzungsstatistiken Ihrer Galerien an.</p>
            </div>

            {galleries.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                  {galleries.map((gallery) => (
                    <Button
                      key={gallery.id}
                      variant={selectedStatisticsGallery === gallery.id ? "default" : "outline"}
                      className="justify-start overflow-hidden text-xs sm:text-sm h-auto py-2"
                      onClick={() => setSelectedStatisticsGallery(gallery.id)}
                    >
                      <Image className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">{gallery.name}</span>
                    </Button>
                  ))}
                </div>

                {selectedStatisticsGallery && (
                  <div className="mt-8">
                    <GalleryStatistics galleryId={selectedStatisticsGallery} />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Keine Galerien vorhanden. Erstellen Sie eine Galerie, um Statistiken zu sehen.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                Galerie-Einstellungen
              </h3>
              <p className="text-muted-foreground text-sm">
                Konfigurieren Sie globale Einstellungen für alle Ihre Galerien.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm sm:text-base">Standard-Layout</h4>
                  <select className="w-full p-2 border rounded-md text-sm">
                    <option value="grid">Raster</option>
                    <option value="masonry">Masonry</option>
                    <option value="carousel">Karussell</option>
                    <option value="slideshow">Diashow</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm sm:text-base">Standard-Farbschema</h4>
                  <select className="w-full p-2 border rounded-md text-sm">
                    <option value="light">Hell</option>
                    <option value="dark">Dunkel</option>
                    <option value="custom">Benutzerdefiniert</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full sm:w-auto">Einstellungen speichern</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog-Komponenten */}
      <CreateGalleryDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        newGalleryName={newGalleryName}
        setNewGalleryName={setNewGalleryName}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        folders={folders}
        onCreateGallery={handleGalleryCreated}
      />

      <ShareGalleryDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        selectedGallery={selectedGallery}
        galleries={galleries}
        onCopyLink={handleCopyLink}
        onRegenerateLink={handleRegenerateShareLink}
        onToggleShareLink={handleToggleShareLink}
      />

      <EditGalleryDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedGallery={selectedGallery}
        galleries={galleries}
        onSave={handleUpdateGallery}
      />
    </div>
  )
}

