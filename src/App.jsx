import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Admin from './Admin'
import Manage from './Manage'
import Select from './Select'
import Play from './Play'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/manage" element={<Manage />} />
        <Route path="/select" element={<Select />} />
        <Route path="/play/:gender" element={<Play />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App