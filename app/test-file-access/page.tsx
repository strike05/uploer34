"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestFileAccess() {
  const [folderId, setFolderId] = useState("")
  const [filename, setFilename] = useState("")
  const [generatedUrl, setGeneratedUrl] = useState("")

  const generateUrl = () => {
    if (folderId && filename) {
      const url = `${window.location.origin}/${folderId}/${filename}`
      setGeneratedUrl(url)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test File Access</CardTitle>
          <CardDescription>Generate and test direct file access URLs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="folderId" className="text-sm font-medium">
              Folder ID
            </label>
            <Input
              id="folderId"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              placeholder="Enter folder ID"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="filename" className="text-sm font-medium">
              Filename
            </label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
            />
          </div>
          {generatedUrl && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-1">Generated URL:</p>
              <a
                href={generatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {generatedUrl}
              </a>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={generateUrl} disabled={!folderId || !filename}>
            Generate URL
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

