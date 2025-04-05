// Zentrale Typdefinitionen für das gesamte Projekt
export interface User {
  id: string
  email: string
  displayName?: string
}

export interface Folder {
  id: string
  name: string
  userId: string
  createdAt: Date
  isRoot?: boolean
  // Neue Felder für Social Media Sharing
  socialMediaSettings?: SocialMediaSettings
}

// Neue Schnittstelle für Social Media Sharing Einstellungen
export interface SocialMediaSettings {
  instagramEnabled: boolean
  facebookEnabled: boolean
  twitterEnabled: boolean
  whatsappEnabled: boolean
  customButtonEnabled: boolean
  customButtonLabel: string
  customButtonUrl: string
  // Neue Optionen für Download und Link-Kopieren
  showDownloadButton?: boolean
  showCopyLinkButton?: boolean
  // Position der Leiste
  controlBarPosition?: "attached" | "floating"
}

export interface FileItem {
  id: string
  name: string
  folderId: string
  userId: string
  url: string
  type: string
  size: number
  createdAt: Date
}

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

// Erweitere den Gallery-Typ um die neuen Funktionen
export interface Gallery {
  id: string
  name: string
  folderId: string
  folderName: string
  userId: string
  createdAt: Date
  expiresAt: Date | null
  isPublic: boolean
  views: number
  shareLink: string
  shareId: string
  // Neue Felder für Share-Link-Funktionalität
  shareEnabled: boolean
  shareExpiresAt: Date | null
  sharePassword: string | null
  shareAccess: ShareLinkAccess
  // Andere Felder
  password?: string
  headerImage?: string
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

// Neue Typen für die Galerie-Einstellungen
export type GalleryLayout = "grid" | "masonry" | "carousel" | "slideshow"
export type GalleryFont = "default" | "serif" | "sans-serif" | "monospace" | "handwriting"
export type WatermarkPosition = "center" | "bottomRight" | "bottomLeft" | "topRight" | "topLeft"
export type ShareLinkAccess = "public" | "restricted" | "private"

export interface GalleryColorScheme {
  primary: string
  secondary: string
  background: string
  text: string
}

// Typ für Galerie-Kommentare
export interface GalleryComment {
  id: string
  galleryId: string
  fileId: string
  author: string
  content: string
  createdAt: Date
}

// Typ für Galerie-Statistiken
export interface GalleryStatistics {
  galleryId: string
  totalViews: number
  uniqueVisitors: number
  lastVisited: Date
  dailyViews: {
    date: string
    count: number
  }[]
}

// Typ für Share-Link-Statistiken
export interface ShareLinkStats {
  id: string
  galleryId: string
  shareId: string
  createdAt: Date
  totalClicks: number
  uniqueVisitors: number
  lastAccessed: Date | null
  referrers: Record<string, number>
}

export interface CreateGalleryOptions {
  name: string
  isPublic?: boolean
  expiresAt?: Date | null
}

export interface FolderTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
  selectedFolder: Folder | null
  userId: string
  onFileUpload: () => void
  refreshFiles: number
}

// Füge die fehlenden Props für die FolderTabsHeaderProps hinzu
export interface FolderTabsHeaderProps {
  selectedFolder: Folder
  onArchive: () => void
  onCreateGallery: () => void
  onOpenSettings: () => void
}

// Füge die fehlenden Props zur FolderSettingsDialogProps-Schnittstelle hinzu
export interface FolderSettingsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedFolder: Folder
  folderName: string
  folderColor: string
  onSave: () => void
  settingsTab: string
  setSettingsTab: (tab: string) => void
  deletionDate: string
  setDeletionDate: (date: string) => void
  deletionTime: string
  setDeletionTime: (time: string) => void
  shareLink: string
  isGeneratingLink: boolean
  handleGenerateShareLink: () => void
  handleCopyShareLink: () => void
  isExporting: boolean
  handleExportFolder: () => void
  isDuplicating: boolean
  handleDuplicateFolder: () => void
  setFolderName: (name: string) => void
  setFolderColor: (color: string) => void
  // Social Media Sharing
  instagramEnabled: boolean
  setInstagramEnabled: (enabled: boolean) => void
  facebookEnabled: boolean
  setFacebookEnabled: (enabled: boolean) => void
  twitterEnabled: boolean
  setTwitterEnabled: (enabled: boolean) => void
  whatsappEnabled: boolean
  setWhatsappEnabled: (enabled: boolean) => void
  customButtonEnabled: boolean
  setCustomButtonEnabled: (enabled: boolean) => void
  customButtonLabel: string
  setCustomButtonLabel: (label: string) => void
  customButtonUrl: string
  setCustomButtonUrl: (url: string) => void
  // Neue Props für die erweiterten Einstellungen
  socialMediaSettings?: SocialMediaSettings
  setSocialMediaSettings?: (settings: SocialMediaSettings) => void
}

export interface GalleryViewProps {
  userId: string
}

export interface AdminViewProps {
  userId: string
}

export interface GalleryCardProps {
  gallery: Gallery
  onEdit: (id: string) => void
  onShare: (id: string) => void
  onDelete: (id: string) => void
  onCopyLink: (link: string) => void
  onView?: (id: string) => void
}

export interface CreateGalleryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newGalleryName: string
  setNewGalleryName: (name: string) => void
  selectedFolder: string
  setSelectedFolder: (folder: string) => void
  folders: Folder[]
  onCreateGallery: (options: CreateGalleryOptions) => void
}

export interface ShareGalleryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedGallery: string | null
  galleries: Gallery[]
  onCopyLink: (link: string) => void
  onRegenerateLink: (
    galleryId: string,
    options?: { expiresAt?: Date; password?: string | null; access?: ShareLinkAccess },
  ) => void
  onToggleShareLink: (galleryId: string, enabled: boolean) => void
}

export interface EditGalleryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedGallery: string | null
  galleries: Gallery[]
  onSave: (galleryId: string, updates: Partial<Gallery>) => void
}

// Füge neue Typen für die Galerie-Funktionen hinzu
export interface GallerySettings {
  title: string
  description?: string
  headerImage?: string
  backgroundColor?: string
  textColor?: string
  fontFamily?: string
  expiryDate?: Date | null
  isPasswordProtected?: boolean
  password?: string
  allowDownload?: boolean
  showMetadata?: boolean
  watermarkEnabled?: boolean
  watermarkText?: string
  watermarkPosition?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "center"
  layout?: "grid" | "masonry" | "carousel" | "slideshow"
  itemsPerPage?: number
  sortBy?: "name" | "date" | "size" | "type"
  sortOrder?: "asc" | "desc"
}

// Neue Schnittstelle für Social Media Sharing Buttons
export interface SocialMediaButtonProps {
  url: string
  title?: string
  description?: string
  imageUrl?: string
  className?: string
}

// Admin-Bereich Typen
export interface AdminUser {
  id: string
  email: string
  displayName?: string
  disabled?: boolean
  isAdmin?: boolean
  lastLogin?: Date
  createdAt?: Date
  storageUsed?: number
  plan?: string
}

export interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalFiles: number
  totalFolders: number
  totalGalleries: number
  totalStorage: number
}

export interface AdminActionLog {
  id: string
  action: string
  details: any
  timestamp: Date
  adminId: string
  adminEmail: string
}

export interface SystemSettings {
  maxUploadSize: number
  allowedFileTypes: string
  defaultUserPlan: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  [key: string]: any
}

