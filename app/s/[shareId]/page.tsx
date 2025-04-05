import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import { GalleryView } from "@/components/gallery/public/gallery-view"
import { SharePasswordForm } from "@/components/gallery/public/share-password-form"
import { getGalleryByShareId, updateShareLinkStats } from "@/lib/services/gallery-service"
import { getFolderFiles } from "@/lib/storage-service"

// Funktion zum Überprüfen des Passworts
async function isPasswordValid(shareId: string, password: string | null) {
  if (!password) return false

  // Hole die Galerie-Daten
  const gallery = await getGalleryByShareId(shareId)
  if (!gallery) return false

  // Wenn die Galerie kein Passwort hat, ist sie immer zugänglich
  if (!gallery.sharePassword) return true

  // Überprüfe das Passwort
  return gallery.sharePassword === password
}

export default async function SharePage({
  params,
  searchParams,
}: {
  params: { shareId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const shareId = params.shareId
  const referrer = searchParams.ref as string | undefined

  console.log("Versuche, Galerie mit Share-ID abzurufen:", shareId)

  try {
    // Hole die Galerie-Daten
    const gallery = await getGalleryByShareId(shareId)

    // Wenn die Galerie nicht existiert, der Share-Link deaktiviert ist oder abgelaufen ist
    if (!gallery) {
      console.error("Galerie nicht gefunden oder Share-Link deaktiviert/abgelaufen:", shareId)
      return notFound()
    }

    console.log("Galerie gefunden:", gallery.id, "mit Folder-ID:", gallery.folderId)

    // Aktualisiere die Share-Link-Statistiken
    try {
      await updateShareLinkStats(shareId, referrer)
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Share-Link-Statistiken:", error)
      // Wir fahren trotzdem fort, da dies nicht kritisch ist
    }

    // Prüfe, ob ein Passwort erforderlich ist
    const requiresPassword = !!gallery.sharePassword
    console.log("Passwort erforderlich:", requiresPassword)

    // Hole das Passwort aus den Cookies
    const cookieStore = cookies()
    const passwordCookie = cookieStore.get(`share_password_${shareId}`)
    const hasValidPassword = await isPasswordValid(shareId, passwordCookie?.value || null)
    console.log("Hat gültiges Passwort:", hasValidPassword)

    // Wenn ein Passwort erforderlich ist und kein gültiges Passwort vorhanden ist
    if (requiresPassword && !hasValidPassword) {
      return <SharePasswordForm shareId={shareId} galleryName={gallery.name} />
    }

    // Prüfe den Zugriff basierend auf shareAccess
    if (gallery.shareAccess === "restricted" || gallery.shareAccess === "private") {
      // Für eingeschränkten oder privaten Zugriff zur Galerie-Seite weiterleiten
      // Dort wird die Authentifizierung geprüft
      console.log("Weiterleitung zur Galerie-Seite wegen eingeschränktem Zugriff")
      return redirect(`/gallery/${gallery.id}`)
    }

    // Hole die Dateien für die Galerie
    console.log("Hole Dateien für Folder-ID:", gallery.folderId)
    try {
      const files = await getFolderFiles(gallery.folderId)
      console.log("Anzahl der gefundenen Dateien:", files.length)

      // Filtere nur Bilder und Videos
      const mediaFiles = files.filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))
      console.log("Anzahl der Medien-Dateien:", mediaFiles.length)

      // Wenn keine Dateien gefunden wurden, zeige eine entsprechende Meldung an
      if (mediaFiles.length === 0) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
              <h1 className="text-2xl font-bold mb-4">Keine Medien gefunden</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                In dieser Galerie befinden sich keine Bilder oder Videos.
              </p>
              <a
                href="/"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Zurück zur Startseite
              </a>
            </div>
          </div>
        )
      }

      return <GalleryView gallery={gallery} files={mediaFiles} />
    } catch (folderError) {
      console.error("Fehler beim Abrufen der Dateien:", folderError)
      throw folderError
    }
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Share-Seite:", error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Fehler beim Laden der Galerie</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Beim Laden der Galerie ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.
          </p>
          <p className="text-sm text-red-500 mb-4">
            Fehlerdetails: {error instanceof Error ? error.message : String(error)}
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Zurück zur Startseite
          </a>
        </div>
      </div>
    )
  }
}

