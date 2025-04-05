import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  getDoc,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type {
  Gallery,
  Folder,
  GalleryColorScheme,
  GalleryFont,
  GalleryLayout,
  WatermarkPosition,
  GalleryStatistics,
  GalleryComment,
  ShareLinkAccess,
  ShareLinkStats,
} from "@/types"
import { handleFirebaseError } from "@/lib/utils/error-handler"
import { generateUniqueId } from "@/lib/utils/id-generator"

// Korrigiere die createGalleryFromFolder-Funktion, um sicherzustellen, dass die Links korrekt generiert werden
export async function createGalleryFromFolder(
  userId: string,
  folder: Folder,
  options: CreateGalleryOptions,
): Promise<{ success: boolean; gallery?: Gallery; error?: string }> {
  try {
    if (!userId) {
      throw new Error("Benutzer ist nicht authentifiziert")
    }

    // Generiere eine eindeutige ID für den Share-Link
    const userPrefix = userId.substring(0, 4)
    const shareId = generateUniqueId(12, userPrefix)

    // Hardcoded APP_URL
    const appUrl = "https://v0-uploader34.vercel.app"
    // Verwende immer /s/ für Share-Links
    const shareLink = `${appUrl}/s/${shareId}`

    console.log("Erstelle Galerie mit Share-Link:", shareLink, "und Share-ID:", shareId)

    // Verwende die Standard-Social-Media-Einstellungen aus der Konfiguration
    const defaultSettings = {
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
    }

    // Erstelle einen Eintrag in Firestore
    const galleryRef = await addDoc(collection(db, "galleries"), {
      name: options.name,
      folderId: folder.id,
      folderName: folder.name,
      userId,
      createdAt: serverTimestamp(),
      expiresAt: options.expiresAt || null,
      isPublic: options.isPublic !== undefined ? options.isPublic : true,
      views: 0,
      shareLink,
      shareId,
      // Share-Link-Funktionalität mit Standardeinstellungen
      shareEnabled: true,
      shareExpiresAt: options.shareExpiresAt || null,
      sharePassword: options.sharePassword || null,
      shareAccess: options.shareAccess || "public",
      // Social Media Einstellungen
      socialMediaSettings: {
        ...defaultSettings,
        ...options.socialMediaSettings,
      },
      // Andere Felder mit Standardwerten
      password: options.password || null,
      headerImage: options.headerImage || null,
      colorScheme: options.colorScheme || {
        primary: "#000000",
        secondary: "#4f46e5",
        background: "#ffffff",
        text: "#000000",
      },
      font: options.font || "default",
      layout: options.layout || "grid",
      darkMode: options.darkMode || false,
      allowDownload: options.allowDownload !== undefined ? options.allowDownload : true,
      allowComments: options.allowComments || false,
      watermarkEnabled: options.watermarkEnabled || false,
      watermarkText: options.watermarkText || "",
      watermarkPosition: options.watermarkPosition || "bottomRight",
    })

    // Erstelle einen Eintrag für Share-Link-Statistiken
    await addDoc(collection(db, "shareLinkStats"), {
      galleryId: galleryRef.id,
      shareId,
      createdAt: serverTimestamp(),
      totalClicks: 0,
      uniqueVisitors: 0,
      lastAccessed: null,
      referrers: {},
    })

    const gallery: Gallery = {
      id: galleryRef.id,
      name: options.name,
      folderId: folder.id,
      folderName: folder.name,
      userId,
      createdAt: new Date(),
      expiresAt: options.expiresAt || null,
      isPublic: options.isPublic !== undefined ? options.isPublic : true,
      views: 0,
      shareLink,
      shareId,
      // Neue Felder für Share-Link-Funktionalität
      shareEnabled: true,
      shareExpiresAt: options.shareExpiresAt || null,
      sharePassword: options.sharePassword || null,
      shareAccess: options.shareAccess || "public",
      // Andere Felder
      password: options.password || null,
      headerImage: options.headerImage || null,
      colorScheme: options.colorScheme || {
        primary: "#000000",
        secondary: "#4f46e5",
        background: "#ffffff",
        text: "#000000",
      },
      font: options.font || "default",
      layout: options.layout || "grid",
      darkMode: options.darkMode || false,
      allowDownload: options.allowDownload !== undefined ? options.allowDownload : true,
      allowComments: options.allowComments || false,
      watermarkEnabled: options.watermarkEnabled || false,
      watermarkText: options.watermarkText || "",
      watermarkPosition: options.watermarkPosition || "bottomRight",
    }

    return { success: true, gallery }
  } catch (error: any) {
    console.error("Fehler beim Erstellen der Galerie:", error)
    return { success: false, error: handleFirebaseError(error) }
  }
}

