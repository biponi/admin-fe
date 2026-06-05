import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  send: (channel: string, data: unknown) => {
    // Whitelist channels
    const validChannels = ['toMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  receive: (channel: string, func: (...args: unknown[]) => void) => {
    // Whitelist channels
    const validChannels = ['fromMain']
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) =>
        func(...args)
      ipcRenderer.on(channel, subscription)
    }
  }
})

// Expose node version and platform info
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  platform: () => process.platform
})

// Expose a safe isDev flag
contextBridge.exposeInMainWorld('isDev', process.env.NODE_ENV === 'development')

// TypeScript type definitions
export interface ElectronWindow {
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