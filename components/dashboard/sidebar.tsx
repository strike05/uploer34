"use client"

import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  FolderIcon,
  Archive,
  Image,
  ShieldAlert,
} from "lucide-react"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { isAdmin } from "@/lib/utils/admin-check"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  onLogout: () => void
  onNavigate: (view: string) => void
  activeView: string
}

export function Sidebar({ isOpen, onToggle, onLogout, onNavigate, activeView }: SidebarProps) {
  const [isUserAdmin, setIsUserAdmin] = useState(false)

  useEffect(() => {
    // Check if the current user is an admin
    const checkAdminStatus = () => {
      setIsUserAdmin(isAdmin())
    }

    // Check immediately and whenever auth state changes
    checkAdminStatus()
    const unsubscribe = auth.onAuthStateChanged(checkAdminStatus)

    return () => unsubscribe()
  }, [])
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-4 left-4 md:hidden z-50 bg-background shadow-md border"
        onClick={onToggle}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
          bg-background w-full md:w-64 md:min-h-screen md:flex flex-col 
          fixed md:relative z-40 transition-all duration-300 ease-in-out
          shadow-lg border-r ${isOpen ? "flex" : "hidden"}
        `}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Mein Konto</h2>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Button
                variant={activeView === "dashboard" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onNavigate("dashboard")}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </li>
            <li>
              <Button
                variant={activeView === "files" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onNavigate("files")}
              >
                <FolderIcon className="mr-2 h-4 w-4" />
                Dateiverwaltung
              </Button>
            </li>
            <li>
              <Button
                variant={activeView === "archive" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onNavigate("archive")}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archiv
              </Button>
            </li>
            <li>
              <Button
                variant={activeView === "gallery" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onNavigate("gallery")}
              >
                <Image className="mr-2 h-4 w-4" />
                Galerie verwalten
              </Button>
            </li>
            <li>
              <Button
                variant={activeView === "subscription" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onNavigate("subscription")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Abonnement
              </Button>
            </li>
            <li>
              <Button
                variant={activeView === "settings" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onNavigate("settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Einstellungen
              </Button>
            </li>

            {/* Admin-Bereich nur für Administratoren anzeigen */}
            {isUserAdmin && (
              <li>
                <Button
                  variant={activeView === "admin" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onNavigate("admin")}
                >
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Administration
                </Button>
              </li>
            )}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </Button>
        </div>
      </div>
    </>
  )
}