/**
 * Ruft alle Galerien eines Benutzers ab
 */
export async function getGalleriesByUser(userId: string): Promise<Gallery[]> {
  try {
    if (!userId) {
      console.error("Benutzer ist nicht authentifiziert")
      return []
    }

    const galleriesQuery = query(collection(db, "galleries"), where("userId", "==", userId))
    const querySnapshot = await getDocs(galleriesQuery)
    const galleries: Gallery[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      galleries.push({
        id: doc.id,
        name: data.name,
        folderId: data.folderId,
        folderName: data.folderName,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt: data.expiresAt ? data.expiresAt.toDate() : null,
        isPublic: data.isPublic,
        views: data.views,
        shareLink: data.shareLink,
        shareId: data.shareId,
        // Neue Felder für Share-Link-Funktionalität
        shareEnabled: data.shareEnabled !== undefined ? data.shareEnabled : true,
        shareExpiresAt: data.shareExpiresAt ? data.shareExpiresAt.toDate() : null,
        sharePassword: data.sharePassword || null,
        shareAccess: data.shareAccess || "public",
        // Andere Felder
        password: data.password || null,
        headerImage: data.headerImage || null,
        colorScheme: data.colorScheme || {
          primary: "#000000",
          secondary: "#4f46e5",
          background: "#ffffff",
          text: "#000000",
        },
        font: data.font || "default",
        layout: data.layout || "grid",
        darkMode: data.darkMode || false,
        allowDownload: data.allowDownload !== undefined ? data.allowDownload : true,
        allowComments: data.allowComments || false,
        watermarkEnabled: data.watermarkEnabled || false,
        watermarkText: data.watermarkText || "",
        watermarkPosition: data.watermarkPosition || "bottomRight",
      })
    })

    return galleries
  } catch (error: any) {
    console.error("Fehler beim Abrufen der Galerien:", error)
    return []
  }
}

