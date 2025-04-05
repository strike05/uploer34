"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { createUserRootFolder } from "@/lib/utils/storage-service-enhanced"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.code === "auth/invalid-credential") {
        setError("Ungültige E-Mail oder Passwort")
      } else if (error.code === "auth/user-not-found") {
        setError("Benutzer nicht gefunden")
      } else if (error.code === "auth/wrong-password") {
        setError("Falsches Passwort")
      } else {
        setError(error.message || "Ein Fehler ist aufgetreten")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Überprüfen, ob Passwörter übereinstimmen
    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein")
      return
    }
    
    // Überprüfen, ob Passwort mindestens 6 Zeichen lang ist
    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein")
      return
    }
    
    setIsLoading(true)

    try {
      // Benutzer erstellen
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Profil mit Vor- und Nachname aktualisieren
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`.trim()
      })
      
      // Root-Ordner für den Benutzer erstellen
      await createUserRootFolder(user.uid)

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Registration error:", error)
      if (error.code === "auth/email-already-in-use") {
        setError("Diese E-Mail-Adresse wird bereits verwendet")
      } else if (error.code === "auth/invalid-email") {
        setError("Ungültige E-Mail-Adresse")
      } else if (error.code === "auth/weak-password") {
        setError("Das Passwort ist zu schwach")
      } else {
        setError(error.message || "Ein Fehler ist aufgetreten")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <Tabs defaultValue="login">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Anmelden</TabsTrigger>
            <TabsTrigger value="register">Registrieren</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Wird angemeldet..." : "Anmelden"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-firstname">Vorname</Label>
                  <Input 
                    id="register-firstname" 
                    type="text" 
                    placeholder="Max" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-lastname">Nachname</Label>
                  <Input 
                    id="register-lastname" 
                    type="text" 
                    placeholder="Mustermann" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">E-Mail</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="name@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Passwort</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Passwort muss mindestens 6 Zeichen lang sein.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password-confirm">Passwort bestätigen</Label>
                <Input 
                  id="register-password-confirm" 
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Wird registriert..." : "Konto erstellen"}
              </Button>
            </form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}

