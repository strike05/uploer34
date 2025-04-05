import { getGalleryByShareId, checkGalleryExists } from "@/lib/services/gallery-service"

export default async function TestGalleryPage({ params }: { params: { shareId: string } }) {
  const shareId = params.shareId

  console.log("Test-Seite für Share-ID:", shareId)

  // Überprüfe, ob die Galerie existiert
  const exists = await checkGalleryExists(shareId)

  // Versuche, die Galerie abzurufen
  let gallery = null
  let error = null

  try {
    gallery = await getGalleryByShareId(shareId)
  } catch (err) {
    error = err
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Galerie-Test für Share-ID: {shareId}</h1>

      <div className="mb-4 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Existenz-Check</h2>
        <p>
          Galerie existiert:{" "}
          <span className={exists ? "text-green-600" : "text-red-600"}>{exists ? "Ja" : "Nein"}</span>
        </p>
      </div>

      {error ? (
        <div className="mb-4 p-4 border rounded bg-red-50">
          <h2 className="text-xl font-semibold mb-2 text-red-700">Fehler beim Abrufen der Galerie</h2>
          <pre className="whitespace-pre-wrap text-red-600">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      ) : null}

      {gallery ? (
        <div className="mb-4 p-4 border rounded bg-green-50">
          <h2 className="text-xl font-semibold mb-2 text-green-700">Galerie gefunden</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">ID:</div>
            <div>{gallery.id}</div>

            <div className="font-semibold">Name:</div>
            <div>{gallery.name}</div>

            <div className="font-semibold">Ordner-ID:</div>
            <div>{gallery.folderId}</div>

            <div className="font-semibold">Benutzer-ID:</div>
            <div>{gallery.userId}</div>

            <div className="font-semibold">Share-ID:</div>
            <div>{gallery.shareId}</div>

            <div className="font-semibold">Share-Link:</div>
            <div>{gallery.shareLink}</div>

            <div className="font-semibold">Share-Link aktiviert:</div>
            <div>{gallery.shareEnabled ? "Ja" : "Nein"}</div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 border rounded bg-yellow-50">
          <h2 className="text-xl font-semibold mb-2 text-yellow-700">Keine Galerie gefunden</h2>
          <p>Es wurde keine Galerie mit der Share-ID "{shareId}" gefunden.</p>
        </div>
      )}

      <div className="mt-4">
        <a href="/" className="text-blue-600 hover:underline">
          Zurück zur Startseite
        </a>
      </div>
    </div>
  )
}