// Füge diese Funktion zum Abrufen einer Galerie anhand ihrer ID hinzu
export async function getGalleryById(galleryId: string): Promise<Gallery | null> {
  try {
    const galleryRef = doc(db, "galleries", galleryId)
    const galleryDoc = await getDoc(galleryRef)

    if (!galleryDoc.exists()) {
      return null
    }

    const data = galleryDoc.data()
    return {
      id: galleryDoc.id,
      name: data.name,
      folderId: data.folderId,
      folderName: data.folderName,
      userId: data.userId,
      createdAt: data.createdAt?.toDate() || new Date(),
      expiresAt: data.expiresAt ? data.expiresAt.toDate() : null,
      isPublic: data.isPublic,
      views: data.views,
      shareLink: data.shareLink,
      shareId: data.shareId,
      // Neue Felder für Share-Link-Funktionalität
      shareEnabled: data.shareEnabled !== undefined ? data.shareEnabled : true,
      shareExpiresAt: data.shareExpiresAt ? data.shareExpiresAt.toDate() : null,
      sharePassword: data.sharePassword || null,
      shareAccess: data.shareAccess || "public",
      // Andere Felder
      password: data.password || null,
      headerImage: data.headerImage || null,
      colorScheme: data.colorScheme || {
        primary: "#000000",
        secondary: "#4f46e5",
        background: "#ffffff",
        text: "#000000",
      },
      font: data.font || "default",
      layout: data.layout || "grid",
      darkMode: data.darkMode || false,
      allowDownload: data.allowDownload !== undefined ? data.allowDownload : true,
      allowComments: data.allowComments || false,
      watermarkEnabled: data.watermarkEnabled || false,
      watermarkText: data.watermarkText || "",
      watermarkPosition: data.watermarkPosition || "bottomRight",
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Galerie:", error)
    return null
  }
}

/**
 * Ruft eine Galerie anhand ihrer Share-ID ab
 */
export async function getGalleryByShareId(shareId: string): Promise<Gallery | null> {
  try {
    console.log("Suche Galerie mit Share-ID:", shareId)

    if (!shareId) {
      console.error("Share-ID ist leer oder undefiniert")
      return null
    }

    const galleriesQuery = query(collection(db, "galleries"), where("shareId", "==", shareId))
    console.log("Abfrage erstellt, führe Abfrage aus...")

    const querySnapshot = await getDocs(galleriesQuery)
    console.log("Abfrage ausgeführt, Anzahl der Ergebnisse:", querySnapshot.size)

    if (querySnapshot.empty) {
      console.error("Keine Galerie mit Share-ID gefunden:", shareId)
      return null
    }

    const galleryDoc = querySnapshot.docs[0]
    const data = galleryDoc.data()

    console.log("Galerie gefunden:", galleryDoc.id)
    console.log("Galerie-Daten:", JSON.stringify(data, null, 2))

    // Prüfe, ob der Share-Link aktiviert ist
    if (data.shareEnabled === false) {
      console.error("Share-Link ist deaktiviert:", shareId)
      return null
    }

    // Prüfe, ob der Share-Link abgelaufen ist
    if (data.shareExpiresAt && data.shareExpiresAt.toDate() < new Date()) {
      console.error("Share-Link ist abgelaufen:", shareId)
      return null
    }

    return {
      id: galleryDoc.id,
      name: data.name,
      folderId: data.folderId,
      folderName: data.folderName,
      userId: data.userId,
      createdAt: data.createdAt?.toDate() || new Date(),
      expiresAt: data.expiresAt ? data.expiresAt.toDate() : null,
      isPublic: data.isPublic,
      views: data.views,
      shareLink: data.shareLink,
      shareId: data.shareId,
      // Neue Felder für Share-Link-Funktionalität
      shareEnabled: data.shareEnabled !== undefined ? data.shareEnabled : true,
      shareExpiresAt: data.shareExpiresAt ? data.shareExpiresAt.toDate() : null,
      sharePassword: data.sharePassword || null,
      shareAccess: data.shareAccess || "public",
      // Andere Felder
      password: data.password || null,
      headerImage: data.headerImage || null,
      colorScheme: data.colorScheme || {
        primary: "#000000",
        secondary: "#4f46e5",
        background: "#ffffff",
        text: "#000000",
      },
      font: data.font || "default",
      layout: data.layout || "grid",
      darkMode: data.darkMode || false,
      allowDownload: data.allowDownload !== undefined ? data.allowDownload : true,
      allowComments: data.allowComments || false,
      watermarkEnabled: data.watermarkEnabled || false,
      watermarkText: data.watermarkText || "",
      watermarkPosition: data.watermarkPosition || "bottomRight",
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Galerie:", error)
    throw error // Fehler weitergeben, damit er in der UI angezeigt werden kann
  }
}

/**
 * Überprüft, ob eine Galerie mit der angegebenen Share-ID existiert
 */
export async function checkGalleryExists(shareId: string): Promise<boolean> {
  try {
    console.log("Überprüfe, ob Galerie mit Share-ID existiert:", shareId)

    if (!shareId) {
      console.error("Share-ID ist leer oder undefiniert")
      return false
    }

    const galleriesQuery = query(collection(db, "galleries"), where("shareId", "==", shareId))
    const querySnapshot = await getDocs(galleriesQuery)

    const exists = !querySnapshot.empty
    console.log("Galerie existiert:", exists)

    return exists
  } catch (error) {
    console.error("Fehler beim Überprüfen der Galerie-Existenz:", error)
    return false
  }
}

/**
 * Löscht eine Galerie und alle zugehörigen Daten
 */
export async function deleteGallery(galleryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Hole die Galerie-Daten, um die Share-ID zu erhalten
    const galleryRef = doc(db, "galleries", galleryId)
    const galleryDoc = await getDoc(galleryRef)

    if (!galleryDoc.exists()) {
      throw new Error("Galerie nicht gefunden")
    }

    const galleryData = galleryDoc.data()
    const shareId = galleryData.shareId

    // Lösche die Galerie
    await deleteDoc(galleryRef)

    // Lösche die zugehörigen Share-Link-Statistiken
    if (shareId) {
      const statsQuery = query(collection(db, "shareLinkStats"), where("shareId", "==", shareId))
      const statsSnapshot = await getDocs(statsQuery)

      for (const doc of statsSnapshot.docs) {
        await deleteDoc(doc.ref)
      }
    }

    // Lösche die zugehörigen Kommentare
    const commentsQuery = query(collection(db, "galleryComments"), where("galleryId", "==", galleryId))
    const commentsSnapshot = await getDocs(commentsQuery)

    for (const doc of commentsSnapshot.docs) {
      await deleteDoc(doc.ref)
    }

    // Lösche die zugehörigen Statistiken
    const galleryStatsRef = doc(db, "galleryStatistics", galleryId)
    const galleryStatsDoc = await getDoc(galleryStatsRef)

    if (galleryStatsDoc.exists()) {
      await deleteDoc(galleryStatsRef)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Fehler beim Löschen der Galerie:", error)
    return { success: false, error: handleFirebaseError(error) }
  }
}

/**
 * Aktualisiert eine Galerie
 */
export async function updateGallery(
  galleryId: string,
  updates: Partial<Omit<Gallery, "id" | "userId" | "folderId" | "folderName" | "createdAt">>,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Konvertiere Date-Objekte in Firestore Timestamps
    const firestoreUpdates: any = { ...updates }

    if (updates.expiresAt) {
      firestoreUpdates.expiresAt = Timestamp.fromDate(updates.expiresAt)
    }

    if (updates.shareExpiresAt) {
      firestoreUpdates.shareExpiresAt = Timestamp.fromDate(updates.shareExpiresAt)
    }

    await updateDoc(doc(db, "galleries", galleryId), firestoreUpdates)
    return { success: true }
  } catch (error: any) {
    console.error("Fehler beim Aktualisieren der Galerie:", error)
    return { success: false, error: handleFirebaseError(error) }
  }
}

/**
 * Erhöht die Anzahl der Aufrufe einer Galerie
 */
export async function incrementGalleryViews(galleryId: string): Promise<void> {
  try {
    const galleryRef = doc(db, "galleries", galleryId)
    await updateDoc(galleryRef, {
      views: increment(1),
    })
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Galerieaufrufe:", error)
  }
}

// Korrigiere auch die regenerateShareLink-Funktion
export async function regenerateShareLink(
  galleryId: string,
  options?: {
    expiresAt?: Date
    password?: string | null
    access?: ShareLinkAccess
  },
): Promise<{ success: boolean; shareLink?: string; error?: string }> {
  try {
    // Hole die Galerie-Daten, um die Benutzer-ID zu erhalten
    const galleryRef = doc(db, "galleries", galleryId)
    const galleryDoc = await getDoc(galleryRef)

    if (!galleryDoc.exists()) {
      throw new Error("Galerie nicht gefunden")
    }

    const galleryData = galleryDoc.data()
    const userId = galleryData.userId

    // Generiere eine eindeutige ID für den Share-Link, die den Benutzer berücksichtigt
    const userPrefix = userId.substring(0, 4)
    const shareId = generateUniqueId(12, userPrefix)

    // Hardcoded APP_URL
    const appUrl = "https://v0-uploader34.vercel.app"
    // Korrigiere die URL-Struktur - verwende immer /s/ für Share-Links
    const shareLink = `${appUrl}/s/${shareId}`

    console.log("Regeneriere Share-Link:", shareLink, "und Share-ID:", shareId)

    const updates: any = {
      shareLink,
      shareId,
      shareEnabled: true,
    }

    // Füge optionale Parameter hinzu
    if (options?.expiresAt) {
      updates.shareExpiresAt = Timestamp.fromDate(options.expiresAt)
    }

    if (options?.password !== undefined) {
      updates.sharePassword = options.password
    }

    if (options?.access) {
      updates.shareAccess = options.access
    }

    // Aktualisiere die Galerie
    await updateDoc(galleryRef, updates)

    // Erstelle einen neuen Eintrag für Share-Link-Statistiken
    await addDoc(collection(db, "shareLinkStats"), {
      galleryId,
      shareId,
      createdAt: serverTimestamp(),
      totalClicks: 0,
      uniqueVisitors: 0,
      lastAccessed: null,
      referrers: {},
    })

    return { success: true, shareLink }
  } catch (error: any) {
    console.error("Fehler beim Generieren des Share-Links:", error)
    return { success: false, error: handleFirebaseError(error) }
  }
}

/**
 * Deaktiviert einen Share-Link
 */
export async function disableShareLink(galleryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "galleries", galleryId), {
      shareEnabled: false,
    })
    return { success: true }
  } catch (error: any) {
    console.error("Fehler beim Deaktivieren des Share-Links:", error)
    return { success: false, error: handleFirebaseError(error) }
  }
}

