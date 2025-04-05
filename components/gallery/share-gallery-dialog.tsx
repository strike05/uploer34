"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { CalendarIcon, Copy, Download, RefreshCw, Facebook, Twitter, Linkedin, Mail } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { generateReadableCode } from "@/lib/utils/id-generator"
import { getShareLinkStats } from "@/lib/services/gallery-service"
import type { ShareGalleryDialogProps, ShareLinkStats, ShareLinkAccess } from "@/types"

// Korrigiere die ShareGalleryDialog-Komponente, um sicherzustellen, dass die Links korrekt angezeigt werden
// Füge diese Hilfsfunktion hinzu, um sicherzustellen, dass der Share-Link das richtige Format hat
const ensureCorrectShareLink = (link: string, shareId: string): string => {
  // Wenn der Link bereits mit /s/ beginnt, ist er korrekt
  if (link.includes("/s/")) {
    // Entferne /view/ aus der URL, falls vorhanden
    return link.replace("/view/s/", "/s/")
  }

  // Wenn der Link mit /gallery/ beginnt, ersetze es durch /s/
  if (link.includes("/gallery/")) {
    return link.replace("/gallery/", "/s/")
  }

  // Wenn der Link weder /s/ noch /gallery/ enthält, füge /s/ hinzu
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  const shareUrl = baseUrl ? `${baseUrl}/s/${shareId}` : `/s/${shareId}`

  // Logge den korrigierten Link für Debugging-Zwecke
  console.log("Korrigierter Share-Link:", shareUrl)

  return shareUrl
}

