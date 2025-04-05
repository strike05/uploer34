"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/shared/loading-spinner"

export default function ShareRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const shareId = Array.isArray(params.shareId) ? params.shareId.join("/") : params.shareId

  useEffect(() => {
    if (shareId) {
      console.log("Redirecting to correct share URL:", `/s/${shareId}`)
      router.replace(`/s/${shareId}`)
    }
  }, [shareId, router])

  return <LoadingSpinner text="Leite weiter..." />
}

