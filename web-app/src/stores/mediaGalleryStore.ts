import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MediaGallery, CreateMediaGalleryForm } from '@/types'
import { api } from '@/utils/api'

export const useMediaGalleryStore = defineStore('mediaGallery', () => {
  // State
  const mediaItems = ref<MediaGallery[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const mediaByType = computed(() => {
    const grouped: { [type: string]: MediaGallery[] } = {}
    mediaItems.value.forEach(item => {
      if (!grouped[item.mediaType]) {
        grouped[item.mediaType] = []
      }
      grouped[item.mediaType].push(item)
    })
    return grouped
  })

  const publicMedia = computed(() => 
    mediaItems.value.filter(item => item.isPublic)
  )

  const privateMedia = computed(() => 
    mediaItems.value.filter(item => !item.isPublic)
  )

  const getMediaById = computed(() => (id: string) => 
    mediaItems.value.find(item => item.id === id)
  )

  const getMediaByTag = computed(() => (tag: string) => 
    mediaItems.value.filter(item => item.tags.includes(tag))
  )

  // Actions
  const loadMediaItems = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      mediaItems.value = []
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/media-gallery')
      mediaItems.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error loading media items'
      mediaItems.value = []
    } finally {
      loading.value = false
    }
  }

  const addMediaItem = async (mediaData: CreateMediaGalleryForm) => {
    loading.value = true
    error.value = null
    
    try {
      const formData = new FormData()
      formData.append('media', mediaData.file)
      formData.append('title', mediaData.title)
      formData.append('description', mediaData.description || '')
      formData.append('mediaType', mediaData.mediaType)
      formData.append('tags', JSON.stringify(mediaData.tags || []))
      formData.append('isPublic', mediaData.isPublic?.toString() || 'false')

      const response = await api.post('/media-gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      mediaItems.value.unshift(response.data)
      
      return { success: true, mediaItem: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error creating media item'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateMediaItem = async (id: string, mediaData: Partial<CreateMediaGalleryForm>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/media-gallery/${id}`, mediaData)
      const index = mediaItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        mediaItems.value[index] = response.data
      }
      
      return { success: true, mediaItem: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error updating media item'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteMediaItem = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      await api.delete(`/media-gallery/${id}`)
      mediaItems.value = mediaItems.value.filter(item => item.id !== id)
      
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error deleting media item'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const archiveMediaItem = async (id: string, archived: boolean) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.patch(`/media-gallery/${id}/archive`, { archived })
      const index = mediaItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        mediaItems.value[index] = response.data
      }
      
      return { success: true, mediaItem: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error archiving media item'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const shareMediaItem = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post(`/media-gallery/${id}/share`)
      const index = mediaItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        mediaItems.value[index].shareCount = response.data.shareCount
      }
      
      return { success: true, shareUrl: response.data.shareUrl }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error sharing media item'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const searchMediaItems = async (query: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/media-gallery?search=${encodeURIComponent(query)}`)
      return { success: true, mediaItems: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error searching media items'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const getMediaByType = async (type: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/media-gallery?mediaType=${type}`)
      return { success: true, mediaItems: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error loading media by type'
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
    mediaItems,
    loading,
    error,
    
    // Getters
    mediaByType,
    publicMedia,
    privateMedia,
    getMediaById,
    getMediaByTag,
    
    // Actions
    loadMediaItems,
    addMediaItem,
    updateMediaItem,
    deleteMediaItem,
    archiveMediaItem,
    shareMediaItem,
    searchMediaItems,
    getMediaByType,
    clearError
  }
})
