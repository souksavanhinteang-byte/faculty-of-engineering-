/// <reference types="vite/client" />

interface Window {
  __nuolEntrance?: {
    ready: () => void
    fail: () => void
  }
}
