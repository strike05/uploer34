"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SocialMediaButtons } from "@/components/social-media/social-media-buttons"
import {
  Download,
  Link,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize,
  Minimize,
  SlidersHorizontal,
  Play,
  Pause,
  X,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { loadSocialMediaSettings, DEFAULT_SOCIAL_MEDIA_SETTINGS } from "@/lib/social-media-service"
import type { SocialMediaSettings, FileItem } from "@/types"

interface EnhancedImageViewerProps {
  imageUrl: string
  filename: string
  folderId: string
  fileId?: string
  files?: FileItem[]
  currentIndex?: number
  onClose?: () => void
  onNavigate?: (direction: "next" | "prev") => void
}

export function EnhancedImageViewer({
  imageUrl,
  filename,
  folderId,
  fileId,
  files = [],
  currentIndex = 0,
  onClose,
  onNavigate,
}: EnhancedImageViewerProps) {
  // Refs
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // State für Social Media
  const [socialMediaSettings, setSocialMediaSettings] = useState<SocialMediaSettings>(DEFAULT_SOCIAL_MEDIA_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // State für Bildanpassungen
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [filter, setFilter] = useState("none")

  // State für Anzeigemodi
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<"normal" | "slideshow">("normal")
  const [slideshowActive, setSlideshowActive] = useState(false)
  const [slideshowInterval, setSlideshowInterval] = useState(5) // Sekunden
  const [showControls, setShowControls] = useState(true)

  // Lade die Social Media Einstellungen für den Ordner
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        const settings = await loadSocialMediaSettings(folderId)
        setSocialMediaSettings(settings)
      } catch (error) {
        console.error("Fehler beim Laden der Social Media Einstellungen:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (folderId) {
      loadSettings()
    }
  }, [folderId])

  // Effekt für Diashow
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (slideshowActive && viewMode === "slideshow" && files.length > 1) {
      timer = setInterval(() => {
        if (onNavigate) {
          onNavigate("next")
        }
      }, slideshowInterval * 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [slideshowActive, viewMode, slideshowInterval, files.length, onNavigate])

  // Effekt für Vollbildmodus
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Tastatursteuerung
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          if (onNavigate) onNavigate("prev")
          break
        case "ArrowRight":
          if (onNavigate) onNavigate("next")
          break
        case "Escape":
          if (isFullscreen) {
            toggleFullscreen()
          } else if (onClose) {
            onClose()
          }
          break
        case "+":
          setZoom((prev) => Math.min(prev + 10, 300))
          break
        case "-":
          setZoom((prev) => Math.max(prev - 10, 10))
          break
        case "r":
          setRotation((prev) => (prev + 90) % 360)
          break
        case "f":
          toggleFullscreen()
          break
        case "p":
          if (viewMode === "slideshow") {
            setSlideshowActive((prev) => !prev)
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onNavigate, onClose, isFullscreen, viewMode])

  // Funktionen für Bildanpassungen
  const applyImageStyles = () => {
    return {
      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
      filter: `brightness(${brightness}%) contrast(${contrast}%) ${filter !== "none" ? filter : ""}`,
      transition: "transform 0.3s ease, filter 0.3s ease",
    }
  }

  const resetImageAdjustments = () => {
    setZoom(100)
    setRotation(0)
    setBrightness(100)
    setContrast(100)
    setFilter("none")
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const toggleSlideshow = () => {
    if (viewMode !== "slideshow") {
      setViewMode("slideshow")
      setSlideshowActive(true)
    } else {
      setSlideshowActive(!slideshowActive)
    }
  }

  // Download-Funktion
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download gestartet",
      description: `Die Datei "${filename}" wird heruntergeladen.`,
    })
  }

  // Link kopieren
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)

    toast({
      title: "Link kopiert",
      description: "Der Link wurde in die Zwischenablage kopiert.",
    })
  }

  // Erstelle den Titel für Social Media Sharing
  const shareTitle = `Bild: ${filename}`

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center min-h-screen bg-black p-4 ${isFullscreen ? "fullscreen" : ""}`}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Schließen-Button */}
      {onClose && (
        <button
          className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
      )}

      {/* Hauptbild-Container */}
      <div className="relative flex-1 flex items-center justify-center w-full overflow-hidden">
        <img
          ref={imageRef}
          src={imageUrl || "/placeholder.svg"}
          alt={filename}
          className="max-h-[80vh] max-w-full object-contain"
          style={applyImageStyles()}
          crossOrigin="anonymous"
        />

        {/* Navigation Buttons */}
        {files.length > 1 && showControls && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => onNavigate && onNavigate("prev")}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => onNavigate && onNavigate("next")}
              disabled={currentIndex === files.length - 1}
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Steuerelemente */}
      {showControls && (
        <div className="w-full max-w-6xl bg-gray-900 rounded-md mt-4">
          <Tabs defaultValue="info">
            <div className="flex justify-between items-center p-3 border-b border-gray-800">
              <div className="text-white">
                <h2 className="text-lg font-medium">{filename}</h2>
                {files.length > 1 && (
                  <p className="text-sm text-gray-400">
                    Bild {currentIndex + 1} von {files.length}
                  </p>
                )}
              </div>

              <TabsList className="bg-gray-800">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="adjust">Anpassen</TabsTrigger>
                <TabsTrigger value="view">Ansicht</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="info" className="p-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Link className="h-4 w-4 mr-2" />
                  Link kopieren
                </Button>

                {!isLoading && (
                  <SocialMediaButtons
                    url={window.location.href}
                    title={shareTitle}
                    imageUrl={imageUrl}
                    settings={socialMediaSettings}
                  />
                )}

                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <>
                      <Minimize className="h-4 w-4 mr-2" />
                      Vollbild beenden
                    </>
                  ) : (
                    <>
                      <Maximize className="h-4 w-4 mr-2" />
                      Vollbild
                    </>
                  )}
                </Button>

                {files.length > 1 && (
                  <Button variant="outline" size="sm" onClick={toggleSlideshow}>
                    {slideshowActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Diashow pausieren
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Diashow starten
                      </>
                    )}
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="adjust" className="p-3 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white">Zoom: {zoom}%</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setZoom((prev) => Math.max(prev - 10, 10))}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setZoom((prev) => Math.min(prev + 10, 300))}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Slider value={[zoom]} min={10} max={300} step={5} onValueChange={(value) => setZoom(value[0])} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white">Rotation: {rotation}°</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setRotation((prev) => (prev - 90) % 360)}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setRotation((prev) => (prev + 90) % 360)}>
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-white">Helligkeit: {brightness}%</span>
                <Slider
                  value={[brightness]}
                  min={0}
                  max={200}
                  step={5}
                  onValueChange={(value) => setBrightness(value[0])}
                />
              </div>

              <div className="space-y-2">
                <span className="text-white">Kontrast: {contrast}%</span>
                <Slider
                  value={[contrast]}
                  min={0}
                  max={200}
                  step={5}
                  onValueChange={(value) => setContrast(value[0])}
                />
              </div>

              <div className="space-y-2">
                <span className="text-white">Filter</span>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant={filter === "none" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("none")}
                  >
                    Normal
                  </Button>
                  <Button
                    variant={filter === "grayscale(100%)" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("grayscale(100%)")}
                  >
                    Graustufen
                  </Button>
                  <Button
                    variant={filter === "sepia(100%)" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("sepia(100%)")}
                  >
                    Sepia
                  </Button>
                  <Button
                    variant={filter === "invert(100%)" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("invert(100%)")}
                  >
                    Invertiert
                  </Button>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={resetImageAdjustments}>
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Zurücksetzen
              </Button>
            </TabsContent>

            <TabsContent value="view" className="p-3 space-y-4">
              <div className="space-y-2">
                <span className="text-white">Anzeigemodus</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={viewMode === "normal" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setViewMode("normal")
                      setSlideshowActive(false)
                    }}
                  >
                    Normal
                  </Button>
                  <Button
                    variant={viewMode === "slideshow" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setViewMode("slideshow")
                      setSlideshowActive(true)
                    }}
                  >
                    Diashow
                  </Button>
                </div>
              </div>

              {viewMode === "slideshow" && (
                <div className="space-y-2">
                  <span className="text-white">Diashow-Intervall: {slideshowInterval} Sekunden</span>
                  <Slider
                    value={[slideshowInterval]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setSlideshowInterval(value[0])}
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => setSlideshowActive(!slideshowActive)}>
                      {slideshowActive ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pausieren
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Starten
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                      {isFullscreen ? (
                        <>
                          <Minimize className="h-4 w-4 mr-2" />
                          Vollbild beenden
                        </>
                      ) : (
                        <>
                          <Maximize className="h-4 w-4 mr-2" />
                          Vollbild
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

