import { type NextRequest, NextResponse } from "next/server"
import { getFileByNameAndFolder } from "@/lib/utils/storage-service-enhanced"

export async function GET(request: NextRequest, { params }: { params: { folderId: string; fileName: string } }) {
  try {
    const { folderId, fileName } = params

    // Dekodieren des Dateinamens
    const decodedFileName = decodeURIComponent(fileName)

    console.log("API route called:", {
      folderId,
      fileName,
      decodedFileName,
    })

    // Datei in der Datenbank suchen
    const fileData = await getFileByNameAndFolder(decodedFileName, folderId)

    if (!fileData) {
      console.error("File not found:", { folderId, fileName: decodedFileName })
      return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 })
    }

    // Datei-Metadaten zurückgeben
    return NextResponse.json({
      id: fileData.id,
      name: fileData.name,
      originalName: fileData.originalName || fileData.name,
      url: fileData.url,
      type: fileData.type,
      size: fileData.size,
      createdAt: fileData.createdAt,
      uploadedViaApi: fileData.uploadedViaApi || false,
    })
  } catch (error) {
    console.error("Error in file API:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}

