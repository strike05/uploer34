"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DirectLinkViewer } from "@/components/file-management/direct-link-viewer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { LoadingSpinner } from "@/components/shared/loading-spinner"

export default function ViewPage() {
  const params = useParams()
  const router = useRouter()
  const folderId = params.folderId as string
  const fileName = decodeURIComponent(params.fileName as string)

  const [fileData, setFileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debugging-Ausgabe
  console.log("ViewPage params:", {
    folderId,
    fileName,
    rawFileName: params.fileName,
  })

  useEffect(() => {
    // Überprüfen, ob es sich um eine Share-ID handelt
    if (folderId === "s") {
      console.log("Detected share ID pattern, redirecting to correct URL")
      router.push(`/s/${fileName}`)
      return
    }

    const loadFileData = async () => {
      try {
        setIsLoading(true)
        console.log(`Loading file data for folder: ${folderId}, fileName: ${fileName}`)

        // 1. Versuche zuerst, die Datei mit dem exakten Namen zu finden
        let filesQuery = query(
          collection(db, "files"),
          where("folderId", "==", folderId),
          where("name", "==", fileName),
        )

        let snapshot = await getDocs(filesQuery)

        // 2. Wenn nicht gefunden, versuche mit originalName
        if (snapshot.empty) {
          console.log("File not found with name, trying originalName")
          filesQuery = query(
            collection(db, "files"),
            where("folderId", "==", folderId),
            where("originalName", "==", fileName),
          )
          snapshot = await getDocs(filesQuery)
        }

        // 3. Wenn immer noch nicht gefunden, versuche mit storageName
        if (snapshot.empty) {
          console.log("File not found with originalName, trying storageName")
          filesQuery = query(
            collection(db, "files"),
            where("folderId", "==", folderId),
            where("storageName", "==", fileName),
          )
          snapshot = await getDocs(filesQuery)
        }

        // 4. Wenn immer noch nicht gefunden, hole alle Dateien im Ordner und durchsuche sie
        if (snapshot.empty) {
          console.log("File not found with specific queries, fetching all files in folder")
          filesQuery = query(
            collection(db, "files"),
            where("folderId", "==", folderId),
            orderBy("createdAt", "desc"),
            limit(100), // Begrenze auf 100 Dateien für Performance
          )

          snapshot = await getDocs(filesQuery)

          if (snapshot.empty) {
            console.error("No files found in folder:", folderId)
            setError("Keine Dateien im Ordner gefunden")
            setIsLoading(false)
            return
          }

          // Durchsuche alle Dateien nach Teilübereinstimmungen
          let foundFile = null
          snapshot.forEach((doc) => {
            const data = doc.data()
            const fileNameLower = fileName.toLowerCase()
            const docNameLower = data.name ? data.name.toLowerCase() : ""

            // Prüfe verschiedene Felder auf Teilübereinstimmungen
            if (
              (docNameLower && docNameLower.includes(fileNameLower)) ||
              (data.originalName && data.originalName.toLowerCase().includes(fileNameLower)) ||
              (data.storageName && data.storageName.toLowerCase().includes(fileNameLower)) ||
              (data.storagePath && data.storagePath.toLowerCase().includes(fileNameLower))
            ) {
              foundFile = { ...data, id: doc.id }
              console.log("Found file with partial match:", foundFile)
            }
          })

          if (foundFile) {
            setFileData(foundFile)
            setIsLoading(false)
            return
          }
        } else {
          // Datei wurde in einem der vorherigen Schritte gefunden
          const fileData = snapshot.docs[0].data()
          fileData.id = snapshot.docs[0].id
          console.log("File data retrieved:", fileData)
          setFileData(fileData)
          setIsLoading(false)
          return
        }

        // Wenn wir hier ankommen, wurde keine Datei gefunden
        console.error("File not found in folder:", { folderId, fileName })
        setError("Datei nicht gefunden")
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading file data:", error)
        setError("Die angeforderte Datei konnte nicht geladen werden.")
        setIsLoading(false)
      }
    }

    if (folderId && fileName) {
      loadFileData()
    }
  }, [folderId, fileName, router])

  const handleGoBack = () => {
    router.back()
  }

  if (isLoading) {
    return <LoadingSpinner text="Lade Datei..." />
  }

  if (error || !fileData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Fehler beim Laden der Datei</h1>
          <p className="mb-6">{error || "Die angeforderte Datei konnte nicht geladen werden."}</p>
          <div className="mt-4 p-4 bg-gray-700 rounded text-sm mb-6">
            <p>Debug-Info:</p>
            <p>Ordner-ID: {folderId}</p>
            <p>Dateiname: {fileName}</p>
          </div>
          <Button onClick={handleGoBack} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>
      </div>
    )
  }

  // Verwende die direkte URL für das Bild
  const imageUrl = fileData.url
  console.log("Using image URL:", imageUrl)

  return (
    <DirectLinkViewer
      imageUrl={imageUrl}
      fileName={fileData.name || fileName}
      folderId={folderId}
      fileId={fileData.id}
      onClose={handleGoBack}
    />
  )
}