export function ShareGalleryDialog({
  isOpen,
  onOpenChange,
  selectedGallery,
  galleries,
  onCopyLink,
  onRegenerateLink,
  onToggleShareLink,
}: ShareGalleryDialogProps) {
  const [activeTab, setActiveTab] = useState("link")
  const [shareStats, setShareStats] = useState<ShareLinkStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [shareAccess, setShareAccess] = useState<ShareLinkAccess>("public")
  const [usePassword, setUsePassword] = useState(false)
  const [password, setPassword] = useState("")
  const [showGeneratePassword, setShowGeneratePassword] = useState(false)

  const gallery = selectedGallery ? galleries.find((g) => g.id === selectedGallery) : null

  // Lade Share-Link-Statistiken, wenn der Dialog geöffnet wird
  useEffect(() => {
    const loadStats = async () => {
      if (!gallery?.shareId) return

      setIsLoadingStats(true)
      try {
        const stats = await getShareLinkStats(gallery.shareId)
        setShareStats(stats)
      } catch (error) {
        console.error("Fehler beim Laden der Share-Link-Statistiken:", error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    if (isOpen && gallery) {
      loadStats()

      // Setze die Formularwerte basierend auf der Galerie
      setShareAccess(gallery.shareAccess || "public")
      setUsePassword(!!gallery.sharePassword)
      setPassword(gallery.sharePassword || "")
      setExpiryDate(gallery.shareExpiresAt || undefined)
    } else {
      // Zurücksetzen, wenn der Dialog geschlossen wird
      setActiveTab("link")
      setShareStats(null)
      setExpiryDate(undefined)
      setShareAccess("public")
      setUsePassword(false)
      setPassword("")
      setShowDatePicker(false)
      setShowGeneratePassword(false)
    }
  }, [isOpen, gallery])

  // Generiere ein zufälliges Passwort
  const handleGeneratePassword = () => {
    const newPassword = generateReadableCode(6)
    setPassword(newPassword)
  }

  // Regeneriere den Share-Link
  const handleRegenerateLink = async () => {
    if (!gallery) return

    setIsRegenerating(true)
    try {
      await onRegenerateLink(gallery.id, {
        expiresAt: expiryDate,
        password: usePassword ? password : null,
        access: shareAccess,
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  // Teilen über soziale Medien
  const handleShare = (platform: string) => {
    if (!gallery) return

    const shareUrl = gallery.shareLink
    const shareTitle = `Schau dir meine Galerie "${gallery.name}" an!`
    const shareText = `Ich habe eine Galerie mit dir geteilt: ${gallery.name}`

    let url = ""
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`
        break
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`
        break
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case "email":
        url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`
        break
    }

    if (url) {
      window.open(url, "_blank")
    }
  }

  // QR-Code herunterladen
  const handleDownloadQRCode = () => {
    if (!gallery) return

    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
    if (!canvas) return

    const url = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = url
    link.download = `qr-code-${gallery.name.replace(/\s+/g, "-").toLowerCase()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Formatiere das Datum
  const formatDate = (date: Date | null) => {
    if (!date) return "Nie"
    return format(date, "dd.MM.yyyy HH:mm", { locale: de })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Galerie teilen</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="qrcode">QR-Code</TabsTrigger>
            <TabsTrigger value="stats">Statistiken</TabsTrigger>
          </TabsList>

          {/* Link-Tab */}
          <TabsContent value="link" className="space-y-4">
            {gallery && (
              <>
                <div className="flex items-center justify-between">
                  <Label>Link-Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={gallery.shareEnabled}
                      onCheckedChange={(checked) => onToggleShareLink(gallery.id, checked)}
                    />
                    <span>{gallery.shareEnabled ? "Aktiv" : "Deaktiviert"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Share-Link</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={gallery ? ensureCorrectShareLink(gallery.shareLink, gallery.shareId) : ""}
                      readOnly
                      className={gallery?.shareEnabled ? "" : "opacity-50"}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        onCopyLink(gallery ? ensureCorrectShareLink(gallery.shareLink, gallery.shareId) : "")
                      }
                      disabled={!gallery?.shareEnabled}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Link-Einstellungen</h3>

                  <div className="space-y-2">
                    <Label>Zugriff</Label>
                    <RadioGroup value={shareAccess} onValueChange={(value) => setShareAccess(value as ShareLinkAccess)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="access-public" />
                        <Label htmlFor="access-public">Öffentlich (Jeder mit dem Link)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="restricted" id="access-restricted" />
                        <Label htmlFor="access-restricted">Eingeschränkt (Nur angemeldete Benutzer)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="access-private" />
                        <Label htmlFor="access-private">Privat (Nur bestimmte Benutzer)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-protection">Passwortschutz</Label>
                      <Switch id="password-protection" checked={usePassword} onCheckedChange={setUsePassword} />
                    </div>

                    {usePassword && (
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Passwort eingeben"
                        />
                        <Button variant="outline" onClick={handleGeneratePassword} type="button">
                          Generieren
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Ablaufdatum</Label>
                    <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expiryDate ? format(expiryDate, "PPP", { locale: de }) : "Kein Ablaufdatum"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expiryDate}
                          onSelect={(date) => {
                            setExpiryDate(date)
                            setShowDatePicker(false)
                          }}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                        <div className="p-3 border-t border-border">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setExpiryDate(undefined)
                              setShowDatePicker(false)
                            }}
                            size="sm"
                          >
                            Kein Ablaufdatum
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button onClick={handleRegenerateLink} className="w-full" disabled={isRegenerating}>
                    {isRegenerating ? (
                      <>Generiere neuen Link...</>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Neuen Link generieren
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label>Teilen über</Label>
                  <div className="flex space-x-2 justify-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("facebook")}
                      disabled={!gallery.shareEnabled}
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("twitter")}
                      disabled={!gallery.shareEnabled}
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("linkedin")}
                      disabled={!gallery.shareEnabled}
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("email")}
                      disabled={!gallery.shareEnabled}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* QR-Code-Tab */}
          <TabsContent value="qrcode" className="space-y-4">
            {gallery && (
              <>
                <div className="flex justify-center p-4 bg-white rounded-md">
                  <div id="qr-code-canvas" className="w-64 h-64">
                    <QRCodeSVG
                      value={gallery ? ensureCorrectShareLink(gallery.shareLink, gallery.shareId) : ""}
                      size={256}
                      level="H"
                      includeMargin={true}
                      imageSettings={{
                        src: "/logo.png",
                        x: undefined,
                        y: undefined,
                        height: 24,
                        width: 24,
                        excavate: true,
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button variant="outline" onClick={handleDownloadQRCode} disabled={!gallery.shareEnabled}>
                    <Download className="mr-2 h-4 w-4" />
                    QR-Code herunterladen
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Statistiken-Tab */}
          <TabsContent value="stats" className="space-y-4">
            {isLoadingStats ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Lade Statistiken...</p>
              </div>
            ) : shareStats ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Gesamtaufrufe</h3>
                    <p className="text-2xl font-bold">{shareStats.totalClicks}</p>
                  </div>
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Einzigartige Besucher</h3>
                    <p className="text-2xl font-bold">{shareStats.uniqueVisitors}</p>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Letzte Aktivität</h3>
                  <p className="text-sm">
                    Erstellt am: <span className="font-medium">{formatDate(shareStats.createdAt)}</span>
                  </p>
                  <p className="text-sm">
                    Zuletzt aufgerufen: <span className="font-medium">{formatDate(shareStats.lastAccessed)}</span>
                  </p>
                </div>

                {Object.keys(shareStats.referrers).length > 0 && (
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Referrer</h3>
                    <ul className="space-y-1">
                      {Object.entries(shareStats.referrers).map(([referrer, count]) => (
                        <li key={referrer} className="text-sm flex justify-between">
                          <span>{referrer}</span>
                          <span className="font-medium">{count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Keine Statistiken verfügbar</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

