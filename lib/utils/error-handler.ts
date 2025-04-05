/**
 * Zentraler Fehlerhandler für Firebase-Fehler
 */
export function handleFirebaseError(error: any): string {
  console.error("Firebase-Fehler:", error)

  // Wenn es ein Firebase Auth-Fehler ist
  if (error.code) {
    switch (error.code) {
      case "auth/user-not-found":
        return "Benutzer nicht gefunden"
      case "auth/wrong-password":
        return "Falsches Passwort"
      case "auth/email-already-in-use":
        return "Diese E-Mail-Adresse wird bereits verwendet"
      case "auth/weak-password":
        return "Das Passwort ist zu schwach"
      case "auth/invalid-email":
        return "Ungültige E-Mail-Adresse"
      case "auth/operation-not-allowed":
        return "Operation nicht erlaubt"
      case "auth/requires-recent-login":
        return "Diese Aktion erfordert eine erneute Anmeldung"
      case "storage/unauthorized":
        return "Nicht autorisiert für diese Speicheroperation"
      case "storage/canceled":
        return "Speicheroperation abgebrochen"
      case "storage/unknown":
        return "Unbekannter Speicherfehler"
      case "permission-denied":
        return "Zugriff verweigert"
      default:
        return `Fehler: ${error.message || "Unbekannter Fehler"}`
    }
  }

  // Wenn es ein anderer Fehler ist
  return error.message || "Ein unbekannter Fehler ist aufgetreten"
}

/**
 * Fehlerhandler für API-Anfragen
 */
export function handleApiError(error: any): string {
  console.error("API-Fehler:", error)

  if (error.response) {
    // Der Server hat mit einem Fehlerstatuscode geantwortet
    const status = error.response.status

    switch (status) {
      case 400:
        return "Ungültige Anfrage"
      case 401:
        return "Nicht autorisiert"
      case 403:
        return "Zugriff verweigert"
      case 404:
        return "Ressource nicht gefunden"
      case 500:
        return "Interner Serverfehler"
      default:
        return `Serverfehler: ${error.response.data?.message || "Unbekannter Fehler"}`
    }
  } else if (error.request) {
    // Die Anfrage wurde gestellt, aber keine Antwort erhalten
    return "Keine Antwort vom Server erhalten"
  } else {
    // Etwas anderes ist passiert
    return error.message || "Ein unbekannter Fehler ist aufgetreten"
  }
}

