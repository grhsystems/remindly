import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { api } from '@/utils/api'

// Mock API
vi.mock('@/utils/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('UserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            language: 'he',
            theme: 'light'
          },
          token: 'mock-token'
        }
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const store = useUserStore()
      const result = await store.login('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(store.user).toEqual(mockResponse.data.user)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token')
    })

    it('should handle login error', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Invalid credentials'))

      const store = useUserStore()
      const result = await store.login('test@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid credentials')
      expect(store.user).toBeNull()
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            language: 'he',
            theme: 'light'
          },
          token: 'mock-token'
        }
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const store = useUserStore()
      const result = await store.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        language: 'he'
      })

      expect(result.success).toBe(true)
      expect(store.user).toEqual(mockResponse.data.user)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token')
    })

    it('should handle registration error', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Email already exists'))

      const store = useUserStore()
      const result = await store.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Email already exists')
      expect(store.user).toBeNull()
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      const store = useUserStore()
      store.user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        language: 'he',
        theme: 'light'
      } as any

      await store.logout()

      expect(store.user).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })
  })

  describe('loadUser', () => {
    it('should load user from token', async () => {
      const mockResponse = {
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            language: 'he',
            theme: 'light'
          }
        }
      }

      localStorageMock.getItem.mockReturnValue('mock-token')
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const store = useUserStore()
      await store.loadUser()

      expect(store.user).toEqual(mockResponse.data.user)
    })

    it('should handle no token', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const store = useUserStore()
      await store.loadUser()

      expect(store.user).toBeNull()
    })

    it('should handle load user error', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token')
      vi.mocked(api.get).mockRejectedValue(new Error('Invalid token'))

      const store = useUserStore()
      await store.loadUser()

      expect(store.user).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockResponse = {
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Updated Name',
            language: 'en',
            theme: 'dark'
          }
        }
      }

      vi.mocked(api.put).mockResolvedValue(mockResponse)

      const store = useUserStore()
      store.user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        language: 'he',
        theme: 'light'
      } as any

      const result = await store.updateProfile({
        name: 'Updated Name',
        language: 'en',
        theme: 'dark'
      })

      expect(result.success).toBe(true)
      expect(store.user?.name).toBe('Updated Name')
      expect(store.user?.language).toBe('en')
      expect(store.user?.theme).toBe('dark')
    })

    it('should handle update profile error', async () => {
      vi.mocked(api.put).mockRejectedValue(new Error('Update failed'))

      const store = useUserStore()
      store.user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        language: 'he',
        theme: 'light'
      } as any

      const result = await store.updateProfile({
        name: 'Updated Name'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Update failed')
    })
  })

  describe('computed properties', () => {
    it('should return correct isAuthenticated', () => {
      const store = useUserStore()
      
      expect(store.isAuthenticated).toBe(false)
      
      store.user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        language: 'he',
        theme: 'light'
      } as any
      
      expect(store.isAuthenticated).toBe(true)
    })

    it('should return correct userLanguage', () => {
      const store = useUserStore()
      
      expect(store.userLanguage).toBe('he')
      
      store.user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        language: 'en',
        theme: 'light'
      } as any
      
      expect(store.userLanguage).toBe('en')
    })

    it('should return correct userTheme', () => {
      const store = useUserStore()
      
      expect(store.userTheme).toBe('light')
      
      store.user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        language: 'he',
        theme: 'dark'
      } as any
      
      expect(store.userTheme).toBe('dark')
    })
  })
})
