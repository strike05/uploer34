"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Download, Copy } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function PythonToolInfo() {
  const [activeTab, setActiveTab] = useState("installation")

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "Kopiert!",
          description: "Code wurde in die Zwischenablage kopiert.",
        })
      })
      .catch((err) => {
        console.error("Fehler beim Kopieren in die Zwischenablage:", err)
      })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firebase Uploader Tool</CardTitle>
        <CardDescription>Ein Python-Tool zum einfachen Hochladen von Dateien in Ihre Firebase-Ordner</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="installation">Installation</TabsTrigger>
            <TabsTrigger value="usage">Verwendung</TabsTrigger>
            <TabsTrigger value="requirements">Anforderungen</TabsTrigger>
          </TabsList>

          <TabsContent value="installation" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">1. Python installieren</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Stellen Sie sicher, dass Python 3.8 oder höher installiert ist.
              </p>
              <div className="bg-muted p-3 rounded-md">
                <code className="text-xs">python --version</code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">2. Tool herunterladen</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Laden Sie das Tool-Paket herunter und entpacken Sie es.
              </p>
              <Button variant="outline" className="mt-2">
                <Download className="h-4 w-4 mr-2" />
                Firebase Uploader Tool herunterladen
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">3. Abhängigkeiten installieren</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Öffnen Sie eine Kommandozeile im entpackten Ordner und führen Sie folgenden Befehl aus:
              </p>
              <div className="bg-muted p-3 rounded-md flex justify-between items-center">
                <code className="text-xs">pip install -r requirements.txt</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard("pip install -r requirements.txt")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Starten des Tools</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Führen Sie die main.py Datei aus, um das Tool zu starten:
              </p>
              <div className="bg-muted p-3 rounded-md flex justify-between items-center">
                <code className="text-xs">python main.py</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard("python main.py")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Erste Anmeldung</h3>
              <p className="text-sm text-muted-foreground">
                Bei der ersten Anmeldung müssen Sie Ihre Firebase-Anmeldedaten eingeben. Diese werden verschlüsselt in
                einer settings.ini Datei gespeichert.
              </p>
            </div>

            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ihre Anmeldedaten werden lokal und verschlüsselt gespeichert. Sie werden nicht an Dritte weitergegeben.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Systemanforderungen</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Python 3.8 oder höher</li>
                <li>Windows, macOS oder Linux</li>
                <li>Internetverbindung</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Python-Abhängigkeiten</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>PyQt6: Für die grafische Benutzeroberfläche</li>
                <li>firebase-admin: Für die Firebase-Integration</li>
                <li>python-dotenv: Für die Konfigurationsverwaltung</li>
                <li>cryptography: Für die Verschlüsselung der Anmeldedaten</li>
                <li>requests: Für HTTP-Anfragen</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Dokumentation</Button>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Tool herunterladen
        </Button>
      </CardFooter>
    </Card>
  )
}

