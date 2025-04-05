"use client"

import type React from "react"

import { useState, useRef } from "react"
import { uploadFile } from "@/lib/utils/storage-service-enhanced"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"

// UI-Komponenten
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"

// Icons
import { Upload, X } from "lucide-react"

// Typen
interface FileUploadProps {
  userId: string
  folderId: string
  onUploadComplete: () => void
}

export function FileUpload({ userId, folderId, onUploadComplete }: FileUploadProps) {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Event-Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Erstelle einen eindeutigen Dateinamen
      const timestamp = Date.now()
      const fileName = `${timestamp}_${selectedFile.name}`
      const storagePath = `users/${userId}/${folderId}/${fileName}`
      const storageRef = ref(storage, storagePath)

      // Verwende uploadBytesResumable für echte Fortschrittsanzeige
      const uploadTask = uploadBytesResumable(storageRef, selectedFile)

      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error("Upload error:", error)
          toast({
            title: "Fehler beim Hochladen",
            description: "Die Datei konnte nicht hochgeladen werden: " + error.message,
            variant: "destructive",
          })
          setIsUploading(false)
        },
        async () => {
          // Handle successful uploads on complete
          try {
            const result = await uploadFile(userId, folderId, selectedFile)
            
            if (result.success) {
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
            } else {
              throw new Error(result.error || "Die Datei konnte nicht hochgeladen werden.")
            }
          } catch (error: any) {
            toast({
              title: "Fehler beim Speichern der Metadaten",
              description: error.message || "Ein unerwarteter Fehler ist aufgetreten.",
              variant: "destructive",
            })
          } finally {
            setIsUploading(false)
            setUploadProgress(100)
          }
        }
      )
    } catch (error: any) {
      toast({
        title: "Fehler beim Hochladen",
        description: error.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      })
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

