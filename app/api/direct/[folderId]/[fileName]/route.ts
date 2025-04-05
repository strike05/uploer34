import { type NextRequest, NextResponse } from "next/server"
import { getFileByNameAndFolder } from "@/lib/utils/storage-service-enhanced"

export async function GET(request: NextRequest, { params }: { params: { folderId: string; fileName: string } }) {
  try {
    const { folderId, fileName } = params

    // Dekodieren des Dateinamens
    const decodedFileName = decodeURIComponent(fileName)

    console.log("API route called for direct file access:", {
      folderId,
      fileName,
      decodedFileName,
    })

    // Datei in der Datenbank suchen
    const fileData = await getFileByNameAndFolder(decodedFileName, folderId)

    if (!fileData) {
      console.error("File not found:", { folderId, fileName: decodedFileName })
      return new NextResponse("Datei nicht gefunden", { status: 404 })
    }

    // Prüfen, ob eine Storage-URL vorhanden ist
    const redirectUrl = fileData.storageUrl || fileData.url
    
    if (!redirectUrl) {
      console.error("No valid URL found for file:", { folderId, fileName: decodedFileName })
      return new NextResponse("Keine gültige URL für die Datei gefunden", { status: 404 })
    }

    // Setze ein Cache-Control-Header für bessere Performance
    const headers = new Headers()
    headers.set('Cache-Control', 'public, max-age=31536000') // 1 Jahr
    
    // Setze Content-Type Header basierend auf dem Dateityp
    if (fileData.type) {
      headers.set('Content-Type', fileData.type)
    }
    
    // Umleitung zur tatsächlichen Datei-URL
    return NextResponse.redirect(redirectUrl, {
      headers: headers,
      status: 302
    })
  } catch (error) {
    console.error("Error in direct file access:", error)
    return new NextResponse("Interner Serverfehler", { status: 500 })
  }
}

