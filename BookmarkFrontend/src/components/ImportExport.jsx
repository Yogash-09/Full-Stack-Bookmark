// src/components/ImportExport.jsx
import { useRef } from 'react'
import { bookmarkAPI } from '../api/api'

function ImportExport({ onImportComplete, onClose }) {
  const fileRef = useRef()
  const userId = localStorage.getItem('userId')

  const parseNetscapeHTML = (html) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const links = doc.querySelectorAll('a')
    return Array.from(links).map(a => ({
      title: a.textContent.trim() || a.href,
      url: a.href,
      description: '',
      tags: a.getAttribute('tags') ? a.getAttribute('tags').split(',').map(t => t.trim()) : [],
      addDate: a.getAttribute('add_date') || ''
    })).filter(b => b.url && b.url.startsWith('http'))
  }

  const handleFileImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      let bookmarks = []

      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text)
        bookmarks = Array.isArray(data) ? data : [data]
      } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        bookmarks = parseNetscapeHTML(text)
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n').filter(l => l.trim())
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase())
        bookmarks = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim())
          const obj = {}
          headers.forEach((h, i) => { obj[h] = values[i] || '' })
          return {
            title: obj.title || obj.name || obj.url,
            url: obj.url,
            description: obj.description || '',
            tags: obj.tags ? obj.tags.split(';').map(t => t.trim()) : []
          }
        }).filter(b => b.url)
      }

      if (bookmarks.length === 0) {
        alert('No valid bookmarks found in file.')
        return
      }

      const result = await bookmarkAPI.importBookmarks(userId, bookmarks)
      alert(`✅ Import complete!\nImported: ${result.data.imported}\nSkipped (duplicates): ${result.data.skipped}\nErrors: ${result.data.errors.length}`)
      onImportComplete()
      onClose()
    } catch (err) {
      alert('Failed to import: ' + err.message)
    }
    e.target.value = ''
  }

  const handleExport = async (format) => {
    try {
      const response = await bookmarkAPI.exportBookmarks(userId)
      let content, filename, type

      if (format === 'json') {
        content = JSON.stringify(response.data, null, 2)
        filename = `bookmarks-${new Date().toISOString().split('T')[0]}.json`
        type = 'application/json'
      } else if (format === 'csv') {
        const headers = ['Title', 'URL', 'Description', 'Tags', 'Category', 'Status', 'Priority', 'Views', 'Favorite', 'Created']
        const rows = response.data.map(b => [
          b.title, b.url, b.description || '', b.tags?.join('; ') || '',
          b.category || '', b.status || '', b.priority || '',
          b.viewCount || 0, b.isFavorite ? 'Yes' : 'No',
          new Date(b.createdAt).toLocaleDateString()
        ])
        content = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
        filename = `bookmarks-${new Date().toISOString().split('T')[0]}.csv`
        type = 'text/csv'
      } else if (format === 'html') {
        const items = response.data.map(b =>
          `    <DT><A HREF="${b.url}" ADD_DATE="${Math.floor(new Date(b.createdAt).getTime() / 1000)}" TAGS="${b.tags?.join(',') || ''}">${b.title}</A>`
        ).join('\n')
        content = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n${items}\n</DL><p>`
        filename = `bookmarks-${new Date().toISOString().split('T')[0]}.html`
        type = 'text/html'
      }

      const blob = new Blob([content], { type })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed: ' + err.message)
    }
  }

  const btnStyle = (color) => ({
    padding: '12px 20px', background: `rgba(${color},0.15)`, border: `1px solid rgba(${color},0.3)`,
    borderRadius: '10px', color: `rgb(${color})`, fontSize: '14px', cursor: 'pointer',
    fontWeight: '600', transition: 'all 0.2s', width: '100%', textAlign: 'left'
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'rgba(13,13,13,0.98)', border: '1px solid rgba(0,245,255,0.2)',
        borderRadius: '16px', padding: '32px', width: '460px', maxWidth: '95vw',
        boxShadow: '0 0 40px rgba(0,245,255,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: '#E5E7EB', fontSize: '20px' }}>📦 Import / Export</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ color: '#00F5FF', fontSize: '14px', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>📥 Import</h3>
          <p style={{ color: '#9CA3AF', fontSize: '13px', margin: '0 0 12px 0' }}>Supports Chrome/Firefox/Edge HTML exports, JSON, and CSV files.</p>
          <input ref={fileRef} type="file" accept=".json,.html,.htm,.csv" onChange={handleFileImport} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current.click()} style={btnStyle('0,245,255')}>
            📂 Choose File (HTML / JSON / CSV)
          </button>
        </div>

        <div>
          <h3 style={{ color: '#8B5CF6', fontSize: '14px', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>📤 Export</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => handleExport('json')} style={btnStyle('0,245,255')}>📄 Export as JSON</button>
            <button onClick={() => handleExport('csv')} style={btnStyle('139,92,246')}>📊 Export as CSV</button>
            <button onClick={() => handleExport('html')} style={btnStyle('255,165,0')}>🌐 Export as HTML (Browser Bookmarks)</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportExport
