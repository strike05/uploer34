"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"
import { Check, Info } from "lucide-react"
import type { EditGalleryDialogProps, Gallery, GalleryLayout, GalleryFont } from "@/types"

// Vordefinierte Farbpaletten
const COLOR_PALETTES = {
  modern: {
    primary: "#0f172a",
    secondary: "#3b82f6",
    background: "#ffffff",
    text: "#1e293b",
  },
  minimal: {
    primary: "#000000",
    secondary: "#6b7280",
    background: "#f9fafb",
    text: "#111827",
  },
  vibrant: {
    primary: "#4f46e5",
    secondary: "#ec4899",
    background: "#ffffff",
    text: "#18181b",
  },
  elegant: {
    primary: "#1e293b",
    secondary: "#94a3b8",
    background: "#f8fafc",
    text: "#334155",
  },
  dark: {
    primary: "#18181b",
    secondary: "#6366f1",
    background: "#27272a",
    text: "#e4e4e7",
  },
}

// Schriftarten-Optionen mit Vorschau
const FONT_PREVIEWS = {
  default: "System Default",
  serif: "Serif Font",
  "sans-serif": "Sans-Serif Font",
  monospace: "Monospace Font",
  handwriting: "Handwriting Style",
}

export function EditGalleryDialog({
  isOpen,
  onOpenChange,
  selectedGallery,
  galleries,
  onSave,
}: EditGalleryDialogProps) {
  // States für die Bearbeitung
  const [activeTab, setActiveTab] = useState("general")
  const [galleryName, setGalleryName] = useState("")
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [password, setPassword] = useState("")
  const [layout, setLayout] = useState<GalleryLayout>("grid")
  const [font, setFont] = useState<GalleryFont>("default")
  const [primaryColor, setPrimaryColor] = useState("#000000")
  const [secondaryColor, setSecondaryColor] = useState("#4f46e5")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [textColor, setTextColor] = useState("#000000")
  const [darkMode, setDarkMode] = useState(false)
  const [allowDownload, setAllowDownload] = useState(true)
  const [allowComments, setAllowComments] = useState(false)
  const [watermarkEnabled, setWatermarkEnabled] = useState(false)
  const [watermarkText, setWatermarkText] = useState("")
  const [watermarkPosition, setWatermarkPosition] = useState("bottomRight")
  const [headerImageUrl, setHeaderImageUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [watermarkOpacity, setWatermarkOpacity] = useState(50)
  const [selectedPalette, setSelectedPalette] = useState("")
  const [cornerRadius, setCornerRadius] = useState(8)
  const [fontSize, setFontSize] = useState(16)
  const [showTooltips, setShowTooltips] = useState(true)
  const [enableTransitions, setEnableTransitions] = useState(true)
  const [headerHeight, setHeaderHeight] = useState(200)

  // Lade die Galerie-Daten, wenn sich die ausgewählte Galerie ändert
  useEffect(() => {
    if (selectedGallery && galleries) {
      const gallery = galleries.find((g) => g.id === selectedGallery)
      if (gallery) {
        setGalleryName(gallery.name)
        setIsPasswordProtected(!!gallery.password)
        setPassword(gallery.password || "")
        setLayout(gallery.layout || "grid")
        setFont(gallery.font || "default")

        if (gallery.colorScheme) {
          setPrimaryColor(gallery.colorScheme.primary || "#000000")
          setSecondaryColor(gallery.colorScheme.secondary || "#4f46e5")
          setBackgroundColor(gallery.colorScheme.background || "#ffffff")
          setTextColor(gallery.colorScheme.text || "#000000")
        }

        setDarkMode(gallery.darkMode || false)
        setAllowDownload(gallery.allowDownload !== undefined ? gallery.allowDownload : true)
        setAllowComments(gallery.allowComments || false)
        setWatermarkEnabled(gallery.watermarkEnabled || false)
        setWatermarkText(gallery.watermarkText || "")
        setWatermarkPosition(gallery.watermarkPosition || "bottomRight")
        setHeaderImageUrl(gallery.headerImage || "")

        // Neue Eigenschaften
        setWatermarkOpacity(gallery.watermarkOpacity || 50)
        setCornerRadius(gallery.cornerRadius || 8)
        setFontSize(gallery.fontSize || 16)
        setShowTooltips(gallery.showTooltips !== undefined ? gallery.showTooltips : true)
        setEnableTransitions(gallery.enableTransitions !== undefined ? gallery.enableTransitions : true)
        setHeaderHeight(gallery.headerHeight || 200)

        // Palette zurücksetzen, da wir die bestehenden Farben verwenden
        setSelectedPalette("")
      }
    }
  }, [selectedGallery, galleries])

  // Funktion zum Anwenden einer Farbpalette
  const applyColorPalette = (palette: string) => {
    setSelectedPalette(palette)
    if (COLOR_PALETTES[palette as keyof typeof COLOR_PALETTES]) {
      const colors = COLOR_PALETTES[palette as keyof typeof COLOR_PALETTES]
      setPrimaryColor(colors.primary)
      setSecondaryColor(colors.secondary)
      setBackgroundColor(colors.background)
      setTextColor(colors.text)

      // Wenn Dark-Palette ausgewählt wird, Dark Mode aktivieren
      if (palette === "dark") {
        setDarkMode(true)
      }
    }
  }

  // Funktion zum Speichern der Änderungen
  const handleSave = () => {
    if (!selectedGallery) return

    const updatedGallery: Partial<Gallery> = {
      name: galleryName,
      password: isPasswordProtected ? password : null,
      layout,
      font,
      colorScheme: {
        primary: primaryColor,
        secondary: secondaryColor,
        background: backgroundColor,
        text: textColor,
      },
      darkMode,
      allowDownload,
      allowComments,
      watermarkEnabled,
      watermarkText: watermarkEnabled ? watermarkText : "",
      watermarkPosition: watermarkEnabled ? watermarkPosition : "bottomRight",
      headerImage: headerImageUrl,
      // Neue Eigenschaften
      watermarkOpacity: watermarkEnabled ? watermarkOpacity : 50,
      cornerRadius,
      fontSize,
      showTooltips,
      enableTransitions,
      headerHeight,
    }

    onSave(selectedGallery, updatedGallery)
  }

  // Funktion zum Hochladen eines Header-Bildes
  const handleHeaderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Hier würde normalerweise der Upload-Code stehen
    // Für dieses Beispiel simulieren wir einen erfolgreichen Upload
    setTimeout(() => {
      setHeaderImageUrl(`https://example.com/uploads/${file.name}`)
      setIsUploading(false)
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Galerie bearbeiten</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="appearance">Erscheinungsbild</TabsTrigger>
            <TabsTrigger value="security">Sicherheit</TabsTrigger>
            <TabsTrigger value="advanced">Erweitert</TabsTrigger>
          </TabsList>

          {/* Allgemeine Einstellungen */}
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gallery-name">Galerie Name</Label>
              <Input id="gallery-name" value={galleryName} onChange={(e) => setGalleryName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="header-image">Header-Bild</Label>
              <div className="flex flex-col gap-2">
                {headerImageUrl && (
                  <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                    <img
                      src={headerImageUrl || "/placeholder.svg"}
                      alt="Header"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <Input
                  id="header-image"
                  type="file"
                  accept="image/*"
                  onChange={handleHeaderImageUpload}
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">Empfohlene Größe: 1200 x 400 Pixel</p>
              </div>
            </div>

            {/* Header-Höhe */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="header-height">Header-Höhe</Label>
                <span className="text-xs text-muted-foreground">{headerHeight}px</span>
              </div>
              <Slider
                id="header-height"
                min={100}
                max={400}
                step={10}
                value={[headerHeight]}
                onValueChange={(value) => setHeaderHeight(value[0])}
              />
            </div>
          </TabsContent>

          {/* Erscheinungsbild-Einstellungen */}
          <TabsContent value="appearance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Farbpaletten */}
                <div className="space-y-2">
                  <Label>Farbpalette</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.keys(COLOR_PALETTES).map((palette) => (
                      <button
                        key={palette}
                        type="button"
                        className={`p-2 rounded-md border-2 flex flex-col items-center ${
                          selectedPalette === palette ? "border-primary" : "border-gray-200"
                        }`}
                        onClick={() => applyColorPalette(palette)}
                      >
                        <div className="flex space-x-1 mb-1">
                          {["primary", "secondary", "background", "text"].map((colorType) => (
                            <div
                              key={colorType}
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  COLOR_PALETTES[palette as keyof typeof COLOR_PALETTES][
                                    colorType as keyof typeof COLOR_PALETTES.modern
                                  ],
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs capitalize">{palette}</span>
                        {selectedPalette === palette && (
                          <Check className="w-3 h-3 absolute top-1 right-1 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="layout">Layout</Label>
                  <Select value={layout} onValueChange={(value) => setLayout(value as GalleryLayout)}>
                    <SelectTrigger id="layout">
                      <SelectValue placeholder="Wählen Sie ein Layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Raster</SelectItem>
                      <SelectItem value="masonry">Masonry (Pinterest-Stil)</SelectItem>
                      <SelectItem value="carousel">Karussell</SelectItem>
                      <SelectItem value="slideshow">Diashow</SelectItem>
                      <SelectItem value="mosaic">Mosaik (Neu)</SelectItem>
                      <SelectItem value="fullscreen">Vollbild (Neu)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font">Schriftart</Label>
                  <Select value={font} onValueChange={(value) => setFont(value as GalleryFont)}>
                    <SelectTrigger id="font">
                      <SelectValue placeholder="Wählen Sie eine Schriftart" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FONT_PREVIEWS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <span className={value === "default" ? "font-sans" : `font-${value}`}>{label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Schriftgröße */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="font-size">Schriftgröße</Label>
                    <span className="text-xs text-muted-foreground">{fontSize}px</span>
                  </div>
                  <Slider
                    id="font-size"
                    min={12}
                    max={24}
                    step={1}
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                  />
                </div>

                {/* Eckenradius */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="corner-radius">Eckenradius</Label>
                    <span className="text-xs text-muted-foreground">{cornerRadius}px</span>
                  </div>
                  <Slider
                    id="corner-radius"
                    min={0}
                    max={20}
                    step={1}
                    value={[cornerRadius]}
                    onValueChange={(value) => setCornerRadius(value[0])}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primärfarbe</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-8 p-0 border-0"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Sekundärfarbe</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-12 h-8 p-0 border-0"
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="background-color">Hintergrundfarbe</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="background-color"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-8 p-0 border-0"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-color">Textfarbe</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="text-color"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-8 p-0 border-0"
                      />
                      <Input value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
                  <Label htmlFor="dark-mode">Dunkelmodus aktivieren</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enable-transitions" checked={enableTransitions} onCheckedChange={setEnableTransitions} />
                  <Label htmlFor="enable-transitions">Animierte Übergänge</Label>
                </div>
              </div>

              {/* Vorschau */}
              <div className="border rounded-lg overflow-hidden">
                <div className="text-center text-sm font-medium p-2 bg-muted">Vorschau</div>
                <div
                  className={`p-4 ${
                    font === "default"
                      ? "font-sans"
                      : font === "serif"
                        ? "font-serif"
                        : font === "sans-serif"
                          ? "font-sans"
                          : font === "monospace"
                            ? "font-mono"
                            : "font-sans"
                  }`}
                  style={{
                    backgroundColor: darkMode ? "#121212" : backgroundColor,
                    color: darkMode ? "#ffffff" : textColor,
                    fontSize: `${fontSize}px`,
                    transition: enableTransitions ? "all 0.3s ease" : "none",
                  }}
                >
                  <div
                    className="mb-4 p-3 rounded-md"
                    style={{
                      backgroundColor: darkMode ? "#1e1e1e" : primaryColor,
                      color: "#ffffff",
                      borderRadius: `${cornerRadius}px`,
                      height: `${headerHeight / 4}px`,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <h3 className="font-bold">Galerie: {galleryName || "Meine Galerie"}</h3>
                    <p className="text-sm opacity-80">Beispiel-Header</p>
                  </div>

                  <div
                    className={`grid ${layout === "list" ? "" : "grid-cols-2"} gap-2 mb-4`}
                    style={{ transition: enableTransitions ? "all 0.3s ease" : "none" }}
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`${
                          layout === "masonry" && i % 2 === 0 ? "row-span-2" : ""
                        } bg-gray-200 rounded-md overflow-hidden relative`}
                        style={{
                          aspectRatio: layout === "list" ? "auto" : i % 2 === 0 ? "1/1" : "16/9",
                          borderRadius: `${cornerRadius}px`,
                          transition: enableTransitions ? "all 0.3s ease" : "none",
                        }}
                      >
                        <div
                          className={`h-full w-full flex items-center justify-center ${
                            layout === "list" ? "flex-row" : "flex-col"
                          }`}
                        >
                          {layout === "list" ? (
                            <>
                              <div className="w-16 h-16 bg-gray-300 mr-2 flex-shrink-0"></div>
                              <div>
                                <p className="font-medium">Bild {i + 1}</p>
                                <p className="text-xs opacity-70">Beispiel</p>
                              </div>
                            </>
                          ) : (
                            <div className="text-center text-gray-500 text-sm">Bild {i + 1}</div>
                          )}
                        </div>

                        {/* Wasserzeichen-Vorschau */}
                        {watermarkEnabled && watermarkText && (
                          <div
                            className={`absolute p-2 text-white bg-black ${
                              watermarkPosition === "center"
                                ? "inset-0 flex items-center justify-center"
                                : watermarkPosition === "bottomRight"
                                  ? "bottom-2 right-2"
                                  : watermarkPosition === "bottomLeft"
                                    ? "bottom-2 left-2"
                                    : watermarkPosition === "topRight"
                                      ? "top-2 right-2"
                                      : "top-2 left-2"
                            }`}
                            style={{
                              opacity: watermarkOpacity / 100,
                              fontSize: `${fontSize * 0.8}px`,
                            }}
                          >
                            {watermarkText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div
                    className="text-center p-2 text-xs rounded-md"
                    style={{
                      backgroundColor: darkMode ? "#1e1e1e" : primaryColor,
                      color: "#ffffff",
                      borderRadius: `${cornerRadius}px`,
                    }}
                  >
                    Footer
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Sicherheitseinstellungen */}
          <TabsContent value="security" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="password-protection" checked={isPasswordProtected} onCheckedChange={setIsPasswordProtected} />
              <Label htmlFor="password-protection">Mit Passwort schützen</Label>
            </div>

            {isPasswordProtected && (
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Geben Sie ein sicheres Passwort ein"
                />
                <div className="text-xs text-muted-foreground flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Passwörter werden sicher gespeichert und nicht im Klartext angezeigt
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch id="allow-download" checked={allowDownload} onCheckedChange={setAllowDownload} />
              <Label htmlFor="allow-download">Downloads erlauben</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="show-tooltips" checked={showTooltips} onCheckedChange={setShowTooltips} />
              <Label htmlFor="show-tooltips">Tooltips anzeigen</Label>
              <div className="ml-2 text-xs text-muted-foreground">(Hilfetexte bei Hover über Elemente)</div>
            </div>
          </TabsContent>

          {/* Erweiterte Einstellungen */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="allow-comments" checked={allowComments} onCheckedChange={setAllowComments} />
              <Label htmlFor="allow-comments">Kommentare erlauben</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="watermark-enabled" checked={watermarkEnabled} onCheckedChange={setWatermarkEnabled} />
              <Label htmlFor="watermark-enabled">Wasserzeichen aktivieren</Label>
            </div>

            {watermarkEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="watermark-text">Wasserzeichen-Text</Label>
                  <Input
                    id="watermark-text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="z.B. © Ihr Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="watermark-position">Wasserzeichen-Position</Label>
                  <Select value={watermarkPosition} onValueChange={setWatermarkPosition}>
                    <SelectTrigger id="watermark-position">
                      <SelectValue placeholder="Wählen Sie eine Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Mitte</SelectItem>
                      <SelectItem value="bottomRight">Unten rechts</SelectItem>
                      <SelectItem value="bottomLeft">Unten links</SelectItem>
                      <SelectItem value="topRight">Oben rechts</SelectItem>
                      <SelectItem value="topLeft">Oben links</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="watermark-opacity">Wasserzeichen-Transparenz</Label>
                    <span className="text-xs text-muted-foreground">{watermarkOpacity}%</span>
                  </div>
                  <Slider
                    id="watermark-opacity"
                    min={10}
                    max={100}
                    step={5}
                    value={[watermarkOpacity]}
                    onValueChange={(value) => setWatermarkOpacity(value[0])}
                  />
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

