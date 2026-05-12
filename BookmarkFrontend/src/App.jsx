// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import FolderView from './pages/FolderView'
import CreateBookmark from './pages/CreateBookmark'
import EditBookmark from './pages/EditBookmark'
import SearchResults from './pages/SearchResults'

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId'))

  useEffect(() => {
    const handleStorageChange = () => {
      setUserId(localStorage.getItem('userId'))
    }
    window.addEventListener('storage', handleStorageChange)
    // Also handle same-tab storage changes
    const interval = setInterval(() => {
      const currentUserId = localStorage.getItem('userId')
      setUserId(prevId => prevId !== currentUserId ? currentUserId : prevId)
    }, 100)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={userId ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={userId ? <Navigate to="/dashboard" /> : <Login onLogin={() => setUserId(localStorage.getItem('userId'))} />} />
        <Route path="/register" element={userId ? <Navigate to="/dashboard" /> : <Register onRegister={() => setUserId(localStorage.getItem('userId'))} />} />
        <Route path="/dashboard" element={userId ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/folders/:folderId" element={userId ? <FolderView /> : <Navigate to="/" />} />
        <Route path="/bookmarks/new" element={userId ? <CreateBookmark /> : <Navigate to="/" />} />
        <Route path="/bookmarks/edit/:id" element={userId ? <EditBookmark /> : <Navigate to="/" />} />
        <Route path="/search" element={userId ? <SearchResults /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App