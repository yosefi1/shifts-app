import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Shifts App - Test Page</h1>
        <p>If you can see this, the basic routing is working!</p>
        <p>Firebase status: Loading...</p>
      </div>
    </Router>
  )
}

export default App
 
 