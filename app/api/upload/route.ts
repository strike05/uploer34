import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/api-key-service"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { collection, addDoc } from "firebase/firestore"
import { storage, db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    // API-Schlüssel aus der Anfrage extrahieren
    const apiKey = request.nextUrl.searchParams.get("key")

    if (!apiKey) {
      return NextResponse.json({ error: "API-Schlüssel fehlt" }, { status: 401 })
    }

    // API-Schlüssel validieren
    const validation = await validateApiKey(apiKey)

    if (!validation.valid || !validation.folderId || !validation.userId) {
      return NextResponse.json({ error: "Ungültiger API-Schlüssel" }, { status: 401 })
    }

    // Formular-Daten extrahieren
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Keine Datei gefunden" }, { status: 400 })
    }

    // Datei hochladen
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const storageRef = ref(storage, `users/${validation.userId}/${validation.folderId}/${fileName}`)

    // Datei in Firebase Storage hochladen
    const snapshot = await uploadBytes(storageRef, await file.arrayBuffer())

    // Download-URL abrufen
    const url = await getDownloadURL(snapshot.ref)

    // Datei-Metadaten in Firestore speichern
    const fileRef = await addDoc(collection(db, "files"), {
      name: file.name, // Speichere den ursprünglichen Dateinamen ohne Timestamp
      originalName: file.name, // Speichere den ursprünglichen Dateinamen
      storageName: fileName, // Speichere den Namen mit Timestamp, wie er im Storage gespeichert ist
      folderId: validation.folderId,
      userId: validation.userId,
      url,
      type: file.type,
      size: file.size,
      createdAt: new Date(),
      uploadedViaApi: true,
      storagePath: `users/${validation.userId}/${validation.folderId}/${fileName}`,
    })

    return NextResponse.json({
      success: true,
      fileId: fileRef.id,
      url,
      name: file.name,
    })
  } catch (error: any) {
    console.error("Fehler beim Datei-Upload:", error)
    return NextResponse.json({ error: error.message || "Interner Serverfehler" }, { status: 500 })
  }
}

