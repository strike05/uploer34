"use server"

import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { SocialMediaSettings } from "@/types"

// Cache für die Social Media Einstellungen
const settingsCache: Record<
  string,
  {
    settings: SocialMediaSettings
    timestamp: number
  }
> = {}

// Cache-Gültigkeitsdauer in Millisekunden (5 Minuten)
const CACHE_DURATION = 5 * 60 * 1000

// Standardeinstellungen für Social Media Sharing
export const DEFAULT_SOCIAL_MEDIA_SETTINGS: SocialMediaSettings = {
  instagramEnabled: true,
  facebookEnabled: true,
  twitterEnabled: true,
  whatsappEnabled: true,
  customButtonEnabled: false,
  customButtonLabel: "",
  customButtonUrl: "",
  showDownloadButton: true,
  showCopyLinkButton: false, // Geändert: Standardmäßig deaktiviert
  controlBarPosition: "attached",
}

// Lädt die Social Media Einstellungen für einen Ordner
export async function getSocialMediaSettings(folderId: string): Promise<SocialMediaSettings> {
  try {
    if (!folderId) {
      console.warn("[getSocialMediaSettings] No folderId provided, returning defaults")
      return DEFAULT_SOCIAL_MEDIA_SETTINGS
    }

    // Prüfe, ob die Einstellungen im Cache sind und noch gültig
    const cachedData = settingsCache[folderId]
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log("[getSocialMediaSettings] Using cached settings")
      return cachedData.settings
    }

    const folderRef = doc(db, "folders", folderId)
    const folderDoc = await getDoc(folderRef)

    if (!folderDoc.exists()) {
      console.warn("[getSocialMediaSettings] Folder document does not exist, returning defaults")
      return DEFAULT_SOCIAL_MEDIA_SETTINGS
    }

    const data = folderDoc.data()

    if (!data || !data.socialMediaSettings) {
      console.warn("[getSocialMediaSettings] No socialMediaSettings in folder data, returning defaults")
      return DEFAULT_SOCIAL_MEDIA_SETTINGS
    }

    console.log("[getSocialMediaSettings] Found settings:", data.socialMediaSettings)

    // Stelle sicher, dass alle erforderlichen Felder vorhanden sind
    const settings = {
      ...DEFAULT_SOCIAL_MEDIA_SETTINGS,
      ...data.socialMediaSettings,
    }

    // Speichere die Einstellungen im Cache
    settingsCache[folderId] = {
      settings,
      timestamp: Date.now(),
    }

    return settings
  } catch (error) {
    console.error("[getSocialMediaSettings] Error loading settings:", error)
    return DEFAULT_SOCIAL_MEDIA_SETTINGS
  }
}

