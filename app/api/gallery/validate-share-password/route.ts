import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getGalleryByShareId } from "@/lib/services/gallery-service"

export async function POST(request: NextRequest) {
  try {
    const { shareId, password } = await request.json()

    if (!shareId || !password) {
      return NextResponse.json({ valid: false, message: "Share-ID und Passwort sind erforderlich" }, { status: 400 })
    }

    // Hole die Galerie-Daten
    const gallery = await getGalleryByShareId(shareId)

    if (!gallery) {
      return NextResponse.json({ valid: false, message: "Galerie nicht gefunden" }, { status: 404 })
    }

    // Prüfe, ob der Share-Link aktiviert ist
    if (!gallery.shareEnabled) {
      return NextResponse.json({ valid: false, message: "Dieser Share-Link ist deaktiviert" }, { status: 403 })
    }

    // Prüfe, ob der Share-Link abgelaufen ist
    if (gallery.shareExpiresAt && gallery.shareExpiresAt < new Date()) {
      return NextResponse.json({ valid: false, message: "Dieser Share-Link ist abgelaufen" }, { status: 403 })
    }

    // Überprüfe das Passwort
    if (gallery.sharePassword !== password) {
      return NextResponse.json({ valid: false, message: "Ungültiges Passwort" }, { status: 401 })
    }

    // Passwort ist korrekt, setze ein Cookie
    const cookieStore = cookies()
    cookieStore.set(`share_password_${shareId}`, password, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 Woche
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Fehler bei der Passwortvalidierung:", error)
    return NextResponse.json({ valid: false, message: "Ein Fehler ist aufgetreten" }, { status: 500 })
  }
}

