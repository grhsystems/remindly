import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserSettings } from '@/types'
import { api } from '@/utils/api'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const settings = ref<UserSettings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userLanguage = computed(() => user.value?.language || 'he')
  const userTheme = computed(() => user.value?.theme || 'light')

  // Actions
  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/login', { email, password })
      user.value = response.data.user
      settings.value = response.data.settings
      
      // Store token
      localStorage.setItem('token', response.data.token)
      
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בהתחברות'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: {
    email: string
    password: string
    name: string
    language?: 'he' | 'en'
  }) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/auth/register', userData)
      user.value = response.data.user
      settings.value = response.data.settings
      
      // Store token
      localStorage.setItem('token', response.data.token)
      
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בהרשמה'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      settings.value = null
      localStorage.removeItem('token')
      loading.value = false
    }
  }

  const loadUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      user.value = null
      settings.value = null
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/auth/me')
      user.value = response.data.user
      settings.value = response.data.settings
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בטעינת המשתמש'
      localStorage.removeItem('token')
      user.value = null
      settings.value = null
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user.value) return

    loading.value = true
    error.value = null
    
    try {
      const response = await api.put('/auth/settings', newSettings)
      settings.value = { ...settings.value, ...response.data.settings }
      
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בעדכון ההגדרות'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (profileData: {
    name?: string
    email?: string
    language?: 'he' | 'en'
    theme?: 'light' | 'dark'
  }) => {
    if (!user.value) return

    loading.value = true
    error.value = null
    
    try {
      const response = await api.put('/auth/profile', profileData)
      user.value = { ...user.value, ...response.data.user }
      
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בעדכון הפרופיל'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    loading.value = true
    error.value = null
    
    try {
      await api.put('/auth/password', {
        currentPassword,
        newPassword
      })
      
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בשינוי הסיסמה'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteAccount = async () => {
    if (!user.value) return

    loading.value = true
    error.value = null
    
    try {
      await api.delete('/auth/account')
      
      user.value = null
      settings.value = null
      localStorage.removeItem('token')
      
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה במחיקת החשבון'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    settings,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    userLanguage,
    userTheme,
    
    // Actions
    login,
    register,
    logout,
    loadUser,
    updateSettings,
    updateProfile,
    changePassword,
    deleteAccount,
    clearError
  }
})
