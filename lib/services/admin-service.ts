import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
  deleteDoc,
  setDoc,
  addDoc, // Import addDoc
} from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { isAdminEmail } from "@/lib/utils/admin-check"
import type { AdminUser, SystemStats, AdminActionLog } from "@/types"

/**
 * Holt alle Benutzer aus der Firestore-Datenbank
 */
export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const usersCollection = collection(db, "users")
    const usersSnapshot = await getDocs(usersCollection)

    const usersList: AdminUser[] = []

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()

      usersList.push({
        id: userDoc.id,
        email: userData.email || "",
        displayName: userData.displayName || "",
        disabled: userData.disabled || false,
        isAdmin: isAdminEmail(userData.email),
        lastLogin: userData.lastLogin ? userData.lastLogin.toDate() : undefined,
        createdAt: userData.createdAt ? userData.createdAt.toDate() : undefined,
        storageUsed: userData.storageUsed || 0,
        plan: userData.plan || "free",
      })
    }

    return usersList
  } catch (error) {
    console.error("Fehler beim Abrufen der Benutzer:", error)
    throw error
  }
}

/**
 * Aktualisiert den Status eines Benutzers (aktivieren/deaktivieren)
 */
export async function updateUserStatus(userId: string, disabled: boolean): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      disabled,
      updatedAt: Timestamp.now(),
      updatedBy: auth.currentUser?.uid || "system",
    })

    // Protokolliere die Aktion
    await logAdminAction("updateUserStatus", {
      userId,
      disabled,
      adminId: auth.currentUser?.uid || "unknown",
    })
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Benutzerstatus:", error)
    throw error
  }
}

/**
 * Löscht einen Benutzer
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)

    // Hier würde in einer vollständigen Implementierung auch die Löschung im Firebase Auth
    // und die Löschung aller zugehörigen Daten stattfinden

    await deleteDoc(userRef)

    // Protokolliere die Aktion
    await logAdminAction("deleteUser", {
      userId,
      adminId: auth.currentUser?.uid || "unknown",
    })
  } catch (error) {
    console.error("Fehler beim Löschen des Benutzers:", error)
    throw error
  }
}

/**
 * Ändert den Plan eines Benutzers
 */
export async function updateUserPlan(userId: string, plan: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      plan,
      updatedAt: Timestamp.now(),
      updatedBy: auth.currentUser?.uid || "system",
    })

    // Protokolliere die Aktion
    await logAdminAction("updateUserPlan", {
      userId,
      plan,
      adminId: auth.currentUser?.uid || "unknown",
    })
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Benutzerplans:", error)
    throw error
  }
}

/**
 * Sendet eine Passwort-Zurücksetzen-E-Mail an einen Benutzer
 * In einer vollständigen Firebase-Anwendung würde dies die Firebase Admin SDK verwenden
 * oder ein Cloud Function, die auf den Auth-Dienst zugreift.
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    // In der realen Implementierung würde hier die Firebase-Funktion zum Passwort-Zurücksetzen aufgerufen werden
    // import { getAuth, sendPasswordResetEmail } from "firebase/auth";
    // const auth = getAuth();
    // await sendPasswordResetEmail(auth, email);
    
    // Simulierte Implementierung, die eine Logmeldung erzeugt
    await logAdminAction("sendPasswordResetEmail", {
      email,
      adminId: auth.currentUser?.uid || "unknown",
      adminEmail: auth.currentUser?.email || "unknown",
    })
    
    console.log(`Password reset email would be sent to ${email}`)
    
    // In einer vollständigen Anwendung würde hier der tatsächliche Aufruf stehen:
    // await sendPasswordResetEmail(auth, email)
    
  } catch (error) {
    console.error("Fehler beim Senden der Passwort-Zurücksetzen-E-Mail:", error)
    throw error
  }
}

/**
 * Holt Systemstatistiken
 */
