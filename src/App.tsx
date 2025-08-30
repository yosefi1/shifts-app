import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Shifts App - Test Page</h1>
            <p>If you can see this, basic React is working!</p>
            <p>Basic routing test</p>
            <p>Firebase status: Loading...</p>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App

// Trigger Vercel build
