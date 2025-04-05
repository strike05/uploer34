import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { collection, addDoc, query, where, getDocs, orderBy, limit, doc, setDoc } from "firebase/firestore"
import { storage, db, auth } from "@/lib/firebase"
import type { FileItem, Folder } from "@/types"

// Importieren Sie die Konfiguration 
import { FILE_CONFIG } from "@/config/file"

// Enhanced uploadFile function with additional metadata
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
    const storagePath = `users/${userId}/${folderId}/${fileName}`
    const storageRef = ref(storage, storagePath)

    // Datei hochladen
    const snapshot = await uploadBytes(storageRef, file)

    // Download-URL abrufen
    const url = await getDownloadURL(snapshot.ref)

    // Generiere die direkte URL für den Dateizugriff
    const directUrl = FILE_CONFIG.directFileUrlPattern(folderId, file.name)

    // Datei-Metadaten in Firestore speichern
    const fileRef = await addDoc(collection(db, "files"), {
      name: file.name,
      originalName: file.name,
      storageName: fileName,
      folderId,
      userId,
      url,
      type: file.type,
      size: file.size,
      createdAt: new Date(),
      // New fields
      storagePath,
      customMetadata: {},
      directUrl, // Speichere die direkte URL in den Metadaten
      uploadedViaApi: false,
    })

    return {
      success: true,
      fileId: fileRef.id,
      url,
      directUrl,
      name: file.name,
      type: file.type,
      size: file.size,
    }
  } catch (error) {
    console.error("Fehler beim Hochladen der Datei:", error)
    return { success: false, error }
  }
}

// Füge diese Hilfsfunktion hinzu:
function normalizeFileName(fileName: string): string {
  try {
    // Versuche, den Dateinamen zu dekodieren, falls er URL-kodiert ist
    return decodeURIComponent(fileName)
  } catch (error) {
    console.error("Error decoding filename:", error)
    return fileName
  }
}

// Typdefinition für FileData
interface FileData {
  id?: string
  name: string
  originalName?: string
  storageName?: string
  folderId: string
  userId: string
  url: string
  type: string
  size: number
  createdAt: Date
  storagePath?: string
  customMetadata?: any
  directUrl?: string
  uploadedViaApi?: boolean
}

// Aktualisiere die getFileByNameAndFolder-Funktion:
export const getFileByNameAndFolder = async (fileName: string, folderId: string): Promise<FileData | null> => {
  try {
    console.log("Getting file by name and folder:", {
      originalFileName: fileName,
      folderId,
    })

    const normalizedFileName = normalizeFileName(fileName)
    console.log("Normalized fileName:", normalizedFileName)

    // Versuche zuerst mit dem normalisierten Namen
    let fileSnapshot = await getDocs(
      query(collection(db, "files"), where("folderId", "==", folderId), where("name", "==", normalizedFileName)),
    )

    // Wenn keine Ergebnisse, versuche mit dem Original-Namen
    if (fileSnapshot.empty && normalizedFileName !== fileName) {
      console.log("No results with normalized name, trying original name")
      fileSnapshot = await getDocs(
        query(collection(db, "files"), where("folderId", "==", folderId), where("name", "==", fileName)),
      )
    }

    // Wenn immer noch keine Ergebnisse, versuche mit dem originalName
    if (fileSnapshot.empty) {
      console.log("No results with name, trying originalName")
      fileSnapshot = await getDocs(
        query(
          collection(db, "files"),
          where("folderId", "==", folderId),
          where("originalName", "==", normalizedFileName),
        ),
      )
    }

    // Wenn immer noch keine Ergebnisse, versuche mit dem storageName
    if (fileSnapshot.empty) {
      console.log("No results with originalName, trying storageName")
      fileSnapshot = await getDocs(
        query(
          collection(db, "files"),
          where("folderId", "==", folderId),
          where("storageName", "==", normalizedFileName),
        ),
      )
    }

    // Wenn immer noch keine Ergebnisse, hole alle Dateien im Ordner und durchsuche sie
    if (fileSnapshot.empty) {
      console.log("No results with specific queries, fetching all files in folder")
      fileSnapshot = await getDocs(
        query(
          collection(db, "files"),
          where("folderId", "==", folderId),
          orderBy("createdAt", "desc"),
          limit(100), // Begrenze auf 100 Dateien für Performance
        ),
      )

      if (fileSnapshot.empty) {
        console.log("No files found in folder:", folderId)
        return null
      }

      // Durchsuche alle Dateien nach Teilübereinstimmungen
      let foundFile = null
      fileSnapshot.forEach((doc) => {
        const data = doc.data() as FileData
        const fileNameLower = normalizedFileName.toLowerCase()

        // Prüfe verschiedene Felder auf Teilübereinstimmungen
        if (
          (data.name && data.name.toLowerCase().includes(fileNameLower)) ||
          (data.originalName && data.originalName.toLowerCase().includes(fileNameLower)) ||
          (data.storageName && data.storageName.toLowerCase().includes(fileNameLower)) ||
          (data.storagePath && data.storagePath.toLowerCase().includes(fileNameLower))
        ) {
          foundFile = { ...data, id: doc.id }
          console.log("Found file with partial match:", foundFile)
        }
      })

      if (foundFile) {
        return foundFile as FileData
      }

      console.log("File not found:", { fileName, normalizedFileName, folderId })
      return null
    }

    const fileData = fileSnapshot.docs[0].data() as FileData
    fileData.id = fileSnapshot.docs[0].id
    console.log("File found:", fileData)
    return fileData
  } catch (error) {
    console.error("Error getting file by name and folder:", error)
    return null
  }
}

export const getFilesInFolder = async (folderId: string): Promise<FileItem[]> => {
  try {
    if (!folderId) {
      console.error("Keine Ordner-ID angegeben")
      return []
    }

    const filesQuery = query(collection(db, "files"), where("folderId", "==", folderId))
    const querySnapshot = await getDocs(filesQuery)

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

    return files
  } catch (error) {
    console.error("Fehler beim Abrufen der Dateien:", error)
    return []
  }
}

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
      socialMediaSettings: FILE_CONFIG.defaultSocialMediaSettings,
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
      socialMediaSettings: FILE_CONFIG.defaultSocialMediaSettings,
    })

    return { success: true, folderId: folderRef.id }
  } catch (error) {
    console.error("Fehler beim Erstellen des Ordners:", error)
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
        socialMediaSettings: data.socialMediaSettings,
      })
    })

    return folders
  } catch (error) {
    console.error("Fehler beim Abrufen der Ordner:", error)
    return []
  }
}

