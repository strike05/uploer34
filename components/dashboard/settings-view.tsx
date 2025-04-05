"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SettingsViewProps {
  userId: string
}

export function SettingsView({ userId }: SettingsViewProps) {
  return (
    <div className="space-y-6">
      {/* Profil-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Verwalten Sie Ihre persönlichen Informationen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input id="name" type="text" className="w-full p-2 border rounded-md" defaultValue="Max Mustermann" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-2 border rounded-md"
                defaultValue="max@example.com"
                disabled
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Speichern</Button>
        </CardFooter>
      </Card>

      {/* Sicherheitseinstellungen */}
      <Card>
        <CardHeader>
          <CardTitle>Sicherheit</CardTitle>
          <CardDescription>Verwalten Sie Ihre Sicherheitseinstellungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="current-password" className="text-sm font-medium">
              Aktuelles Passwort
            </label>
            <input id="current-password" type="password" className="w-full p-2 border rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                Neues Passwort
              </label>
              <input id="new-password" type="password" className="w-full p-2 border rounded-md" />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Passwort bestätigen
              </label>
              <input id="confirm-password" type="password" className="w-full p-2 border rounded-md" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Passwort ändern</Button>
        </CardFooter>
      </Card>

      {/* Benachrichtigungseinstellungen */}
      <Card>
        <CardHeader>
          <CardTitle>Benachrichtigungen</CardTitle>
          <CardDescription>Verwalten Sie Ihre Benachrichtigungseinstellungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">E-Mail-Benachrichtigungen</h4>
              <p className="text-sm text-muted-foreground">Erhalten Sie Benachrichtigungen per E-Mail</p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Sicherheitsbenachrichtigungen</h4>
              <p className="text-sm text-muted-foreground">Benachrichtigungen über Sicherheitsereignisse</p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Marketingbenachrichtigungen</h4>
              <p className="text-sm text-muted-foreground">Erhalten Sie Informationen zu neuen Funktionen</p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Speichern</Button>
        </CardFooter>
      </Card>

      {/* Konto löschen */}
      <Card>
        <CardHeader>
          <CardTitle>Konto löschen</CardTitle>
          <CardDescription>Löschen Sie Ihr Konto und alle zugehörigen Daten</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden dauerhaft gelöscht.
          </p>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="confirm-delete" />
            <label htmlFor="confirm-delete" className="text-sm">
              Ich verstehe, dass diese Aktion nicht rückgängig gemacht werden kann
            </label>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive">Konto löschen</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

