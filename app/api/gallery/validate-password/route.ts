import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getGalleryById } from "@/lib/services/gallery-service"

export async function POST(request: NextRequest) {
  try {
    const { galleryId, password } = await request.json()

    if (!galleryId || !password) {
      return NextResponse.json({ valid: false, message: "Galerie-ID und Passwort sind erforderlich" }, { status: 400 })
    }

    // Hole die Galerie-Daten
    const gallery = await getGalleryById(galleryId)

    if (!gallery) {
      return NextResponse.json({ valid: false, message: "Galerie nicht gefunden" }, { status: 404 })
    }

    // Überprüfe das Passwort
    if (gallery.password !== password) {
      return NextResponse.json({ valid: false, message: "Ungültiges Passwort" }, { status: 401 })
    }

    // Passwort ist korrekt, setze ein Cookie
    const cookieStore = cookies()
    cookieStore.set(`gallery_password_${galleryId}`, password, {
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

