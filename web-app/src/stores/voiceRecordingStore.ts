import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { VoiceRecording, CreateVoiceRecordingForm } from '@/types'
import { api } from '@/utils/api'

export const useVoiceRecordingStore = defineStore('voiceRecording', () => {
  // State
  const recordings = ref<VoiceRecording[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const recordingsByDate = computed(() => {
    const grouped: { [date: string]: VoiceRecording[] } = {}
    recordings.value.forEach(recording => {
      const date = new Date(recording.createdAt).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(recording)
    })
    return grouped
  })

  const completedRecordings = computed(() => 
    recordings.value.filter(recording => recording.isProcessed)
  )

  const pendingRecordings = computed(() => 
    recordings.value.filter(recording => !recording.isProcessed)
  )

  const getRecordingById = computed(() => (id: string) => 
    recordings.value.find(recording => recording.id === id)
  )

  // Actions
  const loadRecordings = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      recordings.value = []
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/voice-recordings')
      recordings.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error loading recordings'
      recordings.value = []
    } finally {
      loading.value = false
    }
  }

  const addRecording = async (recordingData: CreateVoiceRecordingForm) => {
    loading.value = true
    error.value = null
    
    try {
      const formData = new FormData()
      formData.append('audio', recordingData.audioFile)
      formData.append('title', recordingData.title)
      formData.append('description', recordingData.description || '')
      formData.append('language', recordingData.language || 'auto')
      formData.append('duration', recordingData.duration?.toString() || '0')

      const response = await api.post('/voice-recordings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      recordings.value.unshift(response.data)
      
      return { success: true, recording: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error creating recording'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateRecording = async (id: string, recordingData: Partial<CreateVoiceRecordingForm>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/voice-recordings/${id}`, recordingData)
      const index = recordings.value.findIndex(recording => recording.id === id)
      if (index !== -1) {
        recordings.value[index] = response.data
      }
      
      return { success: true, recording: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error updating recording'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteRecording = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      await api.delete(`/voice-recordings/${id}`)
      recordings.value = recordings.value.filter(recording => recording.id !== id)
      
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error deleting recording'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const archiveRecording = async (id: string, archived: boolean) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.patch(`/voice-recordings/${id}/archive`, { archived })
      const index = recordings.value.findIndex(recording => recording.id === id)
      if (index !== -1) {
        recordings.value[index] = response.data
      }
      
      return { success: true, recording: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error archiving recording'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const processRecording = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post(`/voice-recordings/${id}/process`)
      const index = recordings.value.findIndex(recording => recording.id === id)
      if (index !== -1) {
        recordings.value[index] = response.data
      }
      
      return { success: true, recording: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error processing recording'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const searchRecordings = async (query: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/voice-recordings?search=${encodeURIComponent(query)}`)
      return { success: true, recordings: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error searching recordings'
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
    recordings,
    loading,
    error,
    
    // Getters
    recordingsByDate,
    completedRecordings,
    pendingRecordings,
    getRecordingById,
    
    // Actions
    loadRecordings,
    addRecording,
    updateRecording,
    deleteRecording,
    archiveRecording,
    processRecording,
    searchRecordings,
    clearError
  }
})
