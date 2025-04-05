"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage"
import { collection, addDoc } from "firebase/firestore"
import { storage, db } from "@/lib/firebase"

// UI-Komponenten
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { Upload, X, FileText, Image, FileCode, Music, Video, Package, FileIcon } from "lucide-react"

interface DirectSDKUploadProps {
  userId: string
  folderId: string
  onUploadComplete: () => void
}

export function DirectSDKUpload({ userId, folderId, onUploadComplete }: DirectSDKUploadProps) {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Hilfsfunktion zum Ermitteln des Dateityp-Icons
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />
    if (fileType.startsWith("text/")) return <FileText className="h-4 w-4" />
    if (fileType.startsWith("audio/")) return <Music className="h-4 w-4" />
    if (fileType.startsWith("video/")) return <Video className="h-4 w-4" />
    if (fileType.includes("javascript") || fileType.includes("json") || fileType.includes("html"))
      return <FileCode className="h-4 w-4" />
    if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("tar"))
      return <Package className="h-4 w-4" />
    return <FileIcon className="h-4 w-4" />
  }

  // Event-Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !userId || !folderId) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Erstelle einen eindeutigen Dateinamen
      const timestamp = Date.now()
      const fileName = `${timestamp}_${selectedFile.name}`

      // Referenz zum Speicherort in Firebase Storage
      const storageRef = ref(storage, `users/${userId}/${folderId}/${fileName}`)

      // Datei mit Fortschrittsanzeige hochladen
      const uploadTask = uploadBytesResumable(storageRef, selectedFile)

      // Fortschrittsanzeige
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error("Upload error:", error)
          let errorMessage = "Die Datei konnte nicht hochgeladen werden."

          // Detaillierte Fehlermeldungen je nach Fehlercode
          if (error.code === "storage/unauthorized") {
            errorMessage = "Keine Berechtigung zum Hochladen. Bitte überprüfen Sie Ihre Anmeldedaten."
          } else if (error.code === "storage/canceled") {
            errorMessage = "Der Upload wurde abgebrochen."
          } else if (error.code === "storage/unknown") {
            errorMessage = "Ein unbekannter Fehler ist aufgetreten."
          }

          toast({
            title: "Fehler beim Hochladen",
            description: errorMessage,
            variant: "destructive",
          })

          setIsUploading(false)
          return
        },
      )

      // Warte auf Abschluss des Uploads
      await uploadTask

      // Download-URL abrufen
      const url = await getDownloadURL(storageRef)

      // Datei-Metadaten in Firestore speichern
      await addDoc(collection(db, "files"), {
        name: selectedFile.name,
        folderId,
        userId,
        url,
        type: selectedFile.type,
        size: selectedFile.size,
        createdAt: new Date(),
      })

      toast({
        title: "Datei hochgeladen",
        description: `${selectedFile.name} wurde erfolgreich hochgeladen.`,
      })

      // Zurücksetzen
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Callback aufrufen, um die Dateiliste zu aktualisieren
      onUploadComplete()
    } catch (error) {
      console.error("Fehler beim Hochladen der Datei:", error)
      toast({
        title: "Fehler beim Hochladen",
        description: "Die Datei konnte nicht hochgeladen werden.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Datei hochladen</h3>
      </div>

      <div className="flex flex-col gap-4">
        {/* Dateiauswahl */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            Datei auswählen
          </Button>

          {selectedFile && (
            <div className="flex items-center gap-2 flex-1 p-2 bg-muted/20 rounded-md">
              {getFileIcon(selectedFile.type)}
              <span className="truncate">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={clearSelectedFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Fortschrittsanzeige und Upload-Button */}
        {selectedFile && (
          <>
            {isUploading && <Progress value={uploadProgress} className="h-2" />}
            <Button onClick={handleUpload} disabled={isUploading} className="w-full">
              {isUploading ? (
                <>Wird hochgeladen... {Math.round(uploadProgress)}%</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Hochladen
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