export async function getSystemStats(): Promise<SystemStats> {
  try {
    // Anzahl der Benutzer
    const usersCollection = collection(db, "users")
    const usersSnapshot = await getDocs(usersCollection)
    const totalUsers = usersSnapshot.size

    // Anzahl der aktiven Benutzer (eingeloggt in den letzten 30 Tagen)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    let activeUsers = 0
    usersSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.lastLogin && data.lastLogin.toDate() > thirtyDaysAgo) {
        activeUsers++
      }
    })

    // Anzahl der Ordner
    const foldersCollection = collection(db, "folders")
    const foldersSnapshot = await getDocs(foldersCollection)
    const totalFolders = foldersSnapshot.size

    // Anzahl der Dateien und Gesamtspeicher
    const filesCollection = collection(db, "files")
    const filesSnapshot = await getDocs(filesCollection)
    const totalFiles = filesSnapshot.size

    let totalStorage = 0
    filesSnapshot.forEach((doc) => {
      const data = doc.data()
      totalStorage += data.size || 0
    })

    // Anzahl der Galerien
    const galleriesCollection = collection(db, "galleries")
    const galleriesSnapshot = await getDocs(galleriesCollection)
    const totalGalleries = galleriesSnapshot.size

    return {
      totalUsers,
      activeUsers,
      totalFiles,
      totalFolders,
      totalGalleries,
      totalStorage,
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Systemstatistiken:", error)
    throw error
  }
}

/**
 * Protokolliert eine Admin-Aktion
 */
export async function logAdminAction(action: string, details: any): Promise<void> {
  try {
    await addDoc(collection(db, "adminLogs"), {
      action,
      details,
      timestamp: Timestamp.now(),
      adminId: auth.currentUser?.uid || "unknown",
      adminEmail: auth.currentUser?.email || "unknown",
    })
  } catch (error) {
    console.error("Fehler beim Protokollieren der Admin-Aktion:", error)
    // Hier werfen wir keinen Fehler, da das Logging fehlschlagen darf,
    // ohne die Hauptfunktionalität zu beeinträchtigen
  }
}

/**
 * Holt die Admin-Logs für Auditing
 */
export async function getAdminLogs(limit = 100): Promise<AdminActionLog[]> {
  try {
    const logsQuery = query(collection(db, "adminLogs"), orderBy("timestamp", "desc"), limit(limit))

    const logsSnapshot = await getDocs(logsQuery)
    const logs: AdminActionLog[] = []

    logsSnapshot.forEach((doc) => {
      const data = doc.data()
      logs.push({
        id: doc.id,
        action: data.action,
        details: data.details,
        timestamp: data.timestamp.toDate(),
        adminId: data.adminId,
        adminEmail: data.adminEmail,
      })
    })

    return logs
  } catch (error) {
    console.error("Fehler beim Abrufen der Admin-Logs:", error)
    throw error
  }
}

/**
 * Holt eine Liste von Dateien mit Problemen (fehlende Metadaten, fehlerhafte Links, etc.)
 */
export async function getProblematicFiles(limit = 50): Promise<any[]> {
  try {
    const filesCollection = collection(db, "files")
    const filesSnapshot = await getDocs(filesCollection)

    const problematicFiles: any[] = []

    filesSnapshot.forEach((doc) => {
      const data = doc.data()
      // Kriterien für problematische Dateien
      if (!data.url || !data.name || !data.folderId || !data.userId || data.size === 0 || 
          (data.storageUrl && !data.directUrl) || (!data.storageUrl && data.url)) {
        problematicFiles.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          issue: !data.url
            ? "Fehlende URL"
            : !data.name
              ? "Fehlender Name"
              : !data.folderId
                ? "Fehlende Ordner-ID"
                : !data.userId
                  ? "Fehlende Benutzer-ID"
                  : data.size === 0
                    ? "Größe ist 0"
                    : (data.storageUrl && !data.directUrl)
                      ? "Fehlende direkte URL"
                      : (!data.storageUrl && data.url)
                        ? "Fehlender Storage-Pfad"
                        : "Unbekanntes Problem",
        })
      }
    })

    return problematicFiles.slice(0, limit)
  } catch (error) {
    console.error("Fehler beim Abrufen problematischer Dateien:", error)
    throw error
  }
}

/**
 * Repariert eine problematische Datei
 */
