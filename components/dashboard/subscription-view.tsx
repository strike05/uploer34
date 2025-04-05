"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SubscriptionViewProps {
  userId: string
}

export function SubscriptionView({ userId }: SubscriptionViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Aktuelles Abonnement */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Aktuelles Abonnement</CardTitle>
          <CardDescription>Ihr aktueller Plan und Status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-medium">Kostenlos</h3>
              <p className="text-sm text-muted-foreground">
                Gültig bis: {new Intl.DateTimeFormat("de-DE").format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
              </p>
            </div>
            <Badge>Aktiv</Badge>
          </div>

          <div className="space-y-4 mt-6">
            <h4 className="font-medium">Enthaltene Funktionen:</h4>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>1 GB Speicherplatz</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Bis zu 5 API-Schlüssel</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Maximale Dateigröße: 100 MB</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Grundlegende Unterstützung</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Verfügbare Pläne */}
      <Card>
        <CardHeader>
          <CardTitle>Kostenlos</CardTitle>
          <CardDescription>Für persönliche Nutzung</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-4">
            €0<span className="text-sm font-normal text-muted-foreground">/Monat</span>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>1 GB Speicherplatz</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>5 API-Schlüssel</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>100 MB max. Dateigröße</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" disabled>
            Aktueller Plan
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Premium</CardTitle>
          <CardDescription>Für professionelle Nutzung</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-4">
            €9,99<span className="text-sm font-normal text-muted-foreground">/Monat</span>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>50 GB Speicherplatz</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Unbegrenzte API-Schlüssel</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>1 GB max. Dateigröße</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Prioritäts-Support</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Upgrade</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business</CardTitle>
          <CardDescription>Für Unternehmen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-4">
            €29,99<span className="text-sm font-normal text-muted-foreground">/Monat</span>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>500 GB Speicherplatz</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Unbegrenzte API-Schlüssel</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>5 GB max. Dateigröße</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>24/7 Support</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Erweiterte Statistiken</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Upgrade</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