/**
 * Aktiviert einen Share-Link
 */
export async function enableShareLink(galleryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "galleries", galleryId), {
      shareEnabled: true,
    })
    return { success: true }
  } catch (error: any) {
    console.error("Fehler beim Aktivieren des Share-Links:", error)
    return { success: false, error: handleFirebaseError(error) }
  }
}

/**
 * Aktiviert mehrere Share-Links gleichzeitig
 */
export async function enableMultipleShareLinks(galleryIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const batch = writeBatch(db)

    galleryIds.forEach((id) => {
      const galleryRef = doc(db, "galleries", id)
      batch.update(galleryRef, { shareEnabled: true })
    })

    await batch.commit()
    return { success: true }
  } catch (error: any) {
    console.error("Fehler beim Aktivieren mehrerer Share-Links:", error)
    return { success: false, error: handleFirebaseError(error) }
  }
}

/**
 * Deaktiviert mehrere Share-Links gleichzeitig
 */
export async function disableMultipleShareLinks(galleryIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const batch = writeBatch(db)

    galleryIds.forEach((id) => {
      const galleryRef = doc(db, "galleries", id)
      batch.update(galleryRef, { shareEnabled: false })
    })

    await batch.commit()
    return { success: true }
  } catch (error: any) {
    console.error("Fehler beim Deaktivieren mehrerer Share-Links:", error)
    return { success: false, error: handleFirebaseError(error) }
  }
}

