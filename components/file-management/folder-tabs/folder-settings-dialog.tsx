"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Palette,
  Calendar,
  Clock,
  Download,
  Copy,
  Share2,
  Instagram,
  Facebook,
  Twitter,
  ExternalLink,
  Link,
} from "lucide-react"
import type { FolderSettingsDialogProps } from "@/types"
import { DEFAULT_SOCIAL_MEDIA_SETTINGS } from "@/lib/social-media-service"

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

// Aktualisiere die Komponente, um mit fehlenden Props umzugehen
export function FolderSettingsDialog({
  isOpen,
  onOpenChange,
  selectedFolder,
  folderName,
  folderColor,
  onSave,
  settingsTab,
  setSettingsTab,
  deletionDate,
  setDeletionDate,
  deletionTime,
  setDeletionTime,
  shareLink,
  isGeneratingLink,
  handleGenerateShareLink,
  handleCopyShareLink,
  isExporting,
  handleExportFolder,
  isDuplicating,
  handleDuplicateFolder,
  setFolderName,
  setFolderColor,
  // Social Media Sharing
  instagramEnabled,
  setInstagramEnabled,
  facebookEnabled,
  setFacebookEnabled,
  twitterEnabled,
  setTwitterEnabled,
  whatsappEnabled,
  setWhatsappEnabled,
  customButtonEnabled,
  setCustomButtonEnabled,
  customButtonLabel,
  setCustomButtonLabel,
  customButtonUrl,
  setCustomButtonUrl,
  socialMediaSettings,
  setSocialMediaSettings,
}: FolderSettingsDialogProps) {
  // Standardwerte für socialMediaSettings, falls nicht definiert
  const settings = socialMediaSettings || DEFAULT_SOCIAL_MEDIA_SETTINGS
  const updateSettings = setSocialMediaSettings || (() => {})

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ordnereinstellungen: {selectedFolder.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={settingsTab} onValueChange={setSettingsTab} className="mt-4">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="deletion">Löschung</TabsTrigger>
            <TabsTrigger value="export">Export & Teilen</TabsTrigger>
            <TabsTrigger value="duplicate">Duplizieren</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>

          {/* Allgemeine Einstellungen Tab */}
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name" className="flex items-center">
                Ordnername
              </Label>
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
              Der Ordner wird zum angegebenen Zeitpunkt automatisch gelöscht. Diese Aktion kann nicht rückgängig gemacht
              werden.
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

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Media Sharing</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Aktivieren Sie die Social-Media-Plattformen, auf denen Ihre Inhalte geteilt werden können.
              </p>

              {/* Instagram */}
              <div className="flex items-center justify-between border-b pb-2">
                <div className="space-y-0.5">
                  <Label htmlFor="instagram" className="flex items-center">
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Label>
                  <p className="text-sm text-muted-foreground">Ermöglicht das Teilen auf Instagram</p>
                </div>
                <Switch id="instagram" checked={instagramEnabled} onCheckedChange={setInstagramEnabled} />
              </div>

              {/* Facebook */}
              <div className="flex items-center justify-between border-b pb-2">
                <div className="space-y-0.5">
                  <Label htmlFor="facebook" className="flex items-center">
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Label>
                  <p className="text-sm text-muted-foreground">Ermöglicht das Teilen auf Facebook</p>
                </div>
                <Switch id="facebook" checked={facebookEnabled} onCheckedChange={setFacebookEnabled} />
              </div>

              {/* Twitter/X */}
              <div className="flex items-center justify-between border-b pb-2">
                <div className="space-y-0.5">
                  <Label htmlFor="twitter" className="flex items-center">
                    <Twitter className="h-4 w-4 mr-2" />X (Twitter)
                  </Label>
                  <p className="text-sm text-muted-foreground">Ermöglicht das Teilen auf X (Twitter)</p>
                </div>
                <Switch id="twitter" checked={twitterEnabled} onCheckedChange={setTwitterEnabled} />
              </div>

              {/* WhatsApp */}
              <div className="flex items-center justify-between border-b pb-2">
                <div className="space-y-0.5">
                  <Label htmlFor="whatsapp" className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.6 6.32A8.86 8.86 0 0 0 12.05 4a8.94 8.94 0 0 0-7.64 13.5L4 22l4.59-.39a8.9 8.9 0 0 0 3.46.68 8.93 8.93 0 0 0 8.94-8.94 8.91 8.91 0 0 0-3.39-7.03zm-5.55 13.72a7.4 7.4 0 0 1-3.79-.97l-.27-.16-2.82.74.75-2.75-.18-.28a7.43 7.43 0 0 1-1.14-3.99 7.44 7.44 0 0 1 7.44-7.44c1.97 0 3.83.77 5.23 2.17a7.4 7.4 0 0 1 2.17 5.25 7.44 7.44 0 0 1-7.39 7.43zm4.08-5.56c-.22-.11-1.32-.65-1.53-.73s-.35-.11-.5.11c-.15.22-.58.73-.71.88s-.26.17-.48.06a6.09 6.09 0 0 1-3.12-2.73c-.23-.4.23-.37.67-1.25.07-.15.04-.29-.02-.4-.06-.11-.5-1.2-.69-1.65-.18-.43-.37-.37-.5-.38h-.43a.84.84 0 0 0-.61.28c-.21.23-.8.78-.8 1.9s.82 2.2.93 2.35c.12.15 1.67 2.55 4.05 3.58.57.24 1.01.39 1.36.5.57.18 1.09.15 1.5.09.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.44-.27z" />
                    </svg>
                    WhatsApp
                  </Label>
                  <p className="text-sm text-muted-foreground">Ermöglicht das Teilen über WhatsApp</p>
                </div>
                <Switch id="whatsapp" checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
              </div>

              {/* Download Button */}
              <div className="flex items-center justify-between border-b pb-2">
                <div className="space-y-0.5">
                  <Label htmlFor="download-button" className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download Button
                  </Label>
                  <p className="text-sm text-muted-foreground">Zeigt den Download-Button an</p>
                </div>
                <Switch
                  id="download-button"
                  checked={settings.showDownloadButton !== false}
                  onCheckedChange={(checked) => {
                    const updatedSettings = { ...settings, showDownloadButton: checked }
                    updateSettings(updatedSettings)
                  }}
                />
              </div>

              {/* Link kopieren Button */}
              <div className="flex items-center justify-between border-b pb-2">
                <div className="space-y-0.5">
                  <Label htmlFor="copy-link-button" className="flex items-center">
                    <Link className="h-4 w-4 mr-2" />
                    Link kopieren Button
                  </Label>
                  <p className="text-sm text-muted-foreground">Zeigt den Button zum Kopieren des Links an</p>
                </div>
                <Switch
                  id="copy-link-button"
                  checked={settings.showCopyLinkButton === true}
                  onCheckedChange={(checked) => {
                    const updatedSettings = { ...settings, showCopyLinkButton: checked }
                    updateSettings(updatedSettings)
                  }}
                />
              </div>

              {/* Benutzerdefinierter Button */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="custom-button" className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Benutzerdefinierter Button
                    </Label>
                    <p className="text-sm text-muted-foreground">Erstellen Sie einen eigenen Sharing-Button</p>
                  </div>
                  <Switch id="custom-button" checked={customButtonEnabled} onCheckedChange={setCustomButtonEnabled} />
                </div>

                {customButtonEnabled && (
                  <div className="space-y-4 mt-4 pl-4 border-l-2">
                    <div className="space-y-2">
                      <Label htmlFor="custom-button-label">Button-Beschriftung</Label>
                      <Input
                        id="custom-button-label"
                        value={customButtonLabel}
                        onChange={(e) => setCustomButtonLabel(e.target.value)}
                        placeholder="z.B. Meine Website"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-button-url">Button-URL</Label>
                      <Input
                        id="custom-button-url"
                        value={customButtonUrl}
                        onChange={(e) => setCustomButtonUrl(e.target.value)}
                        placeholder="https://example.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Sie können Platzhalter verwenden: {"{url}"} für den Link, {"{title}"} für den Titel
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Leisten-Position */}
              <div className="pt-4 border-t">
                <Label className="mb-2 block">Position der Steuerleiste</Label>
                <RadioGroup
                  value={settings.controlBarPosition || "attached"}
                  onValueChange={(value) => {
                    const updatedSettings = { ...settings, controlBarPosition: value as "attached" | "floating" }
                    updateSettings(updatedSettings)
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="attached" id="position-attached" />
                    <Label htmlFor="position-attached">Am Bild anliegend</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="floating" id="position-floating" />
                    <Label htmlFor="position-floating">Mit Abstand zum Bild</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={onSave}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

