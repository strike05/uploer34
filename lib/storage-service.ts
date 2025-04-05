import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, setDoc } from "firebase/firestore"
import { storage, db, auth } from "./firebase"
import type { Folder, FileItem } from "@/types"

// Hilfsfunktion, um den aktuellen Benutzer zu erhalten
export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null
}

// Erstellt einen Ordner für einen neuen Benutzer
export async function createUserRootFolder(userId: string) {
  try {
    // Erstelle einen Eintrag in Firestore für den Root-Ordner mit Standard-Social-Media-Einstellungen
    await setDoc(doc(db, "folders", userId), {
      name: "Root",
      userId,
      isRoot: true,
      createdAt: new Date(),
      socialMediaSettings: {
        instagramEnabled: true,
        facebookEnabled: true,
        twitterEnabled: true,
        whatsappEnabled: true,
        customButtonEnabled: false,
        customButtonLabel: "",
        customButtonUrl: "",
        showDownloadButton: true,
        showCopyLinkButton: true,
        controlBarPosition: "attached",
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Fehler beim Erstellen des Root-Ordners:", error)
    return { success: false, error }
  }
}

// Erstellt einen neuen Ordner
export async function createFolder(userId: string, folderName: string) {
  try {
    // Prüfen, ob der Benutzer authentifiziert ist
    if (!userId) {
      throw new Error("Benutzer ist nicht authentifiziert")
    }

    // Erstelle einen Eintrag in Firestore mit Standard-Social-Media-Einstellungen
    const folderRef = await addDoc(collection(db, "folders"), {
      name: folderName,
      userId,
      createdAt: new Date(),
      socialMediaSettings: {
        instagramEnabled: true,
        facebookEnabled: true,
        twitterEnabled: true,
        whatsappEnabled: true,
        customButtonEnabled: false,
        customButtonLabel: "",
        customButtonUrl: "",
        showDownloadButton: true,
        showCopyLinkButton: true,
        controlBarPosition: "attached",
      },
    })

    return { success: true, folderId: folderRef.id }
  } catch (error) {
    console.error("Fehler beim Erstellen des Ordners:", error)
    return { success: false, error }
  }
}

// Lädt eine Datei in einen Ordner hoch
export async function uploadFile(userId: string, folderId: string, file: File) {
  try {
    // Prüfen, ob der Benutzer authentifiziert ist
    if (!userId) {
      throw new Error("Benutzer ist nicht authentifiziert")
    }

    // Erstelle einen eindeutigen Dateinamen
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`

    // Referenz zum Speicherort in Firebase Storage
    const storageRef = ref(storage, `users/${userId}/${folderId}/${fileName}`)

    // Datei hochladen
    const snapshot = await uploadBytes(storageRef, file)

    // Download-URL abrufen
    const url = await getDownloadURL(snapshot.ref)

    // Importiere die Konfiguration für direkte URLs
    const { FILE_CONFIG } = await import("../config/file")

    // Hardcoded APP_URL
    const appUrl = "https://v0-uploader34.vercel.app"

    // Erstelle die direkte URL
    const directUrl = FILE_CONFIG.directFileUrlPattern(folderId, file.name)

    // Datei-Metadaten in Firestore speichern
    const fileRef = await addDoc(collection(db, "files"), {
      name: file.name,
      folderId,
      userId,
      url: directUrl, // Verwende die direkte URL
      storageUrl: url, // Speichere auch die Original-Storage-URL
      type: file.type,
      size: file.size,
      createdAt: new Date(),
    })

    return {
      success: true,
      fileId: fileRef.id,
      url,
      name: file.name,
      type: file.type,
      size: file.size,
    }
  } catch (error) {
    console.error("Fehler beim Hochladen der Datei:", error)
    return { success: false, error }
  }
}

// Holt alle Ordner eines Benutzers
export async function getUserFolders(userId: string): Promise<Folder[]> {
  try {
    // Prüfen, ob der Benutzer authentifiziert ist
    if (!userId) {
      console.error("Benutzer ist nicht authentifiziert")
      return []
    }

    const foldersQuery = query(collection(db, "folders"), where("userId", "==", userId))

    const querySnapshot = await getDocs(foldersQuery)
    const folders: Folder[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      folders.push({
        id: doc.id,
        name: data.name,
        userId: data.userId,
        createdAt: data.createdAt.toDate(),
        isRoot: data.isRoot || false,
      })
    })

    return folders
  } catch (error) {
    console.error("Fehler beim Abrufen der Ordner:", error)
    return []
  }
}

// Holt alle Dateien in einem Ordner
export async function getFolderFiles(folderId: string): Promise<FileItem[]> {
  try {
    // Prüfen, ob eine Ordner-ID vorhanden ist
    if (!folderId) {
      console.error("Keine Ordner-ID angegeben")
      return []
    }

    console.log("Hole Dateien für Ordner-ID:", folderId)

    const filesQuery = query(collection(db, "files"), where("folderId", "==", folderId))
    console.log("Abfrage erstellt, führe Abfrage aus...")

    const querySnapshot = await getDocs(filesQuery)
    console.log("Abfrage ausgeführt, Anzahl der Ergebnisse:", querySnapshot.size)

    const files: FileItem[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      files.push({
        id: doc.id,
        name: data.name,
        folderId: data.folderId,
        userId: data.userId,
        url: data.url,
        type: data.type,
        size: data.size,
        createdAt: data.createdAt.toDate(),
      })
    })

    console.log("Dateien erfolgreich abgerufen, Anzahl:", files.length)
    return files
  } catch (error) {
    console.error("Fehler beim Abrufen der Dateien:", error)
    throw error // Fehler weitergeben, damit er in der UI angezeigt werden kann
  }
}

// Löscht eine Datei
export async function deleteFile(userId: string, fileItem: FileItem) {
  try {
    // Prüfen, ob der Benutzer authentifiziert ist
    if (!userId) {
      throw new Error("Benutzer ist nicht authentifiziert")
    }

    // URL der Datei extrahieren, um den korrekten Pfad zu erhalten
    const url = fileItem.url
    const storageRef = ref(storage, decodeURIComponent(url.split("?")[0].split("/o/")[1]))

    // Datei aus Storage löschen
    await deleteObject(storageRef)

    // Datei aus Firestore löschen
    await deleteDoc(doc(db, "files", fileItem.id))

    return { success: true }
  } catch (error) {
    console.error("Fehler beim Löschen der Datei:", error)
    return { success: false, error }
  }
}

// Löscht einen Ordner und alle darin enthaltenen Dateien
export async function deleteFolder(userId: string, folderId: string) {
  try {
    // Prüfen, ob der Benutzer authentifiziert ist
    if (!userId) {
      throw new Error("Benutzer ist nicht authentifiziert")
    }

    // Alle Dateien im Ordner abrufen
    const files = await getFolderFiles(folderId)

    // Alle Dateien löschen
    for (const file of files) {
      await deleteFile(userId, file)
    }

    // Ordner aus Firestore löschen
    await deleteDoc(doc(db, "folders", folderId))

    return { success: true }
  } catch (error) {
    console.error("Fehler beim Löschen des Ordners:", error)
    return { success: false, error }
  }
}
