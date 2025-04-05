"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Image, Copy, Eye, EyeOff, Share2, Download, Trash2, Settings, Plus } from "lucide-react"
import type { Folder } from "@/types"

interface GalleryViewProps {
  userId: string
}

// Dialog-Komponenten
function CreateGalleryDialog({
  isOpen,
  onOpenChange,
  newGalleryName,
  setNewGalleryName,
  selectedFolder,
  setSelectedFolder,
  folders,
  onCreateGallery,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newGalleryName: string
  setNewGalleryName: (name: string) => void
  selectedFolder: string
  setSelectedFolder: (folder: string) => void
  folders: Folder[]
  onCreateGallery: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neue Galerie erstellen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="gallery-name">Galerie-Name</Label>
            <Input
              id="gallery-name"
              placeholder="z.B. Urlaubsfotos 2023"
              value={newGalleryName}
              onChange={(e) => setNewGalleryName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder-select">Ordner auswählen</Label>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger id="folder-select">
                <SelectValue placeholder="Wählen Sie einen Ordner" />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Alle Bilder und Videos aus diesem Ordner werden in der Galerie angezeigt
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry-date">Ablaufdatum (optional)</Label>
            <Input id="expiry-date" type="date" min={new Date().toISOString().split("T")[0]} />
            <p className="text-xs text-muted-foreground">
              Lassen Sie das Feld leer, wenn die Galerie unbegrenzt gültig sein soll
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="public-gallery" defaultChecked />
            <Label htmlFor="public-gallery">Öffentliche Galerie</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={onCreateGallery} disabled={!newGalleryName || !selectedFolder}>
            Galerie erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ShareGalleryDialog({
  isOpen,
  onOpenChange,
  selectedGallery,
  galleries,
  onCopyLink,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedGallery: string | null
  galleries: any[]
  onCopyLink: (link: string) => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Galerie teilen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {selectedGallery && (
            <>
              <div className="space-y-2">
                <Label>Teilen-Link</Label>
                <div className="flex space-x-2">
                  <Input value={galleries.find((g) => g.id === selectedGallery)?.shareLink || ""} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onCopyLink(galleries.find((g) => g.id === selectedGallery)?.shareLink || "")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>QR-Code</Label>
                <div className="flex justify-center p-4 bg-muted rounded-md">
                  <div className="w-40 h-40 bg-white flex items-center justify-center text-xs text-muted-foreground">
                    QR-Code Platzhalter
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    QR-Code herunterladen
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Teilen über</Label>
                <div className="flex space-x-2 justify-center">
                  {/* Social Media Buttons */}
                  <Button variant="outline" size="sm">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                  {/* Weitere Social Media Buttons */}
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditGalleryDialog({
  isOpen,
  onOpenChange,
  selectedGallery,
  galleries,
  onSave,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedGallery: string | null
  galleries: any[]
  onSave: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Galerie bearbeiten</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="appearance">Erscheinungsbild</TabsTrigger>
            <TabsTrigger value="security">Sicherheit</TabsTrigger>
          </TabsList>

          {/* Tab-Inhalte hier... */}
          <TabsContent value="general" className="space-y-4">
            {/* Allgemeine Einstellungen */}
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            {/* Erscheinungsbild-Einstellungen */}
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            {/* Sicherheitseinstellungen */}
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={() => {
              onSave()
              onOpenChange(false)
            }}
          >
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function GalleryCard({
  gallery,
  onEdit,
  onShare,
  onDelete,
  onCopyLink,
}: {
  gallery: any
  onEdit: (id: string) => void
  onShare: (id: string) => void
  onDelete: (id: string) => void
  onCopyLink: (link: string) => void
}) {
  const formatDate = (date: Date | null) => {
    if (!date) return "Unbegrenzt"
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
    <Card key={gallery.id}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{gallery.name}</span>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(gallery.id)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onShare(gallery.id)}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(gallery.id)}>
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
            <span className="text-muted-foreground">Aufrufe:</span>
            <span>{gallery.views}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex items-center space-x-2">
          <Input value={gallery.shareLink} readOnly className="text-xs" />
          <Button variant="outline" size="icon" onClick={() => onCopyLink(gallery.shareLink)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export function GalleryView({ userId }: GalleryViewProps) {
  // State für aktiven Tab
  const [activeTab, setActiveTab] = useState("galleries")

  // State für Galerien
  const [galleries, setGalleries] = useState<
    {
      id: string
      name: string
      folderId: string
      folderName: string
      createdAt: Date
      expiresAt: Date | null
      isPublic: boolean
      views: number
      shareLink: string
    }[]
  >([
    {
      id: "gal1",
      name: "Urlaubsfotos 2023",
      folderId: "folder1",
      folderName: "Urlaub 2023",
      createdAt: new Date(2023, 5, 15),
      expiresAt: new Date(2023, 11, 31),
      isPublic: true,
      views: 127,
      shareLink: "https://example.com/gallery/abc123",
    },
    {
      id: "gal2",
      name: "Familienfotos",
      folderId: "folder2",
      folderName: "Familie",
      createdAt: new Date(2023, 2, 10),
      expiresAt: null,
      isPublic: false,
      views: 43,
      shareLink: "https://example.com/gallery/def456",
    },
  ])

  // State für Dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [selectedGallery, setSelectedGallery] = useState<string | null>(null)

  // State für neue Galerie
  const [newGalleryName, setNewGalleryName] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("")

  // Dummy-Ordner für die Auswahl
  const folders: Folder[] = [
    { id: "folder1", name: "Urlaub 2023", userId: userId, createdAt: new Date(2023, 5, 1) },
    { id: "folder2", name: "Familie", userId: userId, createdAt: new Date(2023, 2, 1) },
    { id: "folder3", name: "Projekte", userId: userId, createdAt: new Date(2023, 1, 15) },
  ]

  // Formatierungsfunktionen
  const formatDate = (date: Date | null) => {
    if (!date) return "Unbegrenzt"
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  // Handler-Funktionen
  const handleCreateGallery = () => {
    // Hier würde die tatsächliche Erstellung der Galerie stattfinden
    const newGallery = {
      id: `gal${galleries.length + 1}`,
      name: newGalleryName,
      folderId: selectedFolder,
      folderName: folders.find((f) => f.id === selectedFolder)?.name || "",
      createdAt: new Date(),
      expiresAt: null,
      isPublic: true,
      views: 0,
      shareLink: `https://example.com/gallery/${Math.random().toString(36).substring(2, 10)}`,
    }

    setGalleries([...galleries, newGallery])
    setNewGalleryName("")
    setSelectedFolder("")
    setIsCreateDialogOpen(false)

    toast({
      title: "Galerie erstellt",
      description: `Die Galerie "${newGalleryName}" wurde erfolgreich erstellt.`,
    })
  }

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast({
      title: "Link kopiert",
      description: "Der Galerie-Link wurde in die Zwischenablage kopiert.",
    })
  }

  const handleDeleteGallery = (id: string) => {
    setGalleries(galleries.filter((gallery) => gallery.id !== id))
    toast({
      title: "Galerie gelöscht",
      description: "Die Galerie wurde erfolgreich gelöscht.",
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

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Galerie verwalten</h1>
          <p className="text-muted-foreground">Erstellen und verwalten Sie Ihre öffentlichen Galerien</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Galerie
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="galleries">Meine Galerien</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        <TabsContent value="galleries" className="space-y-4">
          {galleries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Image className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Keine Galerien vorhanden</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Sie haben noch keine Galerien erstellt. Erstellen Sie eine Galerie, um Ihre Bilder und Videos mit
                  anderen zu teilen.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Neue Galerie
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {galleries.map((gallery) => (
                <GalleryCard
                  key={gallery.id}
                  gallery={gallery}
                  onEdit={handleEditGallery}
                  onShare={handleShareGallery}
                  onDelete={handleDeleteGallery}
                  onCopyLink={handleCopyLink}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Standardeinstellungen für Galerien</CardTitle>
              <CardDescription>Diese Einstellungen werden für alle neuen Galerien verwendet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Öffentliche Galerien</Label>
                  <p className="text-sm text-muted-foreground">Neue Galerien standardmäßig öffentlich machen</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Standard-Ablaufdatum</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie eine Option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Tage</SelectItem>
                    <SelectItem value="30">30 Tage</SelectItem>
                    <SelectItem value="90">90 Tage</SelectItem>
                    <SelectItem value="365">1 Jahr</SelectItem>
                    <SelectItem value="0">Unbegrenzt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Wasserzeichen</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="watermark" />
                  <Label htmlFor="watermark">Wasserzeichen auf Bildern anzeigen</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Download-Qualität</Label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie eine Option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original</SelectItem>
                    <SelectItem value="high">Hoch (80%)</SelectItem>
                    <SelectItem value="medium">Mittel (60%)</SelectItem>
                    <SelectItem value="low">Niedrig (40%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Bestimmt die Qualität der Bilder, wenn Besucher sie herunterladen
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Einstellungen speichern</Button>
            </CardFooter>
          </Card>
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
        onCreateGallery={handleCreateGallery}
      />

      <ShareGalleryDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        selectedGallery={selectedGallery}
        galleries={galleries}
        onCopyLink={handleCopyLink}
      />

      <EditGalleryDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedGallery={selectedGallery}
        galleries={galleries}
        onSave={() => {
          toast({
            title: "Änderungen gespeichert",
            description: "Die Änderungen an der Galerie wurden gespeichert.",
          })
        }}
      />
    </div>
  )
}

