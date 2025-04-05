"use client"

import { Button } from "@/components/ui/button"
import { FileText, Settings, Archive, Image } from "lucide-react"
import type { FolderTabsHeaderProps } from "@/types"

export function FolderTabsHeader({
  selectedFolder,
  onArchive,
  onCreateGallery,
  onOpenSettings,
}: FolderTabsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-medium flex items-center">
        <FileText className="h-4 w-4 mr-2" />
        Dateien
      </h3>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" className="flex items-center" onClick={onArchive}>
          <Archive className="h-4 w-4 mr-1" />
          Archivieren
        </Button>
        <Button variant="outline" size="sm" className="flex items-center" onClick={onCreateGallery}>
          <Image className="h-4 w-4 mr-1" />
          Galerie verwalten
        </Button>
        <Button variant="outline" size="sm" className="flex items-center" onClick={onOpenSettings}>
          <Settings className="h-4 w-4 mr-1" />
          Ordner einstellungen
        </Button>
      </div>
    </div>
  )
}

