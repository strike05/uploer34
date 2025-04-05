"use client"

import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import {
  saveSocialMediaSettings,
  loadSocialMediaSettings,
  DEFAULT_SOCIAL_MEDIA_SETTINGS,
} from "@/lib/social-media-service"
import type { Folder, SocialMediaSettings } from "@/types"

export function useFolderSettings(selectedFolder: Folder | null) {
  // Dialog-States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState("general")

  // Formular-States
  const [folderName, setFolderName] = useState("")
  const [folderColor, setFolderColor] = useState("gray")
  const [deletionDate, setDeletionDate] = useState("")
  const [deletionTime, setDeletionTime] = useState("")
  const [shareLink, setShareLink] = useState("")
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  // Social Media Sharing Einstellungen
  const [instagramEnabled, setInstagramEnabled] = useState(DEFAULT_SOCIAL_MEDIA_SETTINGS.instagramEnabled)
  const [facebookEnabled, setFacebookEnabled] = useState(DEFAULT_SOCIAL_MEDIA_SETTINGS.facebookEnabled)
  const [twitterEnabled, setTwitterEnabled] = useState(DEFAULT_SOCIAL_MEDIA_SETTINGS.twitterEnabled)
  const [whatsappEnabled, setWhatsappEnabled] = useState(DEFAULT_SOCIAL_MEDIA_SETTINGS.whatsappEnabled)
  const [customButtonEnabled, setCustomButtonEnabled] = useState(DEFAULT_SOCIAL_MEDIA_SETTINGS.customButtonEnabled)
  const [customButtonLabel, setCustomButtonLabel] = useState(DEFAULT_SOCIAL_MEDIA_SETTINGS.customButtonLabel)
  const [customButtonUrl, setCustomButtonUrl] = useState(DEFAULT_SOCIAL_MEDIA_SETTINGS.customButtonUrl)
  // Neue Einstellungen
  const [socialMediaSettings, setSocialMediaSettings] = useState<SocialMediaSettings>(DEFAULT_SOCIAL_MEDIA_SETTINGS)

  // Lade Social Media Einstellungen, wenn sich der ausgewählte Ordner ändert
  useEffect(() => {
    if (selectedFolder?.id) {
      const loadSettings = async () => {
        try {
          const settings = await loadSocialMediaSettings(selectedFolder.id)

          // Setze die Werte aus den geladenen Einstellungen
          setInstagramEnabled(settings.instagramEnabled)
          setFacebookEnabled(settings.facebookEnabled)
          setTwitterEnabled(settings.twitterEnabled)
          setWhatsappEnabled(settings.whatsappEnabled)
          setCustomButtonEnabled(settings.customButtonEnabled)
          setCustomButtonLabel(settings.customButtonLabel)
          setCustomButtonUrl(settings.customButtonUrl)
        } catch (error) {
          console.error("Fehler beim Laden der Social Media Einstellungen:", error)
        }
      }

      loadSettings()
    }
  }, [selectedFolder])

  // Initialisiere Formularwerte, wenn der Dialog geöffnet wird oder sich der ausgewählte Ordner ändert
  useEffect(() => {
    if (selectedFolder) {
      setFolderName(selectedFolder.name)
      // Hier würden wir normalerweise die gespeicherte Farbe laden
      setFolderColor("gray")
    }
  }, [selectedFolder, isSettingsOpen])

  // Handler-Funktionen
  const handleSaveSettings = async () => {
    if (!selectedFolder?.id) return

    try {
      // Speichere die Social Media Einstellungen
      const socialMediaSettings: SocialMediaSettings = {
        instagramEnabled,
        facebookEnabled,
        twitterEnabled,
        whatsappEnabled,
        customButtonEnabled,
        customButtonLabel,
        customButtonUrl,
      }

      await saveSocialMediaSettings(selectedFolder.id, socialMediaSettings)

      // Hier würde die Logik zum Speichern der anderen Einstellungen implementiert werden
      console.log("Speichere Einstellungen:", {
        name: folderName,
        color: folderColor,
        deletionDate,
        deletionTime,
        socialMediaSettings,
      })

      // Erfolgsmeldung anzeigen
      toast({
        title: "Einstellungen gespeichert",
        description: `Die Einstellungen für den Ordner "${folderName}" wurden gespeichert.`,
      })

      // Dialog schließen
      setIsSettingsOpen(false)
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error)
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateShareLink = () => {
    setIsGeneratingLink(true)

    // Simuliere API-Aufruf
    setTimeout(() => {
      const generatedLink = `https://example.com/share/${selectedFolder?.id}/${Math.random().toString(36).substring(2, 10)}`
      setShareLink(generatedLink)
      setIsGeneratingLink(false)
    }, 1000)
  }

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast({
      title: "Link kopiert",
      description: "Der Share-Link wurde in die Zwischenablage kopiert.",
    })
  }

  const handleExportFolder = () => {
    setIsExporting(true)

    // Simuliere Export-Prozess
    setTimeout(() => {
      setIsExporting(false)
      toast({
        title: "Export abgeschlossen",
        description: "Der Ordner wurde erfolgreich exportiert und kann heruntergeladen werden.",
      })
    }, 2000)
  }

  const handleDuplicateFolder = () => {
    setIsDuplicating(true)

    // Simuliere Duplizieren-Prozess
    setTimeout(() => {
      setIsDuplicating(false)
      toast({
        title: "Ordner dupliziert",
        description: `Eine Kopie von "${folderName}" wurde erstellt.`,
      })
      setIsSettingsOpen(false)
    }, 1500)
  }

  return {
    isSettingsOpen,
    setIsSettingsOpen,
    settingsTab,
    setSettingsTab,
    folderName,
    setFolderName,
    folderColor,
    setFolderColor,
    deletionDate,
    setDeletionDate,
    deletionTime,
    setDeletionTime,
    shareLink,
    setShareLink,
    isGeneratingLink,
    isExporting,
    isDuplicating,
    handleSaveSettings,
    handleGenerateShareLink,
    handleCopyShareLink,
    handleExportFolder,
    handleDuplicateFolder,
    // Social Media Sharing
    instagramEnabled,
    setInstagramEnabled,
    facebookEnabled,
    setFacebookEnabled,
    twitterEnabled,
    setTwitterEnabled,
    whatsappEnabled,
    setWhatsappEnabled,
    customButtonEnabled,
    setCustomButtonEnabled,
    customButtonLabel,
    setCustomButtonLabel,
    customButtonUrl,
    setCustomButtonUrl,
    // Neue Werte für die erweiterten Einstellungen
    socialMediaSettings,
    setSocialMediaSettings,
  }
}

