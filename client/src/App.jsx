import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Chaos from './components/Chaos'
import Logs from './components/Logs'
import Architecture from './components/Architecture'
import Login from './components/Login'
import Register from './components/Register'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="chaos" element={<Chaos />} />
            <Route path="logs" element={<Logs />} />
            <Route path="architecture" element={<Architecture />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
