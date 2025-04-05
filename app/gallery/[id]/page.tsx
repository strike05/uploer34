import { redirect } from "next/navigation"
import { getGalleryById } from "@/lib/services/gallery-service"

export default async function GalleryRedirectPage({ params }: { params: { id: string } }) {
  const galleryId = params.id

  console.log("Versuche, Galerie mit ID zu finden und weiterzuleiten:", galleryId)

  try {
    // Versuche, die Galerie anhand der ID zu finden
    const gallery = await getGalleryById(galleryId)

    if (gallery) {
      console.log("Galerie gefunden, leite weiter zu Share-ID:", gallery.shareId)
      // Wenn die Galerie gefunden wurde und eine Share-ID hat, leite zur neuen Share-Link-Route weiter
      if (gallery.shareId && gallery.shareEnabled) {
        // Stelle sicher, dass wir immer zur /s/ Route weiterleiten
        return redirect(`/s/${gallery.shareId}`)
      } else {
        console.log("Galerie hat keine Share-ID oder Share-Link ist deaktiviert")
      }
    } else {
      console.log("Keine Galerie mit dieser ID gefunden")
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Galerie:", error)
  }

  // Wenn die Galerie nicht gefunden wurde oder ein Fehler auftrat, zeige eine Fehlermeldung
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Galerie nicht gefunden</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Die angeforderte Galerie existiert nicht oder ist nicht mehr verfügbar.
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

