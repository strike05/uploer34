/**
 * Generiert eine eindeutige ID mit der angegebenen Länge
 * @param length Die Länge der ID
 * @param prefix Ein optionales Präfix für die ID
 * @returns Eine eindeutige ID
 */
export function generateUniqueId(length = 8, prefix?: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  // Füge einen Zeitstempel hinzu, um die Eindeutigkeit zu erhöhen
  const timestamp = Date.now().toString(36)

  // Füge ein Präfix hinzu, wenn angegeben
  const prefixStr = prefix ? `${prefix}_` : ""

  // Fülle den Rest mit zufälligen Zeichen auf
  const randomLength = Math.max(1, length - timestamp.length - prefixStr.length)

  for (let i = 0; i < randomLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  // Kombiniere Präfix, Zeitstempel und zufällige Zeichen
  return prefixStr + timestamp.substring(0, 4) + result
}

/**
 * Generiert einen lesbaren Code (z.B. für Passwörter)
 * @param length Die Länge des Codes
 * @returns Ein lesbarer Code
 */
export function generateReadableCode(length = 6): string {
  // Verwende nur Großbuchstaben und Zahlen, aber keine verwirrenden Zeichen (0, O, 1, I)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

