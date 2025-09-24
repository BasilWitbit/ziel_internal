import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import './index.css'
import App from './App'
import { Toaster } from 'sonner'
import { Provider } from 'react-redux'
import { store } from './store/store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        className="toaster group"
        position="top-center"
        richColors
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
          } as React.CSSProperties
        }
        closeButton={true}
        toastOptions={{
          duration: 1500,
        }}
      />
    </Provider>
  </StrictMode>
)
