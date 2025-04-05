"use client"

import { auth } from "@/lib/firebase"

/**
 * Checks if a user has admin privileges
 * Users with @kreativ-style.de email addresses automatically get admin rights
 */
export function isAdmin(): boolean {
  const user = auth.currentUser
  if (!user) return false

  // Check if the user's email ends with @kreativ-style.de
  if (user.email && user.email.endsWith("@kreativ-style.de")) {
    return true
  }

  // In the future, you could also check for admin role in Firestore
  // This would allow manually assigning admin rights to other users

  return false
}

/**
 * Checks if a specific email has admin privileges
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false

  // Check if the email ends with @kreativ-style.de
  return email.endsWith("@kreativ-style.de")
}

