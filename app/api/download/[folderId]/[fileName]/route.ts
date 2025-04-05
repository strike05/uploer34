import { type NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { folderId: string; fileName: string } }) {
  try {
    const { folderId, fileName } = params

    if (!folderId || !fileName) {
      return new NextResponse("Missing folderId or fileName", { status: 400 })
    }

    // Dekodiere den Dateinamen
    const decodedFileName = decodeURIComponent(fileName)

    console.log(`Download requested for: ${folderId}/${decodedFileName}`)

    // Suche die Datei in Firestore
    const filesQuery = query(collection(db, "files"), where("folderId", "==", folderId))

    const snapshot = await getDocs(filesQuery)

    if (snapshot.empty) {
      return new NextResponse("Folder not found", { status: 404 })
    }

    // Suche nach der Datei mit dem angegebenen Namen
    let fileData = null
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (
        data.name === decodedFileName ||
        data.originalName === decodedFileName ||
        data.storageName === decodedFileName
      ) {
        fileData = { ...data, id: doc.id }
      }
    })

    if (!fileData) {
      return new NextResponse("File not found", { status: 404 })
    }

    // Hole die Datei von der URL
    const fileUrl = fileData.url
    const response = await fetch(fileUrl)

    if (!response.ok) {
      return new NextResponse(`Failed to fetch file: ${response.status}`, {
        status: response.status,
      })
    }

    // Bestimme den Dateinamen für den Download
    const downloadFileName = fileData.originalName || fileData.name || "download"

    // Hole die Datei als ArrayBuffer
    const fileBuffer = await response.arrayBuffer()

    // Bestimme den Content-Type
    const contentType = response.headers.get("content-type") || "application/octet-stream"

    // Sende die Datei als Download
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadFileName)}"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error in download route:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

