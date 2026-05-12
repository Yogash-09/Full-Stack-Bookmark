// src/pages/FolderView.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BookmarkCard from '../components/BookmarkCard'
import FolderList from '../components/FolderList'
import { bookmarkAPI } from '../api/api'

function FolderView() {
  const { folderId } = useParams()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('recent')
  const userId = localStorage.getItem('userId')

  useEffect(() => {
    fetchFolderBookmarks()
  }, [folderId])

  useEffect(() => {
    applySort()
  }, [sortBy])

  const fetchFolderBookmarks = async () => {
    try {
      const response = await bookmarkAPI.getBookmarksByFolder(userId, folderId)
      setBookmarks(response.data)
    } catch (error) {
      console.error('Error fetching folder bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const applySort = () => {
    let sorted = [...bookmarks]
    if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'favorite') {
      sorted.sort((a, b) => b.isFavorite - a.isFavorite)
    } else if (sortBy === 'mostViewed') {
      sorted.sort((a, b) => b.viewCount - a.viewCount)
    } else {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    setBookmarks(sorted)
  }

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      await bookmarkAPI.deleteBookmark(bookmarkId, userId)
      setBookmarks(bookmarks.filter(bookmark => bookmark._id !== bookmarkId))
    } catch (error) {
      console.error('Error deleting bookmark:', error)
    }
  }

  const handleFavoriteToggle = () => {
    applySort()
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(to bottom, #0D0D0D, #111827)' }}>
    <div style={{ fontSize: '18px', color: '#00F5FF', fontWeight: 'bold', textShadow: '0 0 20px rgba(0, 245, 255, 0.5)' }}>⏳ Loading...</div>
  </div>

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #0D0D0D, #111827)', fontFamily: 'Arial, sans-serif', backgroundAttachment: 'fixed' }}>
      <Navbar />
      <div style={{ display: 'flex', padding: '20px', maxWidth: '1400px', margin: '0 auto', gap: '20px' }}>
        <div style={{ width: '300px', flexShrink: 0 }}>
          <FolderList />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            background: 'rgba(17, 24, 39, 0.4)',
            backdropFilter: 'blur(10px)',
            padding: '20px', 
            borderRadius: '10px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 245, 255, 0.1)',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap',
            border: '1px solid rgba(0, 245, 255, 0.15)'
          }}>
            <Link to="/bookmarks/new">
              <button style={{ 
                padding: '10px 20px',
                background: 'rgba(0, 245, 255, 0.15)',
                color: '#00F5FF',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                boxShadow: '0 0 10px rgba(0, 245, 255, 0.2)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(0, 245, 255, 0.25)'
                e.target.style.borderColor = 'rgba(0, 245, 255, 0.5)'
                e.target.style.boxShadow = '0 0 15px rgba(0, 245, 255, 0.4)'
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(0, 245, 255, 0.15)'
                e.target.style.borderColor = 'rgba(0, 245, 255, 0.3)'
                e.target.style.boxShadow = '0 0 10px rgba(0, 245, 255, 0.2)'
              }}>+ Add Bookmark</button>
            </Link>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                borderRadius: '6px',
                fontSize: '13px',
                background: 'rgba(17, 24, 39, 0.5)',
                color: '#E5E7EB',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(0, 245, 255, 0.6)'
                e.target.style.boxShadow = '0 0 10px rgba(0, 245, 255, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 245, 255, 0.3)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <option value="recent" style={{ background: '#111827', color: '#E5E7EB' }}>Sort: Recent</option>
              <option value="title" style={{ background: '#111827', color: '#E5E7EB' }}>Sort: Title (A-Z)</option>
              <option value="favorite" style={{ background: '#111827', color: '#E5E7EB' }}>Sort: Favorites First</option>
              <option value="mostViewed" style={{ background: '#111827', color: '#E5E7EB' }}>Sort: Most Viewed</option>
            </select>
            <span style={{ color: '#9CA3AF', fontSize: '14px', marginLeft: 'auto' }}>
              {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            {bookmarks.map(bookmark => (
              <BookmarkCard
                key={bookmark._id}
                bookmark={bookmark}
                onDelete={handleDeleteBookmark}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
          {bookmarks.length === 0 && (
            <div style={{ 
              background: 'rgba(17, 24, 39, 0.4)',
              backdropFilter: 'blur(10px)',
              padding: '40px', 
              borderRadius: '10px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 245, 255, 0.1)',
              textAlign: 'center',
              border: '1px solid rgba(0, 245, 255, 0.15)'
            }}>
              <p style={{ color: '#9CA3AF', marginBottom: '15px' }}>No bookmarks in this folder yet.</p>
              <Link to="/bookmarks/new">
                <button style={{ 
                  padding: '10px 20px',
                  background: 'rgba(0, 245, 255, 0.15)',
                  color: '#00F5FF',
                  border: '1px solid rgba(0, 245, 255, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  boxShadow: '0 0 10px rgba(0, 245, 255, 0.2)'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(0, 245, 255, 0.25)'
                  e.target.style.borderColor = 'rgba(0, 245, 255, 0.5)'
                  e.target.style.boxShadow = '0 0 15px rgba(0, 245, 255, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(0, 245, 255, 0.15)'
                  e.target.style.borderColor = 'rgba(0, 245, 255, 0.3)'
                  e.target.style.boxShadow = '0 0 10px rgba(0, 245, 255, 0.2)'
                }}>Add your first bookmark</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FolderView