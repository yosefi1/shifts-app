import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { StyledEngineProvider } from '@mui/material/styles'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from 'react-query'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'

// Add global CSS for iOS touch scrolling
const globalStyles = `
  .table-scroll-container {
    -webkit-overflow-scrolling: touch !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    touch-action: pan-x !important;
    -webkit-transform: translateZ(0) !important;
    transform: translateZ(0) !important;
  }
  
  .table-scroll-container::-webkit-scrollbar {
    height: 8px !important;
  }
  
  .table-scroll-container::-webkit-scrollbar-track {
    background-color: #f1f1f1 !important;
    border-radius: 4px !important;
  }
  
  .table-scroll-container::-webkit-scrollbar-thumb {
    background-color: #888 !important;
    border-radius: 4px !important;
  }
  
  .table-scroll-container::-webkit-scrollbar-thumb:hover {
    background-color: #555 !important;
  }
`

// Inject global styles
const styleSheet = document.createElement('style')
styleSheet.textContent = globalStyles
document.head.appendChild(styleSheet)

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: '"Heebo", "Arial", sans-serif',
  },
})

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CacheProvider value={cacheRtl}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <App />
              <Toaster position="top-center" />
            </BrowserRouter>
          </QueryClientProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </CacheProvider>
  </React.StrictMode>
) 