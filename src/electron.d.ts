// Electron type definitions for preload script
interface ElectronWindow {
  electron: {
    send: (channel: string, data: unknown) => void
    receive: (channel: string, func: (...args: unknown[]) => void) => void
  }
  versions: {
    node: () => string
    chrome: () => string
    electron: () => string
    platform: () => string
  }
  isDev: boolean
}

declare global {
  interface Window extends ElectronWindow {}
}

export {}