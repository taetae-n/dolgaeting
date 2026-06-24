import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Admin from './Admin'
import Manage from './Manage'
import Select from './Select'
import Play from './Play'
import Result from './Result'
import AdminAuth from './AdminAuth'
import Sessions from './Sessions'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminAuth><Admin /></AdminAuth>} />
        <Route path="/manage" element={<AdminAuth><Manage /></AdminAuth>} />  
        <Route path="/select" element={<Select />} />
        <Route path="/play/:gender" element={<Play />} />
        <Route path="/result" element={<Result />} />
        <Route path="/sessions" element={<AdminAuth><Sessions /></AdminAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

