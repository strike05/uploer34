"use client"
import { FolderTabsHeader } from "./folder-tabs-header"
import { FolderSettingsDialog } from "./folder-settings-dialog"
import { DirectSDKUpload } from "@/components/direct-sdk-upload"
import { FileList } from "@/components/file-list"
import { useFolderSettings } from "@/hooks/use-folder-settings"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { FolderTabsProps } from "@/types"

export function FolderTabs({
  activeTab,
  onTabChange,
  selectedFolder,
  userId,
  onFileUpload,
  refreshFiles,
}: FolderTabsProps) {
  const router = useRouter()
  // Hole die Einstellungen und Funktionen aus dem Custom Hook
  const {
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
    socialMediaSettings,
    setSocialMediaSettings,
  } = useFolderSettings(selectedFolder)

  if (!selectedFolder) {
    return (
      <div className="flex items-center justify-center h-40 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">Bitte wählen Sie einen Ordner aus</p>
      </div>
    )
  }

  // Handler-Funktionen
  const handleArchiveFolder = () => {
    // Simuliere Archivieren-Prozess
    toast({
      title: "Ordner archiviert",
      description: `Der Ordner "${selectedFolder.name}" wurde ins Archiv verschoben.`,
    })
  }

  const handleCreateGallery = () => {
    // Navigiere zur Galerie-Verwaltung und übergebe den Ordner als Parameter
    if (selectedFolder) {
      // In einer echten Implementierung würden wir zur Galerie-Verwaltung navigieren
      // router.push(`/dashboard/gallery?folderId=${selectedFolder.id}`);

      // Für jetzt zeigen wir nur einen Toast an
      toast({
        title: "Galerie-Verwaltung",
        description: `Die Galerie-Verwaltung für den Ordner "${selectedFolder.name}" wird geöffnet.`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <FolderTabsHeader
        selectedFolder={selectedFolder}
        onArchive={handleArchiveFolder}
        onCreateGallery={handleCreateGallery}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <DirectSDKUpload userId={userId} folderId={selectedFolder.id} onUploadComplete={onFileUpload} />

      <FileList userId={userId} folderId={selectedFolder.id} refreshTrigger={refreshFiles} />

      <FolderSettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        selectedFolder={selectedFolder}
        folderName={folderName}
        folderColor={folderColor}
        onSave={handleSaveSettings}
        settingsTab={settingsTab}
        setSettingsTab={setSettingsTab}
        deletionDate={deletionDate}
        setDeletionDate={setDeletionDate}
        deletionTime={deletionTime}
        setDeletionTime={setDeletionTime}
        shareLink={shareLink}
        isGeneratingLink={isGeneratingLink}
        handleGenerateShareLink={handleGenerateShareLink}
        handleCopyShareLink={handleCopyShareLink}
        isExporting={isExporting}
        handleExportFolder={handleExportFolder}
        isDuplicating={isDuplicating}
        handleDuplicateFolder={handleDuplicateFolder}
        setFolderName={setFolderName}
        setFolderColor={setFolderColor}
        // Social Media Sharing
        instagramEnabled={instagramEnabled}
        setInstagramEnabled={setInstagramEnabled}
        facebookEnabled={facebookEnabled}
        setFacebookEnabled={setFacebookEnabled}
        twitterEnabled={twitterEnabled}
        setTwitterEnabled={setTwitterEnabled}
        whatsappEnabled={whatsappEnabled}
        setWhatsappEnabled={setWhatsappEnabled}
        customButtonEnabled={customButtonEnabled}
        setCustomButtonEnabled={setCustomButtonEnabled}
        customButtonLabel={customButtonLabel}
        setCustomButtonLabel={setCustomButtonLabel}
        customButtonUrl={customButtonUrl}
        setCustomButtonUrl={setCustomButtonUrl}
        // Neue Props
        socialMediaSettings={socialMediaSettings}
        setSocialMediaSettings={setSocialMediaSettings}
      />
    </div>
  )
}

