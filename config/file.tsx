export const FILE_CONFIG = {
  directFileUrlPattern: (folderId: string, fileName: string) => {
    // Stelle sicher, dass die URL korrekt formatiert ist
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || ""
      
    // Verwende api/direct/ Route für Datei-Zugriff
    return `${baseUrl}/api/direct/${folderId}/${encodeURIComponent(fileName)}`
  },

  // Standardeinstellungen für neue Ordner
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

