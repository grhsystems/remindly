import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, CreateTaskForm, SearchResult } from '@/types'
import { api } from '@/utils/api'

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchResults = ref<SearchResult[]>([])

  // Getters
  const tasksByList = computed(() => {
    const grouped: { [listId: string]: Task[] } = {}
    tasks.value.forEach(task => {
      if (!grouped[task.listId]) {
        grouped[task.listId] = []
      }
      grouped[task.listId].push(task)
    })
    return grouped
  })

  const completedTasks = computed(() => 
    tasks.value.filter(task => task.completed)
  )

  const pendingTasks = computed(() => 
    tasks.value.filter(task => !task.completed)
  )

  const overdueTasks = computed(() => {
    const now = new Date()
    return tasks.value.filter(task => 
      !task.completed && 
      task.dueDate && 
      new Date(task.dueDate) < now
    )
  })

  const todayTasks = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.value.filter(task => 
      !task.completed && 
      task.dueDate === today
    )
  })

  const getTasksByListId = computed(() => (listId: string) => 
    tasks.value.filter(task => task.listId === listId)
  )

  const getTaskById = computed(() => (id: string) => 
    tasks.value.find(task => task.id === id)
  )

  // Actions
  const loadTasks = async () => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      tasks.value = []
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/tasks')
      tasks.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בטעינת המשימות'
      // Clear tasks on error
      tasks.value = []
    } finally {
      loading.value = false
    }
  }

  const loadTasksByList = async (listId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/lists/${listId}/tasks`)
      const listTasks = response.data
      
      // Update tasks in store
      tasks.value = tasks.value.filter(task => task.listId !== listId)
      tasks.value = [...tasks.value, ...listTasks]
      
      return { success: true, tasks: listTasks }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בטעינת משימות הרשימה'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const addTask = async (taskData: CreateTaskForm) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/tasks', taskData)
      tasks.value.push(response.data)
      
      return { success: true, task: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה ביצירת המשימה'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: string, taskData: Partial<CreateTaskForm>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put(`/tasks/${id}`, taskData)
      const index = tasks.value.findIndex(task => task.id === id)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      
      return { success: true, task: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בעדכון המשימה'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteTask = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      await api.delete(`/tasks/${id}`)
      tasks.value = tasks.value.filter(task => task.id !== id)
      
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה במחיקת המשימה'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    loading.value = true
    error.value = null
    
    try {
      const response = await api.patch(`/tasks/${id}/complete`, {
        completed: !task.completed
      })
      
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      
      return { success: true, task: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בעדכון סטטוס המשימה'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const reorderTasks = async (listId: string, reorderedTasks: Task[]) => {
    loading.value = true
    error.value = null
    
    try {
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        position: index
      }))
      
      await api.put('/tasks/reorder', { 
        listId,
        tasks: updates 
      })
      
      // Update tasks in store
      const otherTasks = tasks.value.filter(task => task.listId !== listId)
      tasks.value = [...otherTasks, ...reorderedTasks]
      
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בסידור המשימות'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const searchTasks = async (query: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/tasks/search?q=${encodeURIComponent(query)}`)
      searchResults.value = response.data
      
      return { success: true, results: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בחיפוש משימות'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const getTasksByPriority = async (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/tasks?priority=${priority}`)
      return { success: true, tasks: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בטעינת משימות לפי עדיפות'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const getTasksByDate = async (date: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/tasks?date=${date}`)
      return { success: true, tasks: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'שגיאה בטעינת משימות לפי תאריך'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const clearSearchResults = () => {
    searchResults.value = []
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    tasks,
    loading,
    error,
    searchResults,
    
    // Getters
    tasksByList,
    completedTasks,
    pendingTasks,
    overdueTasks,
    todayTasks,
    getTasksByListId,
    getTaskById,
    
    // Actions
    loadTasks,
    loadTasksByList,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    reorderTasks,
    searchTasks,
    getTasksByPriority,
    getTasksByDate,
    clearSearchResults,
    clearError
  }
})