/**
 * Löscht mehrere Galerien gleichzeitig
 */
export async function deleteMultipleGalleries(galleryIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const batch = writeBatch(db)
    const shareIds: string[] = []

    // Sammle zuerst alle Share-IDs
    for (const galleryId of galleryIds) {
      const galleryRef = doc(db, "galleries", galleryId)
      const galleryDoc = await getDoc(galleryRef)

      if (galleryDoc.exists()) {
        const galleryData = galleryDoc.data()
        if (galleryData.shareId) {
          shareIds.push(galleryData.shareId)
        }

        // Lösche die Galerie
        batch.delete(galleryRef)
      }
    }

    // Lösche zugehörige Daten in einem Batch
    for (const shareId of shareIds) {
      // Lösche Share-Link-Statistiken
      const statsQuery = query(collection(db, "shareLinkStats"), where("shareId", "==", shareId))
      const statsSnapshot = await getDocs(statsQuery)

      statsSnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })
    }

    // Lösche Kommentare für alle Galerien
    for (const galleryId of galleryIds) {
      const commentsQuery = query(collection(db, "galleryComments"), where("galleryId", "==", galleryId))
      const commentsSnapshot = await getDocs(commentsQuery)

      commentsSnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })

      // Lösche Statistiken
      const galleryStatsRef = doc(db, "galleryStatistics", galleryId)
      const galleryStatsDoc = await getDoc(galleryStatsRef)

      if (galleryStatsDoc.exists()) {
        batch.delete(galleryStatsRef)
      }
    }

    await batch.commit()
    return { success: true }
  } catch (error: any) {
    console.error("Fehler beim Löschen mehrerer Galerien:", error)
    return { success: false, error: handleFirebaseError(error) }
  }
}

/**
 * Exportiert Galerie-Daten als JSON
 */