export async function repairFile(fileId: string): Promise<void> {
  try {
    const fileRef = doc(db, "files", fileId)
    const fileDoc = await getDoc(fileRef)
    
    if (!fileDoc.exists()) {
      throw new Error("Datei nicht gefunden")
    }
    
    const fileData = fileDoc.data()
    const updates: Record<string, any> = {
      repairedAt: Timestamp.now(),
      repairedBy: auth.currentUser?.uid || "system"
    }
    
    // Identifiziere und repariere fehlende Felder
    if (!fileData.directUrl && fileData.folderId && fileData.name) {
      // Import the FILE_CONFIG to generate direct URL
      const { FILE_CONFIG } = await import("@/config/file")
      updates.directUrl = FILE_CONFIG.directFileUrlPattern(fileData.folderId, fileData.name)
    }
    
    if (!fileData.storagePath && fileData.userId && fileData.folderId && fileData.name) {
      updates.storagePath = `users/${fileData.userId}/${fileData.folderId}/${fileData.name}`
    }
    
    if (!fileData.createdAt) {
      updates.createdAt = Timestamp.now()
    }
    
    // Aktualisiere das Dokument
    await updateDoc(fileRef, updates)
    
    // Protokolliere die Aktion
    await logAdminAction("repairFile", {
      fileId,
      updates,
      adminId: auth.currentUser?.uid || "unknown"
    })
  } catch (error) {
    console.error("Fehler beim Reparieren der Datei:", error)
    throw error
  }
}

/**
 * Löscht eine problematische Datei vollständig (aus Firestore und Storage)
 */
export async function adminDeleteFile(fileId: string): Promise<void> {
  try {
    const fileRef = doc(db, "files", fileId)
    const fileDoc = await getDoc(fileRef)
    
    if (!fileDoc.exists()) {
      throw new Error("Datei nicht gefunden")
    }
    
    const fileData = fileDoc.data()
    
    // 1. Versuche, die Datei aus dem Storage zu löschen, falls ein Pfad vorhanden ist
    if (fileData.storagePath) {
      try {
        const storageRef = ref(storage, fileData.storagePath)
        await deleteObject(storageRef)
      } catch (storageError) {
        console.warn("Konnte Datei nicht aus Storage löschen:", storageError)
        // Wir fahren trotzdem fort, da wir den Firestore-Eintrag entfernen wollen
      }
    }
    
    // 2. Datei aus Firestore löschen
    await deleteDoc(fileRef)
    
    // 3. Aktion in AdminLogs protokollieren
    await logAdminAction("deleteFile", {
      fileId,
      fileName: fileData.name,
      storagePath: fileData.storagePath,
      adminId: auth.currentUser?.uid || "unknown",
      adminEmail: auth.currentUser?.email || "unknown"
    })
    
  } catch (error) {
    console.error("Fehler beim administrativen Löschen der Datei:", error)
    throw error
  }
}

/**
 * Aktualisiert die Systemeinstellungen
 */
export async function updateSystemSettings(settings: any): Promise<void> {
  try {
    const settingsRef = doc(db, "systemSettings", "general")

    // Prüfen, ob das Dokument existiert
    const settingsDoc = await getDoc(settingsRef)

    if (settingsDoc.exists()) {
      // Aktualisiere das bestehende Dokument
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: Timestamp.now(),
        updatedBy: auth.currentUser?.uid || "system",
      })
    } else {
      // Erstelle ein neues Dokument
      await setDoc(settingsRef, {
        ...settings,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: auth.currentUser?.uid || "system",
        updatedBy: auth.currentUser?.uid || "system",
      })
    }

    // Protokolliere die Aktion
    await logAdminAction("updateSystemSettings", {
      settings,
      adminId: auth.currentUser?.uid || "unknown",
    })
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Systemeinstellungen:", error)
    throw error
  }
}

/**
 * Holt die Systemeinstellungen
 */
export async function getSystemSettings(): Promise<any> {
  try {
    const settingsRef = doc(db, "systemSettings", "general")
    const settingsDoc = await getDoc(settingsRef)

    if (settingsDoc.exists()) {
      return settingsDoc.data()
    } else {
      return {
        // Standardeinstellungen
        maxUploadSize: 100 * 1024 * 1024, // 100 MB
        allowedFileTypes: "*",
        defaultUserPlan: "free",
        maintenanceMode: false,
        registrationEnabled: true,
      }
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Systemeinstellungen:", error)
    throw error
  }
}

