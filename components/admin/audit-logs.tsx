"use client"

import { useState, useEffect } from "react"
import { getAdminLogs } from "@/lib/services/admin-service"
import type { AdminActionLog } from "@/types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { ReloadIcon } from "@radix-ui/react-icons"
import { ExternalLink } from "lucide-react"

export function AuditLogs() {
  const [logs, setLogs] = useState<AdminActionLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const adminLogs = await getAdminLogs()
      setLogs(adminLogs)
    } catch (error: any) {
      setError(error.message || "Fehler beim Laden der Logs")
      toast({
        title: "Fehler",
        description: "Audit-Logs konnten nicht geladen werden",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
  }

  const formatActionDetails = (details: any) => {
    try {
      if (typeof details === "string") {
        return details
      }

      return JSON.stringify(details, null, 2)
    } catch (error) {
      return "Unbekannte Details"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Audit-Logs</CardTitle>
            <CardDescription>Protokoll administrativer Aktionen im System</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadLogs} disabled={isLoading}>
            {isLoading ? <ReloadIcon className="h-4 w-4 animate-spin" /> : <ReloadIcon className="h-4 w-4" />}
            <span className="ml-2">Aktualisieren</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={loadLogs} className="mt-4">
              Erneut versuchen
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <p>Keine Audit-Logs verfügbar</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{formatDate(log.timestamp)}</TableCell>
                    <TableCell>{log.adminEmail}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Aktionsdetails",
                            description: (
                              <pre className="mt-2 w-full max-h-40 overflow-auto rounded-md bg-slate-950 p-4">
                                <code className="text-white text-xs">{formatActionDetails(log.details)}</code>
                              </pre>
                            ),
                          })
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Details anzeigen
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

