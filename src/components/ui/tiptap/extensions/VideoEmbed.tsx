import { NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react'
import { Node, mergeAttributes } from '@tiptap/core'
import React from 'react'

interface VideoEmbedProps extends NodeViewProps {}

// Supported video file extensions
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv']

/**
 * Validate video file URL
 */
export const validateVideoUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL cannot be empty' }
  }

  // Check if it starts with http/https or blob:
  if (!url.match(/^https?:\/\//i) && !url.startsWith('blob:')) {
    return { isValid: false, error: 'URL must start with http://, https://, or blob:' }
  }

  // Check if it's a blob URL (valid for uploaded files)
  if (url.startsWith('blob:')) {
    return { isValid: true }
  }

  // Check if it has a valid video file extension
  const lowerUrl = url.toLowerCase()
  const hasValidExtension = VIDEO_EXTENSIONS.some((ext) => lowerUrl.endsWith(ext))

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `Invalid video file URL. Supported formats: ${VIDEO_EXTENSIONS.join(', ')}`
    }
  }

  // Optionally check for video/ in path
  if (url.includes('video/')) {
    return { isValid: true }
  }

  return { isValid: true }
}

export const VideoEmbedComponent: React.FC<VideoEmbedProps> = ({ node }) => {
  const { src, width = 640, height = 360, controls = true, autoplay = false, loop = false } = node.attrs

  if (!src) return null

  return (
    <NodeViewWrapper className="video-embed-wrapper my-4">
      <div className="video-container flex justify-center">
        <video
          src={src}
          width={width}
          height={height}
          controls={controls}
          autoPlay={autoplay}
          loop={loop}
          className="rounded-lg max-w-full"
          style={{ height: height ? `${height}px` : 'auto' }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </NodeViewWrapper>
  )
}

export const VideoEmbed = Node.create({
  name: 'videoEmbed',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-src'),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {}
          }
          return {
            'data-src': attributes.src,
          }
        },
      },
      width: {
        default: 640,
        parseHTML: (element) => element.getAttribute('data-width'),
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return {
            'data-width': attributes.width,
          }
        },
      },
      height: {
        default: 360,
        parseHTML: (element) => element.getAttribute('data-height'),
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {}
          }
          return {
            'data-height': attributes.height,
          }
        },
      },
      controls: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-controls') === 'true',
        renderHTML: (attributes) => {
          return {
            'data-controls': attributes.controls,
          }
        },
      },
      autoplay: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-autoplay') === 'true',
        renderHTML: (attributes) => {
          return {
            'data-autoplay': attributes.autoplay,
          }
        },
      },
      loop: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-loop') === 'true',
        renderHTML: (attributes) => {
          return {
            'data-loop': attributes.loop,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video-embed]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-video-embed': 'true' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedComponent)
  },

  addCommands() {
    return {
      setVideoEmbed:
        (options: {
          src: string
          width?: number
          height?: number
          controls?: boolean
          autoplay?: boolean
          loop?: boolean
        }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
