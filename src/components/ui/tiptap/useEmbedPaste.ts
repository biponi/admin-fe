/**
 * Paste Detection Hook
 * Automatically detects supported URLs when pasted in Tiptap editor
 */
import { useEffect, useCallback } from 'react'
import { detectPlatform } from './extensions/SocialMediaEmbed'

interface UseEmbedPasteOptions {
  editor: any
  onEmbedDetected: (url: string) => void
  enabled?: boolean
}

export const useEmbedPaste = ({
  editor,
  onEmbedDetected,
  enabled = true,
}: UseEmbedPasteOptions) => {
  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      if (!editor || !enabled) return

      // Get pasted text
      const pastedText = event.clipboardData?.getData('text/plain')
      if (!pastedText) return

      // Check if the pasted content is just a URL (or contains a URL)
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const urlMatch = pastedText.match(urlRegex)

      if (!urlMatch) return

      // Check each URL found
      for (const url of urlMatch) {
        // Trim whitespace
        const trimmedUrl = url.trim()

        // Check if it's a video file URL
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv']
        const isVideoFile = videoExtensions.some((ext) =>
          trimmedUrl.toLowerCase().endsWith(ext)
        )

        if (isVideoFile) {
          // Prevent default paste behavior
          event.preventDefault()
          // Trigger video embed dialog
          onEmbedDetected(trimmedUrl)
          return
        }

        // Check if it's a supported social media platform
        const platform = detectPlatform(trimmedUrl)

        if (platform) {
          // Prevent default paste behavior
          event.preventDefault()
          // Trigger social embed dialog
          onEmbedDetected(trimmedUrl)
          return
        }
      }

      // If no supported URL found, allow normal paste
    },
    [editor, onEmbedDetected, enabled]
  )

  useEffect(() => {
    if (!editor) return

    // Add paste event listener to the editor element
    const editorElement = editor.options.element
    if (!editorElement) return

    editorElement.addEventListener('paste', handlePaste)

    // Cleanup
    return () => {
      editorElement.removeEventListener('paste', handlePaste)
    }
  }, [editor, handlePaste])

  return { handlePaste }
}

export default useEmbedPaste
