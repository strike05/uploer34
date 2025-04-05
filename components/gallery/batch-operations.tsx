"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Trash2, Download, Eye, EyeOff, ChevronDown } from "lucide-react"
import type { Gallery } from "@/types"

interface BatchOperationsProps {
  galleries: Gallery[]
  onDeleteMultiple: (ids: string[]) => Promise<boolean | void>
  onEnableMultiple: (ids: string[]) => Promise<boolean | void>
  onDisableMultiple: (ids: string[]) => Promise<boolean | void>
  onExportData: (galleries: Gallery[]) => Promise<boolean | void>
}

export function BatchOperations({
  galleries,
  onDeleteMultiple,
  onEnableMultiple,
  onDisableMultiple,
  onExportData,
}: BatchOperationsProps) {
  const [selectedGalleries, setSelectedGalleries] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const toggleSelectAll = () => {
    if (selectedGalleries.length === galleries.length) {
      setSelectedGalleries([])
    } else {
      setSelectedGalleries(galleries.map((g) => g.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedGalleries.includes(id)) {
      setSelectedGalleries(selectedGalleries.filter((gId) => gId !== id))
    } else {
      setSelectedGalleries([...selectedGalleries, id])
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedGalleries.length === 0) return

    if (!confirm(`Sind Sie sicher, dass Sie ${selectedGalleries.length} Galerien löschen möchten?`)) {
      return
    }

    setIsProcessing(true)
    try {
      await onDeleteMultiple(selectedGalleries)
      toast({
        title: "Galerien gelöscht",
        description: `${selectedGalleries.length} Galerien wurden erfolgreich gelöscht.`,
      })
      setSelectedGalleries([])
    } catch (error) {
      console.error("Fehler beim Löschen der Galerien:", error)
      toast({
        title: "Fehler",
        description: "Beim Löschen der Galerien ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEnableSelected = async () => {
    if (selectedGalleries.length === 0) return

    setIsProcessing(true)
    try {
      await onEnableMultiple(selectedGalleries)
      toast({
        title: "Share-Links aktiviert",
        description: `Share-Links für ${selectedGalleries.length} Galerien wurden aktiviert.`,
      })
    } catch (error) {
      console.error("Fehler beim Aktivieren der Share-Links:", error)
      toast({
        title: "Fehler",
        description: "Beim Aktivieren der Share-Links ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDisableSelected = async () => {
    if (selectedGalleries.length === 0) return

    setIsProcessing(true)
    try {
      await onDisableMultiple(selectedGalleries)
      toast({
        title: "Share-Links deaktiviert",
        description: `Share-Links für ${selectedGalleries.length} Galerien wurden deaktiviert.`,
      })
    } catch (error) {
      console.error("Fehler beim Deaktivieren der Share-Links:", error)
      toast({
        title: "Fehler",
        description: "Beim Deaktivieren der Share-Links ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportData = async () => {
    if (selectedGalleries.length === 0) return

    setIsProcessing(true)
    try {
      const selectedGalleryObjects = galleries.filter((g) => selectedGalleries.includes(g.id))
      await onExportData(selectedGalleryObjects)
      toast({
        title: "Daten exportiert",
        description: `Daten für ${selectedGalleries.length} Galerien wurden exportiert.`,
      })
    } catch (error) {
      console.error("Fehler beim Exportieren der Daten:", error)
      toast({
        title: "Fehler",
        description: "Beim Exportieren der Daten ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectedGalleries.length > 0 && selectedGalleries.length === galleries.length}
            onCheckedChange={toggleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            {selectedGalleries.length === 0
              ? "Alle auswählen"
              : `${selectedGalleries.length} von ${galleries.length} ausgewählt`}
          </label>
        </div>

        <div className="flex w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={selectedGalleries.length === 0 || isProcessing}>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Aktionen <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleEnableSelected}>
                <Eye className="mr-2 h-4 w-4" />
                Share-Links aktivieren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDisableSelected}>
                <EyeOff className="mr-2 h-4 w-4" />
                Share-Links deaktivieren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Daten exportieren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteSelected} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-2">
        {selectedGalleries.length > 0 && (
          <p className="text-sm text-muted-foreground">Ausgewählte Galerien: {selectedGalleries.length}</p>
        )}
      </div>
    </div>
  )
}

