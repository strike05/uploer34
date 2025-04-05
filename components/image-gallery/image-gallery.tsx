"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Grid2X2, LayoutList, LayoutGrid, SlidersHorizontal, Filter, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FILE_CONFIG } from "@/lib/config"
import type { FileItem } from "@/types"

interface ImageGalleryProps {
  files: FileItem[]
  folderId: string
  onSelectImage?: (file: FileItem) => void
}

export function ImageGallery({ files, folderId, onSelectImage }: ImageGalleryProps) {
  const router = useRouter()
  const [layout, setLayout] = useState<"grid" | "masonry" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Filtere und sortiere die Dateien
  const filteredAndSortedFiles = files
    .filter((file) => {
      // Filtern nach Typ
      if (filterType === "image" && !file.type.startsWith("image/")) return false
      if (filterType === "video" && !file.type.startsWith("video/")) return false

      // Filtern nach Suchbegriff
      if (searchTerm && !file.name.toLowerCase().includes(searchTerm.toLowerCase())) return false

      return true
    })
    .sort((a, b) => {
      // Sortieren
      let comparison = 0

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === "date") {
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
      } else if (sortBy === "size") {
        comparison = a.size - b.size
      }

      // Sortierreihenfolge anwenden
      return sortOrder === "asc" ? comparison : -comparison
    })

  const handleImageClick = (file: FileItem) => {
    if (onSelectImage) {
      onSelectImage(file)
    } else {
      router.push(`/view/${folderId}/${file.name}`)
    }
  }

  // Rendere das Layout
  const renderLayout = () => {
    switch (layout) {
      case "masonry":
        return (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filteredAndSortedFiles.map((file) => (
              <div key={file.id} className="break-inside-avoid mb-4">
                {file.type.startsWith("image/") ? (
                  <div
                    className="relative aspect-auto overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(file)}
                  >
                    <img
                      src={FILE_CONFIG.directFileUrlPattern(file.folderId, file.name) || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-auto object-cover"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm truncate">
                      {file.name}
                    </div>
                  </div>
                ) : file.type.startsWith("video/") ? (
                  <div
                    className="relative aspect-video overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(file)}
                  >
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      poster={`/placeholder.svg?height=200&width=300&text=Video: ${file.name}`}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm truncate">
                      {file.name}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )

      case "list":
        return (
          <div className="space-y-2">
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center p-2 border rounded-md hover:bg-muted/20 cursor-pointer"
                onClick={() => handleImageClick(file)}
              >
                <div className="w-16 h-16 mr-4 flex-shrink-0 overflow-hidden rounded-md">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={FILE_CONFIG.directFileUrlPattern(file.folderId, file.name) || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : file.type.startsWith("video/") ? (
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      poster={`/placeholder.svg?height=64&width=64&text=Video`}
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(file.createdAt).toLocaleDateString()} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )

      // Standard-Grid-Layout
      default:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredAndSortedFiles.map((file) => (
              <div key={file.id}>
                {file.type.startsWith("image/") ? (
                  <div
                    className="relative aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(file)}
                  >
                    <img
                      src={FILE_CONFIG.directFileUrlPattern(file.folderId, file.name) || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm truncate">
                      {file.name}
                    </div>
                  </div>
                ) : file.type.startsWith("video/") ? (
                  <div
                    className="relative aspect-video overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(file)}
                  >
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      poster={`/placeholder.svg?height=200&width=300&text=Video: ${file.name}`}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm truncate">
                      {file.name}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )
    }
  }

  // Hilfsfunktion zum Formatieren der Dateigröße
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB"
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant={layout === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setLayout("grid")}
              title="Rasteransicht"
              className="h-8 w-8"
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === "masonry" ? "default" : "outline"}
              size="icon"
              onClick={() => setLayout("masonry")}
              title="Masonry-Ansicht"
              className="h-8 w-8"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setLayout("list")}
              title="Listenansicht"
              className="h-8 w-8"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="ml-1"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-[200px]"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter-Bereich */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/20 rounded-md">
          <div className="space-y-1">
            <label className="text-sm font-medium">Sortieren nach</label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Datum</SelectItem>
                <SelectItem value="size">Größe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Reihenfolge</label>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Aufsteigend</SelectItem>
                <SelectItem value="desc">Absteigend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Dateityp</label>
            <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="image">Nur Bilder</SelectItem>
                <SelectItem value="video">Nur Videos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Keine Dateien Anzeige */}
      {filteredAndSortedFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Filter className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Keine Dateien gefunden</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm
              ? `Keine Dateien gefunden, die "${searchTerm}" enthalten.`
              : "Keine Dateien entsprechen den ausgewählten Filtern."}
          </p>
          {(searchTerm || filterType !== "all") && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("")
                setFilterType("all")
              }}
            >
              Filter zurücksetzen
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Anzahl der gefundenen Dateien */}
          <p className="text-sm text-muted-foreground">
            {filteredAndSortedFiles.length} {filteredAndSortedFiles.length === 1 ? "Datei" : "Dateien"} gefunden
          </p>

          {/* Dateien anzeigen */}
          {renderLayout()}
        </>
      )}
    </div>
  )
}

