import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App'
import './styles.css'
import './faculty-content.css'
createRoot(document.getElementById('root')!, {
  onUncaughtError(error) {
    window.__nuolEntrance?.fail()
    console.error('Application render failed', error)
  },
}).render(
  <StrictMode>
    <App />
    <SpeedInsights />
  </StrictMode>,
)
