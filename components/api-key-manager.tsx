"use client"

import { useState, useEffect } from "react"
import { generateApiKey, getFolderApiKeys, deleteApiKey, type ApiKey } from "@/lib/api-key-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Copy, Loader2, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Folder } from "@/types"

interface ApiKeyManagerProps {
  userId: string
  folder: Folder
}

export function ApiKeyManager({ userId, folder }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // API-Schlüssel laden
  const loadApiKeys = async () => {
    if (!userId || !folder) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const folderApiKeys = await getFolderApiKeys(userId, folder.id)
      setApiKeys(folderApiKeys)
    } catch (err: any) {
      console.error("Fehler beim Laden der API-Schlüssel:", err)
      setError(err.message || "Fehler beim Abrufen der API-Schlüssel")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadApiKeys()
  }, [userId, folder])

  // Neuen API-Schlüssel generieren
  const handleGenerateApiKey = async () => {
    if (!description.trim() || !userId || !folder) return

    setIsGenerating(true)
    setError(null)

    try {
      const apiKey = await generateApiKey(userId, folder.id, folder.name, description)

      if (apiKey) {
        setApiKeys([...apiKeys, apiKey])
        setDescription("")
        setIsDialogOpen(false)
        toast({
          title: "API-Schlüssel erstellt",
          description: "Der API-Schlüssel wurde erfolgreich erstellt.",
        })
      } else {
        throw new Error("Fehler beim Erstellen des API-Schlüssels")
      }
    } catch (err: any) {
      console.error("Fehler beim Erstellen des API-Schlüssels:", err)
      setError(err.message || "Fehler beim Erstellen des API-Schlüssels")
    } finally {
      setIsGenerating(false)
    }
  }

  // API-Schlüssel löschen
  const handleDeleteApiKey = async () => {
    if (!keyToDelete) return

    setIsDeleting(true)

    try {
      const success = await deleteApiKey(keyToDelete.id)

      if (success) {
        setApiKeys(apiKeys.filter((key) => key.id !== keyToDelete.id))
        toast({
          title: "API-Schlüssel gelöscht",
          description: "Der API-Schlüssel wurde erfolgreich gelöscht.",
        })
      } else {
        throw new Error("Fehler beim Löschen des API-Schlüssels")
      }
    } catch (err: any) {
      console.error("Fehler beim Löschen des API-Schlüssels:", err)
      toast({
        title: "Fehler",
        description: err.message || "Fehler beim Löschen des API-Schlüssels",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setKeyToDelete(null)
    }
  }

  // API-Schlüssel in die Zwischenablage kopieren
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "Kopiert!",
          description: "API-Schlüssel wurde in die Zwischenablage kopiert.",
        })
      })
      .catch((err) => {
        console.error("Fehler beim Kopieren in die Zwischenablage:", err)
        toast({
          title: "Fehler",
          description: "Konnte nicht in die Zwischenablage kopieren.",
          variant: "destructive",
        })
      })
  }

  // Datum formatieren
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>API-Schlüssel für "{folder.name}"</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Neuer Schlüssel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen API-Schlüssel erstellen</DialogTitle>
              </DialogHeader>
              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="py-4">
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Beschreibung
                  </label>
                  <Input
                    id="description"
                    placeholder="z.B. C# Upload Tool"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Geben Sie eine Beschreibung ein, um diesen Schlüssel später identifizieren zu können.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Abbrechen</Button>
                </DialogClose>
                <Button onClick={handleGenerateApiKey} disabled={isGenerating || !description.trim()}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Erstelle...
                    </>
                  ) : (
                    "Erstellen"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>Erstellen Sie API-Schlüssel, um Dateien direkt in diesen Ordner hochzuladen.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {apiKeys.length === 0 ? (
          <div className="text-center p-8 border rounded-md bg-muted/20">
            <p className="text-muted-foreground">Keine API-Schlüssel vorhanden</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Schlüssel</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead>Zuletzt verwendet</TableHead>
                  <TableHead className="w-[100px]">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell>{apiKey.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-1 py-0.5 rounded text-xs">{apiKey.key.substring(0, 10)}...</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(apiKey.createdAt)}</TableCell>
                    <TableCell>{apiKey.lastUsed ? formatDate(apiKey.lastUsed) : "Nie"}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setKeyToDelete(apiKey)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>API-Schlüssel löschen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Möchten Sie diesen API-Schlüssel wirklich löschen? Diese Aktion kann nicht rückgängig
                              gemacht werden und alle Anwendungen, die diesen Schlüssel verwenden, werden nicht mehr
                              funktionieren.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteApiKey}
                              disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Löschen...
                                </>
                              ) : (
                                "Löschen"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <h4 className="text-sm font-medium mb-2">Verwendung im C# Tool</h4>
        <div className="bg-muted p-3 rounded-md w-full overflow-x-auto">
          <pre className="text-xs">
            <code>
              // C# Beispielcode für das Upload-Tool{"\n"}
              var apiKey = "IHR_API_SCHLÜSSEL";{"\n"}
              var folderId = "{folder.id}";{"\n"}
              var userId = "{userId}";{"\n"}
              var apiUrl = $"https://ihre-domain.com/api/upload?key={"{apiKey}"}&folderId={"{folderId}"}&userId=
              {"{userId}"}"
            </code>
          </pre>
        </div>
      </CardFooter>
    </Card>
  )
}

