import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // URL aus den Query-Parametern extrahieren
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return new NextResponse("URL parameter is required", { status: 400 })
    }

    console.log(`Proxying image from: ${url}`)

    // Bild von der angegebenen URL abrufen
    const imageResponse = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`)
      return new NextResponse(`Failed to fetch image: ${imageResponse.status}`, { status: imageResponse.status })
    }

    // Bild-Daten und Content-Type extrahieren
    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg"

    // Antwort mit dem Bild und den richtigen CORS-Headern zurückgeben
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Disposition": `attachment; filename="${encodeURIComponent("download." + contentType.split("/")[1])}"`,
      },
    })
  } catch (error) {
    console.error("Error proxying image:", error)
    return new NextResponse(`Error proxying image: ${error}`, { status: 500 })
  }
}

