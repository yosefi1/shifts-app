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

// Temporary: Clear localStorage to ensure fresh start
if (window.location.hostname === 'localhost') {
  console.log('Clearing localStorage for fresh start...')
  localStorage.clear()
}

// Add global CSS for iOS touch scrolling
const globalStyles = `
  .table-scroll-container {
    -webkit-overflow-scrolling: touch !important;
    overflow-x: auto !important;
    /* allow natural vertical scroll and pinch-zoom */
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

  /* Force remove right padding from first column */
  .MuiTableCell-root:first-of-type {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }

  /* Force remove left padding from second column */
  .MuiTableCell-root:nth-of-type(2) {
    padding-left: 0 !important;
  }

  /* Override any Material-UI default padding */
  .MuiTable-root .MuiTableRow-root .MuiTableCell-root:first-of-type {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }

  .MuiTable-root .MuiTableRow-root .MuiTableCell-root:nth-of-type(2) {
    padding-left: 0 !important;
  }

  /* Remove padding from Paper component used in TableContainer */
  .MuiPaper-root {
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Remove any default spacing from TableContainer */
  .MuiTableContainer-root {
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Force table to start from the very edge */
  .table-scroll-container .MuiTable-root {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    border-spacing: 0 !important;
    border-collapse: collapse !important;
  }

  /* Remove any border spacing from table cells */
  .MuiTableCell-root {
    border-spacing: 0 !important;
    padding: 8px 4px !important;
  }

  /* Force first column to be flush with right edge */
  .MuiTableCell-root:first-of-type {
    padding-right: 0 !important;
    padding-left: 0 !important;
    border-right: none !important;
  }

  /* Target the main content area - this might be the culprit */
  .MuiBox-root {
    padding-right: 0 !important;
    margin-right: 0 !important;
  }

  /* Target the main container */
  [dir="rtl"] {
    padding-right: 0 !important;
    margin-right: 0 !important;
  }

  /* Target the main content wrapper */
  .MuiBox-root[dir="rtl"] {
    padding-right: 0 !important;
    margin-right: 0 !important;
    max-width: 100% !important;
  }

  /* Force the table container to take full width */
  .table-scroll-container {
    width: 100vw !important;
    max-width: 100vw !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  /* Force the table itself to take full width */
  .table-scroll-container table {
    width: 100% !important;
    min-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Remove any default body/html margins */
  body, html {
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }

  /* Most aggressive approach - target everything */
  * {
    box-sizing: border-box !important;
  }

  /* Force the entire table area to be flush */
  .MuiTableContainer-root,
  .MuiTableContainer-root .MuiPaper-root,
  .MuiTableContainer-root .MuiTable-root,
  .MuiTableContainer-root .MuiTableBody-root,
  .MuiTableContainer-root .MuiTableHead-root {
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
  }

  /* Force the first cell to be absolutely flush */
  .MuiTableCell-root:first-child {
    padding: 0 !important;
    margin: 0 !important;
    border: 1px solid rgba(224, 224, 224, 1) !important;
    width: auto !important;
  }

  /* Ensure all table cells have consistent borders */
  .MuiTableCell-root {
    border: 1px solid rgba(224, 224, 224, 1) !important;
  }

  /* Make table headers bold - more specific selector */
  .MuiTableHead .MuiTableCell-root,
  .MuiTableHead .MuiTableCell-root * {
    font-weight: bold !important;
  }

  /* Force bold on all header text */
  .MuiTableHead .MuiTypography-root {
    font-weight: bold !important;
  }

  /* Center align the first column */
  .MuiTableCell-root:first-child {
    text-align: center !important;
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
  </React.StrictMode>,
) 