export function exportGalleryData(galleries: Gallery[]): string {
  try {
    // Entferne sensible Daten
    const sanitizedGalleries = galleries.map((gallery) => ({
      id: gallery.id,
      name: gallery.name,
      folderName: gallery.folderName,
      createdAt: gallery.createdAt.toISOString(),
      expiresAt: gallery.expiresAt ? gallery.expiresAt.toISOString() : null,
      isPublic: gallery.isPublic,
      views: gallery.views,
      shareEnabled: gallery.shareEnabled,
      shareExpiresAt: gallery.shareExpiresAt ? gallery.shareExpiresAt.toISOString() : null,
      layout: gallery.layout,
      darkMode: gallery.darkMode,
      allowDownload: gallery.allowDownload,
      allowComments: gallery.allowComments,
      watermarkEnabled: gallery.watermarkEnabled,
    }))

    return JSON.stringify(sanitizedGalleries, null, 2)
  } catch (error) {
    console.error("Fehler beim Exportieren der Galerie-Daten:", error)
    throw error
  }
}

/**
 * Aktualisiert die Share-Link-Statistiken
 */
export async function updateShareLinkStats(shareId: string, referrer?: string): Promise<void> {
  try {
    // Suche den Statistik-Eintrag für den Share-Link
    const statsQuery = query(collection(db, "shareLinkStats"), where("shareId", "==", shareId))
    const querySnapshot = await getDocs(statsQuery)

    if (querySnapshot.empty) {
      console.error("Keine Statistiken für den Share-Link gefunden")
      return
    }

    const statsDoc = querySnapshot.docs[0]
    const statsRef = doc(db, "shareLinkStats", statsDoc.id)

    // Aktualisiere die Statistiken
    const updates: any = {
      totalClicks: increment(1),
      lastAccessed: serverTimestamp(),
    }

    // Wenn ein Referrer angegeben ist, aktualisiere die Referrer-Statistiken
    if (referrer) {
      updates[`referrers.${referrer}`] = increment(1)
    }

    await updateDoc(statsRef, updates)
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Share-Link-Statistiken:", error)
  }
}

/**
 * Ruft die Statistiken für einen Share-Link ab
 */
export async function getShareLinkStats(shareId: string): Promise<ShareLinkStats | null> {
  try {
    const statsQuery = query(collection(db, "shareLinkStats"), where("shareId", "==", shareId))
    const querySnapshot = await getDocs(statsQuery)

    if (querySnapshot.empty) {
      return null
    }

    const statsDoc = querySnapshot.docs[0]
    const data = statsDoc.data()

    return {
      id: statsDoc.id,
      galleryId: data.galleryId,
      shareId: data.shareId,
      createdAt: data.createdAt?.toDate() || new Date(),
      totalClicks: data.totalClicks || 0,
      uniqueVisitors: data.uniqueVisitors || 0,
      lastAccessed: data.lastAccessed?.toDate() || null,
      referrers: data.referrers || {},
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Share-Link-Statistiken:", error)
    return null
  }
}

// Erweitere die CreateGalleryOptions-Schnittstelle
export interface CreateGalleryOptions {
  name: string
  isPublic?: boolean
  expiresAt?: Date | null
  // Neue Optionen für Share-Links
  shareExpiresAt?: Date | null
  sharePassword?: string | null
  shareAccess?: ShareLinkAccess
  // Social Media Einstellungen
  socialMediaSettings?: {
    instagramEnabled?: boolean
    facebookEnabled?: boolean
    twitterEnabled?: boolean
    whatsappEnabled?: boolean
    customButtonEnabled?: boolean
    customButtonLabel?: string
    customButtonUrl?: string
    showDownloadButton?: boolean
    showCopyLinkButton?: boolean
    controlBarPosition?: "attached" | "floating"
  }
  // Andere Optionen
  password?: string | null
  headerImage?: string | null
  colorScheme?: GalleryColorScheme
  font?: GalleryFont
  layout?: GalleryLayout
  darkMode?: boolean
  allowDownload?: boolean
  allowComments?: boolean
  watermarkEnabled?: boolean
  watermarkText?: string
  watermarkPosition?: WatermarkPosition
}

// Füge neue Funktionen für Galerie-Statistiken hinzu
export async function getGalleryStatistics(galleryId: string): Promise<GalleryStatistics | null> {
  try {
    const statsRef = doc(db, "galleryStatistics", galleryId)
    const statsDoc = await getDoc(statsRef)

    if (statsDoc.exists()) {
      const data = statsDoc.data()
      return {
        galleryId,
        totalViews: data.totalViews || 0,
        uniqueVisitors: data.uniqueVisitors || 0,
