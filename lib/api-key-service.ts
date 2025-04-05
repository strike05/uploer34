import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "./firebase"
import { v4 as uuidv4 } from "uuid"

// Typ-Definitionen
export interface ApiKey {
  id: string
  key: string
  folderId: string
  userId: string
  folderName: string
  description: string
  createdAt: Date
  lastUsed?: Date
}

// Generiert einen neuen API-Schlüssel für einen Ordner
export async function generateApiKey(
  userId: string,
  folderId: string,
  folderName: string,
  description: string,
): Promise<ApiKey | null> {
  try {
    // Prüfen, ob der Benutzer authentifiziert ist
    if (!userId) {
      throw new Error("Benutzer ist nicht authentifiziert")
    }

    // Generiere einen eindeutigen API-Schlüssel
    const apiKey = `fbs_${uuidv4().replace(/-/g, "")}`

    // Speichere den API-Schlüssel in Firestore
    const apiKeyRef = await addDoc(collection(db, "apiKeys"), {
      key: apiKey,
      folderId,
      userId,
      folderName,
      description,
      createdAt: new Date(),
    })

    return {
      id: apiKeyRef.id,
      key: apiKey,
      folderId,
      userId,
      folderName,
      description,
      createdAt: new Date(),
    }
  } catch (error) {
    console.error("Fehler beim Generieren des API-Schlüssels:", error)
    return null
  }
}

// Holt alle API-Schlüssel eines Benutzers
export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  try {
    // Prüfen, ob der Benutzer authentifiziert ist
    if (!userId) {
      console.error("Benutzer ist nicht authentifiziert")
      return []
    }

    const apiKeysQuery = query(collection(db, "apiKeys"), where("userId", "==", userId))

    const querySnapshot = await getDocs(apiKeysQuery)
    const apiKeys: ApiKey[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      apiKeys.push({
        id: doc.id,
        key: data.key,
        folderId: data.folderId,
        userId: data.userId,
        folderName: data.folderName,
        description: data.description,
        createdAt: data.createdAt.toDate(),
        lastUsed: data.lastUsed ? data.lastUsed.toDate() : undefined,
      })
    })

    return apiKeys
  } catch (error) {
    console.error("Fehler beim Abrufen der API-Schlüssel:", error)
    return []
  }
}

// Holt alle API-Schlüssel für einen bestimmten Ordner
export async function getFolderApiKeys(userId: string, folderId: string): Promise<ApiKey[]> {
  try {
    // Prüfen, ob der Benutzer authentifiziert ist
    if (!userId) {
      console.error("Benutzer ist nicht authentifiziert")
      return []
    }

    const apiKeysQuery = query(
      collection(db, "apiKeys"),
      where("userId", "==", userId),
      where("folderId", "==", folderId),
    )

    const querySnapshot = await getDocs(apiKeysQuery)
    const apiKeys: ApiKey[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      apiKeys.push({
        id: doc.id,
        key: data.key,
        folderId: data.folderId,
        userId: data.userId,
        folderName: data.folderName,
        description: data.description,
        createdAt: data.createdAt.toDate(),
        lastUsed: data.lastUsed ? data.lastUsed.toDate() : undefined,
      })
    })

    return apiKeys
  } catch (error) {
    console.error("Fehler beim Abrufen der API-Schlüssel:", error)
    return []
  }
}

// Löscht einen API-Schlüssel
export async function deleteApiKey(apiKeyId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "apiKeys", apiKeyId))
    return true
  } catch (error) {
    console.error("Fehler beim Löschen des API-Schlüssels:", error)
    return false
  }
}

// Validiert einen API-Schlüssel und gibt die zugehörigen Informationen zurück
export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; folderId?: string; userId?: string }> {
  try {
    const apiKeysQuery = query(collection(db, "apiKeys"), where("key", "==", apiKey))

    const querySnapshot = await getDocs(apiKeysQuery)

    if (querySnapshot.empty) {
      return { valid: false }
    }

    const apiKeyDoc = querySnapshot.docs[0]
    const apiKeyData = apiKeyDoc.data()

    // Aktualisiere lastUsed
    await updateDoc(doc(db, "apiKeys", apiKeyDoc.id), {
      lastUsed: new Date(),
    })

    return {
      valid: true,
      folderId: apiKeyData.folderId,
      userId: apiKeyData.userId,
    }
  } catch (error) {
    console.error("Fehler bei der Validierung des API-Schlüssels:", error)
    return { valid: false }
  }
}

