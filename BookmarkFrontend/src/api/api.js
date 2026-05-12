import axios from 'axios'

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`

const api = axios.create({
  baseURL: API_BASE_URL,
})

export const userAPI = {
  createUser: (userData) => api.post('/users', userData),
  getUser: (userId) => api.get(`/users/${userId}`),
  getUserByEmail: (email) => api.get(`/users/email/${email}`),
  logout: () => api.post('/users/logout')
}

export const bookmarkAPI = {
  createBookmark: (data) => api.post('/bookmarks', data),
  getBookmarks: (userId) => api.get(`/bookmarks/user/${userId}`),
  getBookmarksByFolder: (userId, folderId) => api.get(`/bookmarks/user/${userId}/folder/${folderId}`),
  getBookmarksByTag: (userId, tag) => api.get(`/bookmarks/user/${userId}/tag/${tag}`),
  searchBookmarks: (userId, query) => api.get(`/bookmarks/user/${userId}/search/${query}`),
  updateBookmark: (id, data) => api.put(`/bookmarks/${id}`, data),
  deleteBookmark: (id, userId) => api.delete(`/bookmarks/${id}`, { data: { userId } }),
  bulkDelete: (userId, ids) => api.post('/bookmarks/bulk-delete', { userId, ids }),
  bulkUpdate: (userId, ids, updates) => api.post('/bookmarks/bulk-update', { userId, ids, updates }),
  importBookmarks: (userId, bookmarks) => api.post('/bookmarks/import', { userId, bookmarks }),
  toggleFavorite: (id, userId) => api.put(`/bookmarks/${id}/favorite`, { userId }),
  togglePin: (id, userId) => api.put(`/bookmarks/${id}/pin`, { userId }),
  accessBookmark: (id, userId) => api.put(`/bookmarks/${id}/access`, { userId }),
  getFavoriteBookmarks: (userId) => api.get(`/bookmarks/user/${userId}/favorites`),
  getBookmarksWithSort: (userId, sortBy) => api.get(`/bookmarks/user/${userId}/sort`, { params: { sortBy } }),
  getBookmarkStats: (userId) => api.get(`/bookmarks/user/${userId}/stats`),
  exportBookmarks: (userId) => api.get(`/bookmarks/user/${userId}/export`),
  getReminders: (userId) => api.get(`/bookmarks/user/${userId}/reminders`),
  getByDomain: (userId) => api.get(`/bookmarks/user/${userId}/by-domain`),
  updateStatus: (id, userId, status, readingProgress) => api.put(`/bookmarks/${id}/status`, { userId, status, readingProgress }),
  setReminder: (id, userId, reminderAt, reminderNote) => api.put(`/bookmarks/${id}/reminder`, { userId, reminderAt, reminderNote }),
  addNote: (id, userId, content) => api.post(`/bookmarks/${id}/notes`, { userId, content }),
  deleteNote: (id, noteId, userId) => api.delete(`/bookmarks/${id}/notes/${noteId}`, { data: { userId } }),
  addRelatedLink: (id, userId, url, description) => api.post(`/bookmarks/${id}/related-links`, { userId, url, description }),
  updateRelatedLink: (id, linkId, userId, url, description) => api.put(`/bookmarks/${id}/related-links/${linkId}`, { userId, url, description }),
  deleteRelatedLink: (id, linkId, userId) => api.delete(`/bookmarks/${id}/related-links/${linkId}`, { data: { userId } }),
}

export const folderAPI = {
  createFolder: (data) => api.post('/folders', data),
  getFolders: (userId) => api.get(`/folders/user/${userId}`),
  updateFolder: (id, data) => api.put(`/folders/${id}`, data),
  deleteFolder: (id, userId) => api.delete(`/folders/${id}`, { data: { userId } }),
  getSmartCollectionBookmarks: (id, userId) => api.get(`/folders/${id}/smart-bookmarks`, { params: { userId } }),
}

export const aiAPI = {
  analyze: (title, url, description) => api.post('/ai/analyze', { title, url, description }),
  chat: (message, userId) => api.post('/ai/chat', { message, userId }),
  chatAction: (action, bookmarkIds, userId, payload) => api.post('/ai/chat-action', { action, bookmarkIds, userId, payload }),
  getRecommendations: (userId) => api.get(`/ai/recommendations/${userId}`),
  checkDeadLinks: (userId) => api.post('/ai/check-dead-links', { userId }),
  findDuplicates: (userId) => api.get(`/ai/duplicates/${userId}`),
}

export const analyticsAPI = {
  getAnalytics: (userId) => api.get(`/analytics/${userId}`),
  getTimeline: (userId) => api.get(`/analytics/${userId}/timeline`),
}
