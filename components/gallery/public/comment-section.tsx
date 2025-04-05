"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Send } from "lucide-react"
import { addGalleryComment, getFileComments } from "@/lib/services/gallery-service"
import type { GalleryComment } from "@/types"

interface CommentSectionProps {
  galleryId: string
  fileId: string
}

export function CommentSection({ galleryId, fileId }: CommentSectionProps) {
  const [comments, setComments] = useState<GalleryComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [author, setAuthor] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Lade Kommentare
  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const fileComments = await getFileComments(galleryId, fileId)
        setComments(fileComments)
      } catch (err: any) {
        console.error("Fehler beim Laden der Kommentare:", err)
        setError("Kommentare konnten nicht geladen werden")
      } finally {
        setIsLoading(false)
      }
    }

    loadComments()
  }, [galleryId, fileId])

  // Kommentar hinzufügen
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!author.trim() || !content.trim()) {
      setError("Bitte geben Sie einen Namen und einen Kommentar ein")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await addGalleryComment(galleryId, fileId, author, content)

      if (result.success) {
        // Kommentar wurde erfolgreich hinzugefügt
        // Lade die Kommentare neu
        const fileComments = await getFileComments(galleryId, fileId)
        setComments(fileComments)

        // Formular zurücksetzen
        setContent("")
      } else {
        throw new Error(result.error || "Fehler beim Hinzufügen des Kommentars")
      }
    } catch (err: any) {
      console.error("Fehler beim Hinzufügen des Kommentars:", err)
      setError(err.message || "Fehler beim Hinzufügen des Kommentars")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Formatiere das Datum
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Kommentare</h3>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Kommentarliste */}
      <div className="space-y-4 max-h-60 overflow-y-auto">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Lade Kommentare...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground">Keine Kommentare vorhanden</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b pb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{comment.author}</span>
                <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Kommentarformular */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <Input
          placeholder="Ihr Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="bg-white dark:bg-gray-700"
        />
        <div className="flex gap-2">
          <Textarea
            placeholder="Ihr Kommentar..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-white dark:bg-gray-700 min-h-[60px]"
          />
          <Button type="submit" size="icon" disabled={isSubmitting}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

