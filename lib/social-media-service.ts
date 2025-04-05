import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "./firebase"
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
  // Neue Optionen für Download und Link-Kopieren
  showDownloadButton: true,
  showCopyLinkButton: false,
  // Position der Leiste
  controlBarPosition: "attached", // "attached" oder "floating"
}

// Speichert die Social Media Einstellungen für einen Ordner
export async function saveSocialMediaSettings(folderId: string, settings: SocialMediaSettings) {
  try {
    console.log("[saveSocialMediaSettings] Saving settings for folder:", folderId, settings)
    const folderRef = doc(db, "folders", folderId)
    await updateDoc(folderRef, {
      socialMediaSettings: settings,
    })

    // Aktualisiere den Cache
    settingsCache[folderId] = {
      settings,
      timestamp: Date.now(),
    }

    console.log("[saveSocialMediaSettings] Settings saved successfully")
    return { success: true }
  } catch (error) {
    console.error("[saveSocialMediaSettings] Error saving settings:", error)
    return { success: false, error }
  }
}

// Lädt die Social Media Einstellungen für einen Ordner
export async function loadSocialMediaSettings(folderId: string): Promise<SocialMediaSettings> {
  try {
    console.log("[loadSocialMediaSettings] Loading settings for folder:", folderId)

    if (!folderId) {
      console.warn("[loadSocialMediaSettings] No folderId provided, returning defaults")
      return DEFAULT_SOCIAL_MEDIA_SETTINGS
    }

    // Prüfe, ob die Einstellungen im Cache sind und noch gültig
    const cachedData = settingsCache[folderId]
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log("[loadSocialMediaSettings] Using cached settings")
      return cachedData.settings
    }

    const folderRef = doc(db, "folders", folderId)
    const folderDoc = await getDoc(folderRef)

    if (!folderDoc.exists()) {
      console.warn("[loadSocialMediaSettings] Folder document does not exist, returning defaults")
      return DEFAULT_SOCIAL_MEDIA_SETTINGS
    }

    const data = folderDoc.data()

    if (!data || !data.socialMediaSettings) {
      console.warn("[loadSocialMediaSettings] No socialMediaSettings in folder data, returning defaults")
      return DEFAULT_SOCIAL_MEDIA_SETTINGS
    }

    console.log("[loadSocialMediaSettings] Found settings:", data.socialMediaSettings)

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
    console.error("[loadSocialMediaSettings] Error loading settings:", error)
    return DEFAULT_SOCIAL_MEDIA_SETTINGS
  }
}

// Generiert Share-URLs für verschiedene Social-Media-Plattformen
export function generateSocialMediaShareUrl(
  platform: string,
  url: string,
  title?: string,
  description?: string,
  imageUrl?: string,
): string {
  console.log(`[generateSocialMediaShareUrl] Generating URL for ${platform}:`, { url, title, description })

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = title ? encodeURIComponent(title) : ""
  const encodedDescription = description ? encodeURIComponent(description) : ""

  let shareUrl = ""

  switch (platform.toLowerCase()) {
    case "facebook":
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
      break
    case "twitter":
    case "x":
      shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
      break
    case "whatsapp":
      shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
      break
    case "instagram":
      // Instagram hat keine direkte Share-URL, aber wir können den Link in die Zwischenablage kopieren
      shareUrl = url
      break
    default:
      shareUrl = url
  }

  console.log(`[generateSocialMediaShareUrl] Generated URL for ${platform}:`, shareUrl)
  return shareUrl
}

