"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import type { Folder } from "@/types"

// Komponenten
import { Sidebar } from "@/components/dashboard/sidebar"
import { FolderTabs } from "@/components/file-management/folder-tabs"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { SubscriptionView } from "@/components/dashboard/subscription-view"
import { SettingsView } from "@/components/dashboard/settings-view"
import { FolderList } from "@/components/folder-list"
import { Toaster } from "@/components/ui/toaster"
// Importiere die neue GalleryView-Komponente
import { GalleryView } from "@/components/gallery/gallery-view"
import { AdminView } from "@/components/dashboard/admin-view"
import { isAdmin } from "@/lib/utils/admin-check"

export function DashboardContent() {
  // State
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
  const [refreshFiles, setRefreshFiles] = useState(0)
  const [activeTab, setActiveTab] = useState<string>("files")
  const [activeView, setActiveView] = useState<string>("dashboard")
  const [userIsAdmin, setUserIsAdmin] = useState(false)

  // Benutzer-ID abrufen und Admin-Status prüfen
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
        setUserIsAdmin(isAdmin())
      } else {
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

  // Event-Handler
  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Fehler beim Abmelden:", error)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleFileUploadComplete = () => {
    // Dateien neu laden
    setRefreshFiles((prev) => prev + 1)
  }

  const handleNavigate = (view: string) => {
    setActiveView(view)
  }

  // Render-Funktion für den Hauptinhalt
  const renderMainContent = () => {
    if (!userId) return null

    switch (activeView) {
      case "dashboard":
        return (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Übersicht und Statistiken</p>
            </header>
            <UserDashboard userId={userId} />
          </>
        )

      case "files":
        return (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold">Dateiverwaltung</h1>
              <p className="text-muted-foreground">Verwalten Sie Ihre Ordner und Dateien</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ordnerliste */}
              <div className="lg:col-span-1">
                <FolderList userId={userId} onSelectFolder={setSelectedFolder} selectedFolderId={selectedFolder?.id} />
              </div>

              {/* Tabs für Dateien, API-Schlüssel und Tools */}
              <div className="lg:col-span-2">
                <FolderTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  selectedFolder={selectedFolder}
                  userId={userId}
                  onFileUpload={handleFileUploadComplete}
                  refreshFiles={refreshFiles}
                />
              </div>
            </div>
          </>
        )

      case "subscription":
        return (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold">Abonnement</h1>
              <p className="text-muted-foreground">Verwalten Sie Ihr Abonnement und Zahlungen</p>
            </header>
            <SubscriptionView userId={userId} />
          </>
        )

      case "settings":
        return (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold">Einstellungen</h1>
              <p className="text-muted-foreground">Verwalten Sie Ihre Kontoeinstellungen</p>
            </header>
            <SettingsView userId={userId} />
          </>
        )
      // Füge den neuen case für "gallery" im renderMainContent hinzu
      case "gallery":
        return (
          <>
            <GalleryView userId={userId} />
          </>
        )

      // Admin-Bereich
      case "admin":
        // Prüfe den aktuellen Admin-Status direkt, anstatt sich auf den State zu verlassen
        if (!isAdmin()) {
          // Wenn kein Admin, zurück zum Dashboard umleiten
          setActiveView("dashboard")
          return null
        }
        return <>{userId && <AdminView userId={userId} />}</>

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar-Komponente */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        activeView={activeView}
      />

      {/* Main content */}
      <div className="flex-1 p-4 md:p-8">{renderMainContent()}</div>

      <Toaster />
    </div>
  )
}

