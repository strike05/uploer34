import { type NextRequest, NextResponse } from "next/server"
import { getFilesInFolder } from "@/lib/utils/storage-service-enhanced"

export async function GET(request: NextRequest, { params }: { params: { folderId: string } }) {
  try {
    const { folderId } = params

    console.log("API route called for folder:", folderId)

    // Alle Dateien im Ordner abrufen
    const files = await getFilesInFolder(folderId)

    if (!files || files.length === 0) {
      console.log("No files found in folder:", folderId)
      return NextResponse.json({ files: [] })
    }

    // Dateien zurückgeben
    return NextResponse.json({
      files: files.map((file) => ({
        id: file.id,
        name: file.name,
        originalName: file.originalName || file.name,
        url: file.url,
        type: file.type,
        size: file.size,
        createdAt: file.createdAt,
        uploadedViaApi: file.uploadedViaApi || false,
      })),
    })
  } catch (error) {
    console.error("Error in folder API:", error)
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}

