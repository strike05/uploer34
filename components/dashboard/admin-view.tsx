"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersManagement } from "@/components/admin/users-management"
import { SystemStatistics } from "@/components/admin/system-stats"
import { SystemSettingsManager } from "@/components/admin/system-settings"
import { AuditLogs } from "@/components/admin/audit-logs"
import { FileModeration } from "@/components/admin/file-moderation"
import { BarChart, Users, Settings, FileText, Shield, History, AlertCircle } from "lucide-react"
import type { AdminViewProps } from "@/types"

export function AdminView({ userId }: AdminViewProps) {
  // State für aktiven Tab
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Shield className="mr-2 h-6 w-6 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Systemverwaltung und Benutzerübersicht</p>
      </header>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Übersicht</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Benutzer</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Dateien</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Einstellungen</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Probleme</span>
          </TabsTrigger>
        </TabsList>

        {/* Übersichts-Tab */}
        <TabsContent value="overview">
          <SystemStatistics />
        </TabsContent>

        {/* Benutzer-Tab */}
        <TabsContent value="users">
          <UsersManagement />
        </TabsContent>

        {/* Dateien-Tab */}
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Dateimanagement</CardTitle>
              <CardDescription>Dateien im System durchsuchen und verwalten</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Hier wird in Zukunft eine erweiterte Dateimanagement-Oberfläche zur Verfügung stehen. Aktuell können Sie
                problematische Dateien im Tab "Probleme" einsehen.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Einstellungen-Tab */}
        <TabsContent value="settings">
          <SystemSettingsManager />
        </TabsContent>

        {/* Audit-Tab */}
        <TabsContent value="audit">
          <AuditLogs />
        </TabsContent>

        {/* Probleme-Tab */}
        <TabsContent value="issues">
          <FileModeration />
        </TabsContent>
      </Tabs>
    </div>
  )
}

