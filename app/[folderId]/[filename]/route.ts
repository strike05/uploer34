import { type NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { folderId: string; filename: string } }) {
  const { folderId, filename } = params

  try {
    // Datei-Metadaten aus Firestore abrufen
    const filesQuery = query(collection(db, "files"), where("folderId", "==", folderId), where("name", "==", filename))

    const snapshot = await getDocs(filesQuery)

    if (snapshot.empty) {
      return new NextResponse("Datei nicht gefunden.", { status: 404 })
    }

    const fileData = snapshot.docs[0].data()

    // Datei von Firebase Storage abrufen
    const fileResponse = await fetch(fileData.url)

    if (!fileResponse.ok) {
      return new NextResponse("Fehler beim Laden der Datei.", { status: 500 })
    }

    // Response-Header übernehmen und anpassen
    const headers = new Headers(fileResponse.headers)
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800")
    headers.set("X-Robots-Tag", "noindex, nofollow")

    // Content-Disposition Header setzen, um den ursprünglichen Dateinamen zu verwenden
    headers.set("Content-Disposition", `inline; filename="${encodeURIComponent(filename)}"`)

    // Datei-Stream zurückgeben
    return new NextResponse(fileResponse.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Fehler beim Dateiabruf:", error)
    return new NextResponse("Interner Serverfehler", { status: 500 })
  }
}

