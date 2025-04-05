/**
 * Utility functions for handling images
 */

/**
 * Attempts to load an image with proper error handling
 * @param url The image URL to load
 * @returns A promise that resolves when the image is loaded or rejects with an error
 */
export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    // Set crossOrigin to handle CORS issues
    img.crossOrigin = "anonymous"

    img.onload = () => resolve(img)
    img.onerror = (error) => {
      console.error("Error loading image:", url, error)
      reject(new Error(`Failed to load image: ${url}`))
    }

    img.src = url
  })
}

/**
 * Gets a fallback image URL for when loading fails
 * @param width The width of the placeholder
 * @param height The height of the placeholder
 * @returns A placeholder image URL
 */
export const getFallbackImageUrl = (width = 300, height = 300) => {
  return `/placeholder.svg?width=${width}&height=${height}`
}

/**
 * Creates a download URL for a file
 * @param url The original storage URL
 * @param filename The name to save the file as
 * @returns A URL that can be used for downloading
 */
export const createDownloadUrl = (url: string, filename: string): string => {
  // Firebase Storage URLs don't need modification for download
  return url
}

