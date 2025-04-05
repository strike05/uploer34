import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // URL und Dateiname aus den Query-Parametern extrahieren
    const url = request.nextUrl.searchParams.get("url")
    const filename = request.nextUrl.searchParams.get("filename") || "download"

    if (!url) {
      return new NextResponse("URL parameter is required", { status: 400 })
    }

    console.log(`Downloading file from: ${url}, filename: ${filename}`)

    // Datei von der angegebenen URL abrufen
    const fileResponse = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!fileResponse.ok) {
      console.error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`)
      return new NextResponse(`Failed to fetch file: ${fileResponse.status}`, { status: fileResponse.status })
    }

    // Datei-Daten und Content-Type extrahieren
    const fileBuffer = await fileResponse.arrayBuffer()
    const contentType = fileResponse.headers.get("content-type") || "application/octet-stream"

    // Bestimme die Dateiendung basierend auf dem Content-Type
    let extension = "bin"
    if (contentType.includes("image/jpeg")) extension = "jpg"
    else if (contentType.includes("image/png")) extension = "png"
    else if (contentType.includes("image/gif")) extension = "gif"
    else if (contentType.includes("image/webp")) extension = "webp"
    else if (contentType.includes("application/pdf")) extension = "pdf"
    else if (contentType.includes("text/plain")) extension = "txt"
    else if (contentType.includes("text/html")) extension = "html"
    else if (contentType.includes("text/css")) extension = "css"
    else if (contentType.includes("text/javascript")) extension = "js"
    else if (contentType.includes("application/json")) extension = "json"
    else if (contentType.includes("application/xml")) extension = "xml"
    else if (contentType.includes("application/zip")) extension = "zip"

    // Erstelle einen sicheren Dateinamen
    let safeFilename = filename
    if (!safeFilename.includes(".")) {
      safeFilename = `${safeFilename}.${extension}`
    }

    // Antwort mit der Datei und den richtigen Headern zurückgeben
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(safeFilename)}"`,
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  } catch (error) {
    console.error("Error downloading file:", error)
    return new NextResponse(`Error downloading file: ${error}`, { status: 500 })
  }
}

