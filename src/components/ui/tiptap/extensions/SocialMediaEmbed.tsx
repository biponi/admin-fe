import { NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react'
import { Node, mergeAttributes } from '@tiptap/core'
import React from 'react'
import {
  FacebookEmbed,
  InstagramEmbed,
  LinkedInEmbed,
  PinterestEmbed,
  TikTokEmbed,
  XEmbed,
  YouTubeEmbed,
} from 'react-social-media-embed'

interface SocialMediaEmbedProps extends NodeViewProps {}

// URL parsing utilities
const parseYoutubeUrl = (url: string): string | null => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

const parseFacebookUrl = (url: string): string | null => {
  // Handle Reels URLs - convert to watch format for better SDK compatibility
  if (url.includes('facebook.com/reel/') || url.includes('facebook.com/reels/')) {
    // Extract the ID from reel URL and convert to watch format
    const reelMatch = url.match(/facebook\.com\/reels?\/([^/?\s]+)/)
    if (reelMatch) {
      const reelId = reelMatch[1]
      // Convert Reels URL to Facebook Watch format
      return `https://www.facebook.com/watch/?v=${reelId}`
    }
  }

  // Handle other Facebook URL formats (posts, videos)
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return url
  }

  return null
}

const parseInstagramUrl = (url: string): string | null => {
  // Handle posts, reels, and TV
  const regex = /instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/
  if (regex.test(url)) {
    return url
  }
  return null
}

const parseTikTokUrl = (url: string): string | null => {
  const regex = /tiktok\.com\/@[^/]+\/video\/(\d+)/
  if (regex.test(url)) {
    return url
  }
  return null
}

const parseLinkedInUrl = (url: string): string | null => {
  const regex = /linkedin\.com\/(?:feed|posts)\/([^/]+)/
  if (regex.test(url)) {
    return url
  }
  return null
}

const parsePinterestUrl = (url: string): string | null => {
  const regex = /pinterest\.com\/pin\/(\d+)/
  if (regex.test(url)) {
    return url
  }
  return null
}

const detectPlatform = (url: string): string | null => {
  if (!url) return null

  const urlLower = url.toLowerCase()

  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube'
  }
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) {
    return 'facebook'
  }
  if (urlLower.includes('instagram.com')) {
    return 'instagram'
  }
  if (urlLower.includes('tiktok.com')) {
    return 'tiktok'
  }
  if (urlLower.includes('linkedin.com')) {
    return 'linkedin'
  }
  if (urlLower.includes('pinterest.com')) {
    return 'pinterest'
  }
  if (urlLower.includes('x.com') || urlLower.includes('twitter.com')) {
    return 'x'
  }

  return null
}

// Enhanced URL validation with detailed error messages
export const validateSocialMediaUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL cannot be empty' }
  }

  // Check if it starts with http/https
  if (!url.match(/^https?:\/\//i)) {
    return { isValid: false, error: 'URL must start with http:// or https://' }
  }

  const platform = detectPlatform(url)

  if (!platform) {
    return {
      isValid: false,
      error: 'Unsupported platform. Please use a URL from YouTube, Facebook, Instagram, TikTok, LinkedIn, Pinterest, or X (Twitter).'
    }
  }

  // Platform-specific validation
  switch (platform) {
    case 'youtube': {
      const videoId = parseYoutubeUrl(url)
      if (!videoId) {
        return { isValid: false, error: 'Invalid YouTube URL. Please use a valid YouTube video URL.' }
      }
      break
    }
    case 'facebook': {
      const fbUrl = parseFacebookUrl(url)
      if (!fbUrl) {
        return { isValid: false, error: 'Invalid Facebook URL. Please use a valid Facebook post or video URL.' }
      }
      break
    }
    case 'instagram': {
      const instaUrl = parseInstagramUrl(url)
      if (!instaUrl) {
        return { isValid: false, error: 'Invalid Instagram URL. Please use a valid Instagram post, reel, or TV URL.' }
      }
      break
    }
    case 'tiktok': {
      const tiktokUrl = parseTikTokUrl(url)
      if (!tiktokUrl) {
        return { isValid: false, error: 'Invalid TikTok URL. Please use a valid TikTok video URL.' }
      }
      break
    }
    case 'linkedin': {
      const linkedinUrl = parseLinkedInUrl(url)
      if (!linkedinUrl) {
        return { isValid: false, error: 'Invalid LinkedIn URL. Please use a valid LinkedIn post URL.' }
      }
      break
    }
    case 'pinterest': {
      const pinterestUrl = parsePinterestUrl(url)
      if (!pinterestUrl) {
        return { isValid: false, error: 'Invalid Pinterest URL. Please use a valid Pinterest pin URL.' }
      }
      break
    }
    case 'x': {
      // X/Twitter URLs are more flexible, just check domain
      if (!url.includes('x.com') && !url.includes('twitter.com')) {
        return { isValid: false, error: 'Invalid X/Twitter URL. Please use a valid X or Twitter post URL.' }
      }
      break
    }
  }

  return { isValid: true }
}

