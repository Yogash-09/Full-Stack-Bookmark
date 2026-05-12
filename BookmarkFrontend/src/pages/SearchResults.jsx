// src/pages/SearchResults.jsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BookmarkCard from '../components/BookmarkCard'
import { bookmarkAPI } from '../api/api'

function SearchResults() {
  const [searchParams] = useSearchParams()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('recent')
  const userId = localStorage.getItem('userId')
  const query = searchParams.get('q')
  const tag = searchParams.get('tag')

  useEffect(() => {
    if (query) {
      searchByTitle()
    } else if (tag) {
      searchByTag()
    }
  }, [query, tag])

  useEffect(() => {
    applySort()
  }, [sortBy])

  const searchByTitle = async () => {
    try {
      const response = await bookmarkAPI.searchBookmarks(userId, query)
      setBookmarks(response.data)
    } catch (error) {
      console.error('Error searching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchByTag = async () => {
    try {
      const response = await bookmarkAPI.getBookmarksByTag(userId, tag)
      setBookmarks(response.data)
    } catch (error) {
      console.error('Error fetching bookmarks by tag:', error)
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
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
          <h2 style={{ margin: 0, color: '#E5E7EB', fontSize: '24px', fontWeight: 'bold' }}>
            Search Results {query && `for "${query}"`} {tag && `for tag "${tag}"`}
          </h2>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid rgba(0, 245, 255, 0.3)',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'rgba(17, 24, 39, 0.5)',
              color: '#E5E7EB',
              cursor: 'pointer',
              fontWeight: '500',
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
        </div>

        <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
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
            textAlign: 'center',
            color: '#9CA3AF',
            border: '1px solid rgba(0, 245, 255, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <p style={{ fontSize: '16px' }}>No bookmarks found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchResults