import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { List, CreateListForm } from '@/types'
import { api } from '@/utils/api'

export const useListStore = defineStore('list', () => {
  // State
  const lists = ref<List[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const listsByType = computed(() => {
    const categorized = {
      tasks: lists.value.find(l => l.name === 'משימות') || null,
      shopping: lists.value.find(l => l.name === 'קניות') || null,
      calls: lists.value.find(l => l.name === 'שיחות טלפון') || null,
      meetings: lists.value.find(l => l.name === 'פגישות') || null,
      appointments: lists.value.find(l => l.name === 'תורים') || null,
      repairs: lists.value.find(l => l.name === 'תיקונים') || null,
      custom: lists.value.filter(l => 
        !['משימות', 'קניות', 'שיחות טלפון', 'פגישות', 'תורים', 'תיקונים'].includes(l.name)
      )
    }
    return categorized
  })

  const getListById = computed(() => (id: string) => 
    lists.value.find(list => list.id === id)
  )

  // Actions
  const loadLists = async () => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      lists.value = []
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/lists')
      lists.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בטעינת הרשימות'
      // Clear lists on error
      lists.value = []
    } finally {
      loading.value = false
    }
  }

  const createList = async (listData: CreateListForm) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/lists', listData)
      lists.value.push(response.data)
      
      return { success: true, list: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה ביצירת הרשימה'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateList = async (id: string, listData: Partial<CreateListForm>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/lists/${id}`, listData)
      const index = lists.value.findIndex(list => list.id === id)
      if (index !== -1) {
        lists.value[index] = response.data
      }
      
      return { success: true, list: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בעדכון הרשימה'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteList = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      await api.delete(`/lists/${id}`)
      lists.value = lists.value.filter(list => list.id !== id)
      
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה במחיקת הרשימה'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const reorderLists = async (reorderedLists: List[]) => {
    loading.value = true
    error.value = null
    
    try {
      const updates = reorderedLists.map((list, index) => ({
        id: list.id,
        position: index
      }))
      
      await api.put('/lists/reorder', { lists: updates })
      lists.value = reorderedLists
      
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בסידור הרשימות'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const createDefaultLists = async () => {
    const defaultLists = [
      {
        name: 'משימות',
        description: 'משימות כלליות',
        icon: 'mdi-format-list-checks',
        color: '#1976d2'
      },
      {
        name: 'קניות',
        description: 'רשימת מוצרים לקנייה',
        icon: 'mdi-cart',
        color: '#4caf50'
      },
      {
        name: 'שיחות טלפון',
        description: 'אנשים להתקשר אליהם',
        icon: 'mdi-phone',
        color: '#ff9800'
      },
      {
        name: 'פגישות',
        description: 'פגישות ואירועים',
        icon: 'mdi-calendar',
        color: '#9c27b0'
      },
      {
        name: 'תורים',
        description: 'תורים לרופאים וטיפולים',
        icon: 'mdi-hospital',
        color: '#f44336'
      },
      {
        name: 'תיקונים',
        description: 'דברים שצריך לתקן',
        icon: 'mdi-wrench',
        color: '#607d8b'
      }
    ]

    loading.value = true
    error.value = null
    
    try {
      const promises = defaultLists.map(listData => 
        api.post('/lists', listData)
      )
      
      const responses = await Promise.all(promises)
      const newLists = responses.map(response => response.data)
      
      lists.value = [...lists.value, ...newLists]
      
      return { success: true, lists: newLists }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה ביצירת הרשימות המוגדרות'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const searchLists = async (query: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/lists/search?q=${encodeURIComponent(query)}`)
      return { success: true, results: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בחיפוש רשימות'
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
    lists,
    loading,
    error,
    
    // Getters
    listsByType,
    getListById,
    
    // Actions
    loadLists,
    createList,
    updateList,
    deleteList,
    reorderLists,
    createDefaultLists,
    searchLists,
    clearError
  }
})
