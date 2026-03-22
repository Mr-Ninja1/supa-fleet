import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RoleSelection from './pages/RoleSelection.jsx'
import Driver from './pages/Driver.jsx'
import Dashboard from './pages/Dashboard.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/driver" element={<Driver />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
