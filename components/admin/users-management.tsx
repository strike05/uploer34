"use client"

import { useState, useEffect } from "react"
import { getAllUsers, updateUserStatus, deleteUser, updateUserPlan, sendPasswordResetEmail } from "@/lib/services/admin-service"
import type { AdminUser } from "@/types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Search, CheckCircle, UserX, MoreHorizontal, Trash2, Key, Mail } from "lucide-react"

export function UsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
        const usersList = await getAllUsers()
        setUsers(usersList)
        setFilteredUsers(usersList)
      } catch (error) {
        console.error("Fehler beim Laden der Benutzer:", error)
        toast({
          title: "Fehler",
          description: "Benutzer konnten nicht geladen werden",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  useEffect(() => {
    // Benutzer filtern, wenn sich der Suchbegriff ändert
    if (!searchTerm.trim()) {
      setFilteredUsers(users)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            (user.email?.toLowerCase() || "").includes(term) || (user.displayName?.toLowerCase() || "").includes(term),
        ),
      )
    }
  }, [searchTerm, users])

  const handleUpdateStatus = async (userId: string, disabled: boolean) => {
    try {
      setIsProcessing(true)
      await updateUserStatus(userId, disabled)

      // Benutzer im State aktualisieren
      setUsers(users.map((user) => (user.id === userId ? { ...user, disabled } : user)))

      toast({
        title: "Status aktualisiert",
        description: `Benutzer wurde ${disabled ? "deaktiviert" : "aktiviert"}.`,
      })
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Status:", error)
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setIsProcessing(true)
      await deleteUser(selectedUser.id)

      // Benutzer aus dem State entfernen
      setUsers(users.filter((user) => user.id !== selectedUser.id))

      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich gelöscht.",
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Fehler beim Löschen des Benutzers:", error)
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht gelöscht werden",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setSelectedUser(null)
    }
  }

  const handleUpdatePlan = async (userId: string, plan: string) => {
    try {
      setIsProcessing(true)
      await updateUserPlan(userId, plan)

      // Benutzer im State aktualisieren
      setUsers(users.map((user) => (user.id === userId ? { ...user, plan } : user)))

      toast({
        title: "Plan aktualisiert",
        description: `Der Plan des Benutzers wurde auf "${plan}" aktualisiert.`,
      })
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Plans:", error)
      toast({
        title: "Fehler",
        description: "Plan konnte nicht aktualisiert werden",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (date?: Date) => {
    if (!date) return "Nie"
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 Bytes"
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Number.parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benutzerverwaltung</CardTitle>
        <CardDescription>Verwalten Sie Benutzerkonten und Berechtigungen</CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Benutzern..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-Mail</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Letzter Login</TableHead>
                <TableHead>Speicher</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Keine Benutzer gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.displayName || "-"}</TableCell>
                    <TableCell>
                      {user.disabled ? (
                        <Badge variant="destructive">Deaktiviert</Badge>
                      ) : (
                        <Badge variant="outline">Aktiv</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge variant="default" className="bg-blue-500">
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">Benutzer</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.lastLogin)}</TableCell>
                    <TableCell>{formatBytes(user.storageUsed)}</TableCell>
                    <TableCell>
                      <Badge variant={user.plan === "premium" ? "default" : "outline"}>{user.plan || "Free"}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(user.id, !user.disabled)}
                            disabled={isProcessing}
                          >
                            {user.disabled ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                <span>Aktivieren</span>
                              </>
                            ) : (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                <span>Deaktivieren</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleUpdatePlan(user.id, "free")}
                            disabled={isProcessing || user.plan === "free"}
                          >
                            <span>Plan: Free</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdatePlan(user.id, "premium")}
                            disabled={isProcessing || user.plan === "premium"}
                          >
                            <span>Plan: Premium</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdatePlan(user.id, "business")}
                            disabled={isProcessing || user.plan === "business"}
                          >
                            <span>Plan: Business</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setIsResetDialogOpen(true)
                            }}
                            disabled={isProcessing || !user.email}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Passwort zurücksetzen</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteDialogOpen(true)
                            }}
                            disabled={isProcessing}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Löschen</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Löschen-Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Benutzer löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Benutzer "{selectedUser?.email}" wirklich löschen? Diese Aktion kann nicht rückgängig
              gemacht werden und entfernt alle Daten des Benutzers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Wird gelöscht..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Passwort-Zurücksetzen-Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Passwort zurücksetzen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie eine E-Mail zum Zurücksetzen des Passworts an "{selectedUser?.email}" senden?
              Der Benutzer erhält einen Link, über den er ein neues Passwort festlegen kann.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!selectedUser?.email) return;
                
                try {
                  setIsProcessing(true);
                  await sendPasswordResetEmail(selectedUser.email);
                  
                  toast({
                    title: "E-Mail gesendet",
                    description: `Eine E-Mail zum Zurücksetzen des Passworts wurde an ${selectedUser.email} gesendet.`,
                  });
                  
                  setIsResetDialogOpen(false);
                } catch (error: any) {
                  toast({
                    title: "Fehler",
                    description: error.message || "E-Mail konnte nicht gesendet werden.",
                    variant: "destructive",
                  });
                } finally {
                  setIsProcessing(false);
                  setSelectedUser(null);
                }
              }}
              disabled={isProcessing}
              className="bg-primary hover:bg-primary/90"
            >
              {isProcessing ? "Wird gesendet..." : "E-Mail senden"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

