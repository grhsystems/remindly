// User Types
export interface User {
  id: string
  email: string
  name: string
  language: 'he' | 'en'
  theme: 'light' | 'dark'
  createdAt: Date
  updatedAt: Date
}

// List Types
export interface List {
  id: string
  userId: string
  name: string
  description?: string
  icon: string
  color: string
  position: number
  createdAt: Date
  updatedAt: Date
}

// Task Types
export interface Task {
  id: string
  listId: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  dueTime?: string
  completed: boolean
  position: number
  createdAt: Date
  updatedAt: Date
}

// Reminder Types
export interface Reminder {
  id: string
  taskId: string
  reminderTime: string
  reminderType: 'push' | 'sms' | 'email' | 'call'
  sent: boolean
  createdAt: Date
}

// Shopping Item Types
export interface ShoppingItem {
  id: string
  listId: string
  productName: string
  quantity: number
  price?: number
  checked: boolean
  position: number
  createdAt: Date
  updatedAt: Date
}

// AI Processing Types
export interface AIProcessedText {
  taskType: 'shopping' | 'call' | 'meeting' | 'appointment' | 'repair' | 'general'
  title: string
  description?: string
  dueDate?: string
  dueTime?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  items?: string[]
  contactName?: string
  location?: string
}

// Voice Recording Types
export interface VoiceRecording {
  id: string
  userId: string
  title: string
  description?: string
  audioUrl: string
  duration: number
  fileSize: number
  transcription?: string
  isProcessed: boolean
  isTranscribed: boolean
  language: 'he' | 'en' | 'auto'
  tags: string[]
  metadata: any
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateVoiceRecordingForm {
  title: string
  description?: string
  audioFile: File
  duration?: number
  language?: 'he' | 'en' | 'auto'
  tags?: string[]
}

// Media Gallery Types
export interface MediaGallery {
  id: string
  userId: string
  title: string
  description?: string
  mediaType: 'image' | 'video' | 'audio'
  fileUrl: string
  thumbnailUrl?: string
  fileSize: number
  duration: number
  dimensions: {
    width: number
    height: number
  }
  metadata: any
  tags: string[]
  isPublic: boolean
  isArchived: boolean
  viewCount: number
  shareCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateMediaGalleryForm {
  title: string
  description?: string
  file: File
  mediaType: 'image' | 'video' | 'audio'
  tags?: string[]
  isPublic?: boolean
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: 'task_reminder' | 'list_shared' | 'voice_processed' | 'price_updated'
  title: string
  message: string
  read: boolean
  data?: any
  createdAt: Date
}

// Search Types
export interface SearchResult {
  type: 'task' | 'list' | 'shopping_item'
  id: string
  title: string
  description?: string
  listName?: string
  relevance: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination Types
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface CreateListForm {
  name: string
  description?: string
  icon: string
  color: string
}

export interface CreateTaskForm {
  title: string
  description?: string
  listId: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  dueTime?: string
}

export interface CreateShoppingItemForm {
  productName: string
  quantity: number
  price?: number
}

// Settings Types
export interface UserSettings {
  language: 'he' | 'en'
  theme: 'light' | 'dark'
  notifications: {
    push: boolean
    sms: boolean
    email: boolean
    call: boolean
  }
  reminders: {
    defaultTime: number // minutes before due time
    maxReminders: number
  }
  voice: {
    autoProcess: boolean
    language: 'he' | 'en'
  }
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Store Types
export interface ListState {
  lists: List[]
  loading: boolean
  error: string | null
}

export interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
}

export interface UserState {
  user: User | null
  settings: UserSettings | null
  loading: boolean
  error: string | null
}

// Component Props Types
export interface ListCardProps {
  list: List
  taskCount?: number
  completedCount?: number
}

export interface TaskItemProps {
  task: Task
  showList?: boolean
}

export interface ShoppingItemProps {
  item: ShoppingItem
  onUpdate: (item: ShoppingItem) => void
  onDelete: (id: string) => void
}

// Event Types
export interface TaskCreatedEvent {
  task: Task
  list: List
}

export interface TaskCompletedEvent {
  task: Task
  completed: boolean
}

export interface ListCreatedEvent {
  list: List
}

export interface VoiceProcessedEvent {
  recording: VoiceRecording
  processedText: string
  aiProcessed: AIProcessedText
}
