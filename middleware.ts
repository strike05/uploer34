import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Überprüfen, ob die URL dem Muster /view/s/[shareId] entspricht
  if (pathname.startsWith("/view/s/")) {
    // Extrahiere die shareId
    const shareIdPath = pathname.split("/view/s/")[1]

    // Leite zur korrekten URL um
    url.pathname = `/s/${shareIdPath}`
    return NextResponse.redirect(url)
  }
  
  // Überprüfen, ob es eine alte Format-URL für direkten Dateizugriff ist
  const directFileMatch = pathname.match(/^\/([a-zA-Z0-9_-]+)\/([^\/]+)$/)
  if (directFileMatch && !pathname.startsWith("/api/") && !pathname.startsWith("/s/")) {
    const folderId = directFileMatch[1]
    const fileName = directFileMatch[2]
    
    // Leite zur API-Route um
    url.pathname = `/api/direct/${folderId}/${fileName}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Konfiguriere die Middleware, um auf bestimmten Pfaden zu laufen
export const config = {
  matcher: [
    "/view/s/:shareId*", 
    "/((?!api|_next/static|_next/image|favicon.ico|s).*)"
  ],
}

