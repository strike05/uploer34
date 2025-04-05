// Stelle sicher, dass die Konfiguration korrekt ist
// Zentrale Konfigurationsdatei für die Anwendung

// Basis-URL der Anwendung
const APP_URL = "https://v0-uploader34.vercel.app"

// API-Basis-URL
export const API_URL = `${APP_URL}/api`

// Konfiguration für Dateien und Uploads
export const FILE_CONFIG = {
  // Maximale Dateigröße in Bytes (Standard: 100MB)
  maxFileSize: 100 * 1024 * 1024,
  // Erlaubte Dateitypen (leer = alle erlaubt)
  allowedFileTypes: [],
  // Direkte Datei-URL-Struktur (ohne URL-Encoding für bessere Lesbarkeit)
  directFileUrlPattern: (folderId: string, fileName: string) => `${APP_URL}/${folderId}/${fileName}`,
}

// Konfiguration für Galerien
export const GALLERY_CONFIG = {
  // Share-Link-Struktur (immer /s/ verwenden)
  shareUrlPattern: (shareId: string) => `${APP_URL}/s/${shareId}`,
  // Standard Social Media Einstellungen für neue Galerien
  defaultSocialMediaSettings: {
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
}

// Konfiguration für Benutzer
export const USER_CONFIG = {
  // Standard-Speicherplatz für neue Benutzer (in Bytes, 1GB)
  defaultStorageQuota: 1024 * 1024 * 1024,
}

// Konfiguration für Abonnements
export const SUBSCRIPTION_CONFIG = {
  plans: {
    free: {
      name: "Kostenlos",
      storageQuota: 1024 * 1024 * 1024, // 1GB
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxApiKeys: 5,
    },
    premium: {
      name: "Premium",
      storageQuota: 50 * 1024 * 1024 * 1024, // 50GB
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      maxApiKeys: Number.POSITIVE_INFINITY,
    },
    business: {
      name: "Business",
      storageQuota: 500 * 1024 * 1024 * 1024, // 500GB
      maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
      maxApiKeys: Number.POSITIVE_INFINITY,
    },
  },
}
