"use client"

import { useState } from "react"
import { FileText, Settings, Calendar, Clock, Archive, Copy, Download, Share2, Palette, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/file-upload"
import { FileList } from "@/components/file-list"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Folder } from "@/types"

interface FolderTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
  selectedFolder: Folder | null
  userId: string
  onFileUpload: () => void
  refreshFiles: number
}

// Farboptionen für die Farbkodierung
const colorOptions = [
  { value: "gray", label: "Grau", class: "bg-gray-500" },
  { value: "red", label: "Rot", class: "bg-red-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "yellow", label: "Gelb", class: "bg-yellow-500" },
  { value: "green", label: "Grün", class: "bg-green-500" },
  { value: "blue", label: "Blau", class: "bg-blue-500" },
  { value: "purple", label: "Lila", class: "bg-purple-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
]

export function FolderTabs({
  activeTab,
  onTabChange,
  selectedFolder,
  userId,
  onFileUpload,
  refreshFiles,
}: FolderTabsProps) {
  // Dialog-States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState("general")

  // Formular-States
  const [folderName, setFolderName] = useState("")
  const [folderColor, setFolderColor] = useState("gray")
  const [deletionDate, setDeletionDate] = useState("")
  const [deletionTime, setDeletionTime] = useState("")
  const [shareLink, setShareLink] = useState("")
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  // Initialisiere Formularwerte, wenn der Dialog geöffnet wird
  const handleOpenSettings = () => {
    if (selectedFolder) {
      setFolderName(selectedFolder.name)
      // Hier würden wir normalerweise die gespeicherte Farbe laden
      setFolderColor("gray")
    }
    setIsSettingsOpen(true)
  }

  if (!selectedFolder) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">Bitte wählen Sie einen Ordner aus</p>
      </div>
    )
  }

  // Handler-Funktionen
  const handleSaveSettings = () => {
    // Hier würde die Logik zum Speichern der Einstellungen implementiert werden
    console.log("Speichere Einstellungen:", {
      name: folderName,
      color: folderColor,
      deletionDate,
      deletionTime,
    })

    // Erfolgsmeldung anzeigen
    toast({
      title: "Einstellungen gespeichert",
      description: `Die Einstellungen für den Ordner "${folderName}" wurden gespeichert.`,
    })

    // Dialog schließen
    setIsSettingsOpen(false)
  }

  const handleGenerateShareLink = () => {
    setIsGeneratingLink(true)

    // Simuliere API-Aufruf
    setTimeout(() => {
      const generatedLink = `https://example.com/share/${selectedFolder.id}/${Math.random().toString(36).substring(2, 10)}`
      setShareLink(generatedLink)
      setIsGeneratingLink(false)
    }, 1000)
  }

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast({
      title: "Link kopiert",
      description: "Der Share-Link wurde in die Zwischenablage kopiert.",
    })
  }

  const handleExportFolder = () => {
    setIsExporting(true)

    // Simuliere Export-Prozess
    setTimeout(() => {
      setIsExporting(false)
      toast({
        title: "Export abgeschlossen",
        description: "Der Ordner wurde erfolgreich exportiert und kann heruntergeladen werden.",
      })
    }, 2000)
  }

  const handleDuplicateFolder = () => {
    setIsDuplicating(true)

    // Simuliere Duplizieren-Prozess
    setTimeout(() => {
      setIsDuplicating(false)
      toast({
        title: "Ordner dupliziert",
        description: `Eine Kopie von "${folderName}" wurde erstellt.`,
      })
      setIsSettingsOpen(false)
    }, 1500)
  }

  const handleArchiveFolder = () => {
    // Simuliere Archivieren-Prozess
    toast({
      title: "Ordner archiviert",
      description: `Der Ordner "${selectedFolder.name}" wurde ins Archiv verschoben.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Dateien
        </h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center" onClick={handleArchiveFolder}>
            <Archive className="h-4 w-4 mr-1" />
            Archivieren
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => {
              // Hier könnte später die Logik zum Erstellen einer Galerie implementiert werden
              toast({
                title: "Galerie erstellt",
                description: `Eine Galerie aus dem Ordner "${selectedFolder?.name}" wurde erstellt.`,
              })
            }}
          >
            <Image className="h-4 w-4 mr-1" />
            Als Galerie erstellen
          </Button>
          <Button variant="outline" size="sm" className="flex items-center" onClick={handleOpenSettings}>
            <Settings className="h-4 w-4 mr-1" />
            Ordner einstellungen
          </Button>
        </div>
      </div>

      <FileUpload userId={userId} folderId={selectedFolder.id} onUploadComplete={onFileUpload} />

      <FileList userId={userId} folderId={selectedFolder.id} refreshTrigger={refreshFiles} />

      {/* Dialog für Ordnereinstellungen */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ordnereinstellungen: {selectedFolder.name}</DialogTitle>
          </DialogHeader>

          <Tabs value={settingsTab} onValueChange={setSettingsTab} className="mt-4">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="general">Allgemein</TabsTrigger>
              <TabsTrigger value="deletion">Löschung</TabsTrigger>
              <TabsTrigger value="export">Export & Teilen</TabsTrigger>
              <TabsTrigger value="duplicate">Duplizieren</TabsTrigger>
            </TabsList>

            {/* Allgemeine Einstellungen Tab */}
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="folder-name">Ordnername</Label>
                <Input id="folder-name" value={folderName} onChange={(e) => setFolderName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <Palette className="h-4 w-4 mr-2" />
                  Farbkodierung
                </Label>
                <RadioGroup value={folderColor} onValueChange={setFolderColor} className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <div key={color.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={color.value} id={`color-${color.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`color-${color.value}`}
                        className={`flex items-center justify-between rounded-md border-2 border-muted p-2 hover:border-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full ${color.class}`}></div>
                          <span>{color.label}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </TabsContent>

            {/* Löschung Tab */}
            <TabsContent value="deletion" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deletion-date" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Löschdatum
                </Label>
                <Input
                  id="deletion-date"
                  type="date"
                  value={deletionDate}
                  onChange={(e) => setDeletionDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deletion-time" className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Löschzeit
                </Label>
                <Input
                  id="deletion-time"
                  type="time"
                  value={deletionTime}
                  onChange={(e) => setDeletionTime(e.target.value)}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Der Ordner wird zum angegebenen Zeitpunkt automatisch gelöscht. Diese Aktion kann nicht rückgängig
                gemacht werden.
              </p>
            </TabsContent>

            {/* Export & Teilen Tab */}
            <TabsContent value="export" className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Ordner exportieren
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Exportieren Sie alle Dateien in diesem Ordner als ZIP-Archiv.
                </p>
                <Button onClick={handleExportFolder} disabled={isExporting} className="w-full">
                  {isExporting ? "Exportiere..." : "Als ZIP exportieren"}
                </Button>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label className="flex items-center">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share-Link erstellen
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Erstellen Sie einen Link, mit dem andere Personen auf diesen Ordner zugreifen können, ohne sich
                  anzumelden.
                </p>

                {shareLink ? (
                  <div className="flex space-x-2">
                    <Input value={shareLink} readOnly className="flex-1" />
                    <Button onClick={handleCopyShareLink}>Kopieren</Button>
                  </div>
                ) : (
                  <Button onClick={handleGenerateShareLink} disabled={isGeneratingLink} className="w-full">
                    {isGeneratingLink ? "Generiere Link..." : "Share-Link generieren"}
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* Duplizieren Tab */}
            <TabsContent value="duplicate" className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Copy className="h-4 w-4 mr-2" />
                  Ordner duplizieren
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Erstellen Sie eine Kopie dieses Ordners mit allen enthaltenen Dateien.
                </p>
                <Button onClick={handleDuplicateFolder} disabled={isDuplicating} className="w-full">
                  {isDuplicating ? "Dupliziere..." : "Ordner duplizieren"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveSettings}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