export const SocialMediaEmbedComponent: React.FC<SocialMediaEmbedProps> = ({ node }) => {
  const { src, platform, width = 500 } = node.attrs

  if (!src || !platform) return null

  const embedWidth = Math.min(width, 650)

  const renderEmbed = () => {
    switch (platform) {
      case 'youtube':
        const videoId = parseYoutubeUrl(src)
        return videoId ? (
          <div className="flex justify-start">
            <YouTubeEmbed url={src} width={embedWidth} />
          </div>
        ) : (
          <div className="text-red-500 text-center p-4">Invalid YouTube URL</div>
        )

      case 'facebook':
        return parseFacebookUrl(src) ? (
          <div className="flex justify-start">
            <FacebookEmbed url={src} width={embedWidth} />
          </div>
        ) : (
          <div className="text-red-500 text-center p-4">Invalid Facebook URL</div>
        )

      case 'instagram':
        return parseInstagramUrl(src) ? (
          <div className="flex justify-start">
            <InstagramEmbed url={src} width={embedWidth} />
          </div>
        ) : (
          <div className="text-red-500 text-center p-4">Invalid Instagram URL</div>
        )

      case 'tiktok':
        return parseTikTokUrl(src) ? (
          <div className="flex justify-start">
            <TikTokEmbed url={src} width={embedWidth} />
          </div>
        ) : (
          <div className="text-red-500 text-center p-4">Invalid TikTok URL</div>
        )

      case 'linkedin':
        return parseLinkedInUrl(src) ? (
          <div className="flex justify-start">
            <LinkedInEmbed url={src} width={embedWidth} />
          </div>
        ) : (
          <div className="text-red-500 text-center p-4">Invalid LinkedIn URL</div>
        )

      case 'pinterest':
        return parsePinterestUrl(src) ? (
          <div className="flex justify-start">
            <PinterestEmbed url={src} width={embedWidth} />
          </div>
        ) : (
          <div className="text-red-500 text-center p-4">Invalid Pinterest URL</div>
        )

      case 'x':
        return (
          <div className="flex justify-start">
            <XEmbed url={src} width={embedWidth} />
          </div>
        )

      default:
        return <div className="text-red-500 text-center p-4">Unsupported platform</div>
    }
  }

  return (
    <NodeViewWrapper className="social-media-embed-wrapper my-4">
      <div className="social-media-container">{renderEmbed()}</div>
    </NodeViewWrapper>
  )
}

export const SocialMediaEmbed = Node.create({
  name: 'socialMediaEmbed',

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
      platform: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-platform'),
        renderHTML: (attributes) => {
          if (!attributes.platform) {
            return {}
          }
          return {
            'data-platform': attributes.platform,
          }
        },
      },
      width: {
        default: 500,
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
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-social-media-embed]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-social-media-embed': 'true' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SocialMediaEmbedComponent)
  },

  addCommands() {
    return {
      setSocialMediaEmbed: (options: { src: string; platform?: string; width?: number }) => {
        const platform = options.platform || detectPlatform(options.src)

        if (!platform) {
          console.error('Could not detect platform from URL')
          return false
        }

        return ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              ...options,
              platform,
            },
          })
        }
      },
    }
  },
})

// Export utility function for external use
export { detectPlatform }
