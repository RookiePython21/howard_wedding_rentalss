import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './styles/index.css'
import App from './App'

const rootEl = document.getElementById('root')!

const app = (
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
)

// Pages are prerendered to static HTML at build time, so in production #root is
// already populated and we hydrate it. When the shell is empty (dev server, or a
// route that wasn't prerendered) fall back to a fresh client render.
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, app)
} else {
  createRoot(rootEl).render(app)
}
