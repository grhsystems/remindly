import axios from 'axios'
import type { ApiResponse } from '@/types'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// API methods
export const apiService = {
  // Auth
  auth: {
    login: (email: string, password: string) =>
      api.post<ApiResponse<{ user: any; token: string; settings: any }>>('/auth/login', { email, password }),
    
    register: (userData: any) =>
      api.post<ApiResponse<{ user: any; token: string; settings: any }>>('/auth/register', userData),
    
    logout: () =>
      api.post<ApiResponse<void>>('/auth/logout'),
    
    me: () =>
      api.get<ApiResponse<{ user: any; settings: any }>>('/auth/me'),
    
    updateProfile: (profileData: any) =>
      api.put<ApiResponse<{ user: any }>>('/auth/profile', profileData),
    
    updateSettings: (settings: any) =>
      api.put<ApiResponse<{ settings: any }>>('/auth/settings', settings),
    
    changePassword: (passwordData: any) =>
      api.put<ApiResponse<void>>('/auth/password', passwordData),
    
    deleteAccount: () =>
      api.delete<ApiResponse<void>>('/auth/account')
  },

  // Lists
  lists: {
    getAll: () =>
      api.get<ApiResponse<any[]>>('/lists'),
    
    getById: (id: string) =>
      api.get<ApiResponse<any>>(`/lists/${id}`),
    
    create: (listData: any) =>
      api.post<ApiResponse<any>>('/lists', listData),
    
    update: (id: string, listData: any) =>
      api.put<ApiResponse<any>>(`/lists/${id}`, listData),
    
    delete: (id: string) =>
      api.delete<ApiResponse<void>>(`/lists/${id}`),
    
    reorder: (lists: any[]) =>
      api.put<ApiResponse<void>>('/lists/reorder', { lists }),
    
    search: (query: string) =>
      api.get<ApiResponse<any[]>>(`/lists/search?q=${encodeURIComponent(query)}`)
  },

  // Tasks
  tasks: {
    getAll: (params?: any) =>
      api.get<ApiResponse<any[]>>('/tasks', { params }),
    
    getById: (id: string) =>
      api.get<ApiResponse<any>>(`/tasks/${id}`),
    
    getByList: (listId: string) =>
      api.get<ApiResponse<any[]>>(`/lists/${listId}/tasks`),
    
    create: (taskData: any) =>
      api.post<ApiResponse<any>>('/tasks', taskData),
    
    update: (id: string, taskData: any) =>
      api.put<ApiResponse<any>>(`/tasks/${id}`, taskData),
    
    delete: (id: string) =>
      api.delete<ApiResponse<void>>(`/tasks/${id}`),
    
    toggleComplete: (id: string, completed: boolean) =>
      api.patch<ApiResponse<any>>(`/tasks/${id}/complete`, { completed }),
    
    reorder: (listId: string, tasks: any[]) =>
      api.put<ApiResponse<void>>('/tasks/reorder', { listId, tasks }),
    
    search: (query: string) =>
      api.get<ApiResponse<any[]>>(`/tasks/search?q=${encodeURIComponent(query)}`)
  },

  // Shopping Items
  shopping: {
    getItems: (listId: string) =>
      api.get<ApiResponse<any[]>>(`/shopping/${listId}/items`),
    
    addItem: (listId: string, itemData: any) =>
      api.post<ApiResponse<any>>(`/shopping/${listId}/items`, itemData),
    
    updateItem: (itemId: string, itemData: any) =>
      api.put<ApiResponse<any>>(`/shopping/items/${itemId}`, itemData),
    
    deleteItem: (itemId: string) =>
      api.delete<ApiResponse<void>>(`/shopping/items/${itemId}`),
    
    searchPrice: (productName: string) =>
      api.get<ApiResponse<any>>(`/shopping/prices/search?product=${encodeURIComponent(productName)}`),
    
    reorderItems: (listId: string, items: any[]) =>
      api.put<ApiResponse<void>>(`/shopping/${listId}/reorder`, { items })
  },

  // Voice Processing
  voice: {
    upload: (audioFile: File) => {
      const formData = new FormData()
      formData.append('audio', audioFile)
      return api.post<ApiResponse<any>>('/voice/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    
    process: (text: string) =>
      api.post<ApiResponse<any>>('/voice/process', { text }),
    
    getHistory: () =>
      api.get<ApiResponse<any[]>>('/voice/history')
  },

  // Notifications
  notifications: {
    getAll: () =>
      api.get<ApiResponse<any[]>>('/notifications'),
    
    markAsRead: (id: string) =>
      api.patch<ApiResponse<any>>(`/notifications/${id}/read`),
    
    markAllAsRead: () =>
      api.patch<ApiResponse<void>>('/notifications/read-all'),
    
    delete: (id: string) =>
      api.delete<ApiResponse<void>>(`/notifications/${id}`)
  },

  // Search
  search: {
    global: (query: string) =>
      api.get<ApiResponse<any[]>>(`/search?q=${encodeURIComponent(query)}`)
  },

  // AI Processing
  ai: {
    processText: (text: string) =>
      api.post<ApiResponse<any>>('/ai/process', { text }),
    
    translate: (text: string, targetLanguage: string) =>
      api.post<ApiResponse<{ translatedText: string }>>('/ai/translate', { text, targetLanguage })
  }
}

export { api }
export default api
