"use client"

import { useState, useEffect } from "react"
import { getSystemSettings, updateSystemSettings } from "@/lib/services/admin-service"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AlertCircle, Save } from "lucide-react"

export function SystemSettingsManager() {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const systemSettings = await getSystemSettings()
        setSettings(systemSettings)
      } catch (error: any) {
        setError(error.message || "Fehler beim Laden der Einstellungen")
        toast({
          title: "Fehler",
          description: "Systemeinstellungen konnten nicht geladen werden",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleUpdateSettings = async () => {
    if (!settings) return

    try {
      setIsSaving(true)
      await updateSystemSettings(settings)
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Systemeinstellungen wurden erfolgreich aktualisiert.",
      })
    } catch (error: any) {
      setError(error.message || "Fehler beim Speichern der Einstellungen")
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p>Keine Einstellungen verfügbar</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Systemeinstellungen</CardTitle>
        <CardDescription>Konfigurieren Sie globale Einstellungen für die Plattform</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <p className="text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </p>
          </div>
        )}

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="upload">Upload & Dateien</TabsTrigger>
            <TabsTrigger value="users">Benutzer</TabsTrigger>
            <TabsTrigger value="maintenance">Wartung</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="app-name">Anwendungsname</Label>
                <Input
                  id="app-name"
                  value={settings.appName || ""}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  placeholder="Firebase Gallery"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">Kontakt-E-Mail</Label>
                <Input
                  id="contact-email"
                  value={settings.contactEmail || ""}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  placeholder="kontakt@beispiel.de"
                  type="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-url">Basis-URL</Label>
              <Input
                id="base-url"
                value={settings.baseUrl || ""}
                onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                placeholder="https://ihre-domain.de"
              />
              <p className="text-xs text-muted-foreground">Diese URL wird für die Generierung von Links verwendet</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="analytics-enabled"
                checked={settings.analyticsEnabled || false}
                onCheckedChange={(checked) => setSettings({ ...settings, analyticsEnabled: checked })}
              />
              <Label htmlFor="analytics-enabled">Analytik aktivieren</Label>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max-upload-size">Maximale Upload-Größe (in MB)</Label>
              <Input
                id="max-upload-size"
                type="number"
                value={Math.floor((settings.maxUploadSize || 0) / (1024 * 1024))}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxUploadSize: Number.parseInt(e.target.value) * 1024 * 1024,
                  })
                }
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowed-file-types">Erlaubte Dateitypen</Label>
              <Input
                id="allowed-file-types"
                value={settings.allowedFileTypes || "*"}
                onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                placeholder="*.jpg,*.png,*.pdf"
              />
              <p className="text-xs text-muted-foreground">Kommagetrennte Liste von Dateitypen oder * für alle Typen</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-process-images"
                checked={settings.autoProcessImages || false}
                onCheckedChange={(checked) => setSettings({ ...settings, autoProcessImages: checked })}
              />
              <Label htmlFor="auto-process-images">Bilder automatisch verarbeiten</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="generate-thumbnails"
                checked={settings.generateThumbnails || false}
                onCheckedChange={(checked) => setSettings({ ...settings, generateThumbnails: checked })}
              />
              <Label htmlFor="generate-thumbnails">Thumbnails generieren</Label>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-user-plan">Standard-Benutzerplan</Label>
              <Select
                value={settings.defaultUserPlan || "free"}
                onValueChange={(value) => setSettings({ ...settings, defaultUserPlan: value })}
              >
                <SelectTrigger id="default-user-plan">
                  <SelectValue placeholder="Plan auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="registration-enabled"
                checked={settings.registrationEnabled !== false}
                onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
              />
              <Label htmlFor="registration-enabled">Registrierung aktivieren</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="email-verification-required"
                checked={settings.emailVerificationRequired || false}
                onCheckedChange={(checked) => setSettings({ ...settings, emailVerificationRequired: checked })}
              />
              <Label htmlFor="email-verification-required">E-Mail-Verifizierung erforderlich</Label>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenance-mode"
                checked={settings.maintenanceMode || false}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
              <Label htmlFor="maintenance-mode">Wartungsmodus aktivieren</Label>
            </div>

            {settings.maintenanceMode && (
              <div className="space-y-2">
                <Label htmlFor="maintenance-message">Wartungsmeldung</Label>
                <Input
                  id="maintenance-message"
                  value={settings.maintenanceMessage || ""}
                  onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                  placeholder="Wir führen derzeit Wartungsarbeiten durch. Bitte versuchen Sie es später erneut."
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="debug-mode"
                checked={settings.debugMode || false}
                onCheckedChange={(checked) => setSettings({ ...settings, debugMode: checked })}
              />
              <Label htmlFor="debug-mode">Debug-Modus aktivieren</Label>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdateSettings} disabled={isSaving} className="ml-auto">
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Wird gespeichert...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Einstellungen speichern
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

