import { app, BrowserWindow } from 'electron'
import * as path from 'path'

let win: BrowserWindow | null = null

const isDev = process.env.NODE_ENV === 'development'

function createWindow(): void {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false,
    autoHideMenuBar: true
  })

  // Load the app
  if (isDev) {
    win.loadURL('http://localhost:3000')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../build/index.html'))
  }

  // Show window when ready
  win.once('ready-to-show', () => {
    win?.show()
  })

  win.on('closed', () => {
    win = null
  })
}

// Create window when app is ready
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Security: Prevent new window creation
app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
  })
})