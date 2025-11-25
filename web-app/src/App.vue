<template>
  <v-app>
    <!-- Loading overlay -->
    <v-overlay v-model="isLoading" class="align-center justify-center" persistent>
      <div class="text-center">
        <v-progress-circular color="primary" indeterminate size="64" class="mb-4" />
        <div class="text-h6">טוען...</div>
      </div>
    </v-overlay>

    <!-- App Bar - only show when authenticated -->
    <v-app-bar v-if="userStore.isAuthenticated" :elevation="0" class="custom-app-bar" app>
      <v-container class="pa-0" fluid>
        <v-row align="center" no-gutters>
          <!-- Left side - Menu and Logo -->
          <v-col cols="auto" class="mr-4">
            <v-btn icon variant="text" @click="drawer = !drawer" class="menu-btn">
              <v-icon size="24">mdi-menu</v-icon>
            </v-btn>
          </v-col>

          <v-col cols="auto" class="mr-6">
            <div class="logo-section" @click="$router.push('/')">
              <img src="/LogoRemindly.png" alt="Remindly Logo" class="app-bar-logo" />
              <span class="logo-text">REMINDLY</span>
            </div>
          </v-col>

          <v-spacer />

          <!-- Center - Search -->
          <v-col cols="12" md="4" class="px-4">
            <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify"
              :placeholder="userStore.userLanguage === 'he' ? 'חיפוש...' : 'Search...'" hide-details single-line
              clearable variant="outlined" density="compact" class="search-field" @input="handleSearch" />
          </v-col>

          <v-spacer />

          <!-- Right side - Action buttons -->
          <v-col cols="auto" class="d-flex align-center">
            <!-- Home Button -->
            <v-btn icon variant="text" @click="$router.push('/')" class="action-btn"
              :title="userStore.userLanguage === 'he' ? 'דף הבית' : 'Home'">
              <v-icon size="20">mdi-home</v-icon>
            </v-btn>

            <!-- Voice Recording -->
            <v-btn icon variant="text" @click="startVoiceRecording" :loading="isRecording" class="action-btn"
              :title="userStore.userLanguage === 'he' ? 'הקלטה קולית' : 'Voice Recording'">
              <v-icon size="20">mdi-microphone</v-icon>
            </v-btn>

            <!-- Notifications -->
            <v-btn icon variant="text" class="action-btn"
              :title="userStore.userLanguage === 'he' ? 'התראות' : 'Notifications'">
              <v-badge :content="unreadNotifications" :value="unreadNotifications > 0" color="error" size="small">
                <v-icon size="20">mdi-bell</v-icon>
              </v-badge>
            </v-btn>

            <!-- Language Toggle -->
            <v-btn icon variant="text" @click="toggleLanguage" class="action-btn"
              :title="userStore.userLanguage === 'he' ? 'החלף לאנגלית' : 'Switch to Hebrew'">
              <v-icon size="20">{{ userStore.userLanguage === 'he' ? 'mdi-flag' : 'mdi-flag' }}</v-icon>
            </v-btn>

            <!-- Settings -->
            <v-btn icon variant="text" @click="$router.push('/settings')" class="action-btn"
              :title="userStore.userLanguage === 'he' ? 'הגדרות' : 'Settings'">
              <v-icon size="20">mdi-cog</v-icon>
            </v-btn>

            <!-- Logout -->
            <v-btn icon variant="text" @click="handleLogout" class="action-btn logout-btn"
              :title="userStore.userLanguage === 'he' ? 'התנתק' : 'Logout'">
              <v-icon size="20">mdi-logout</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <!-- Simple header for login/register pages -->
    <v-app-bar v-else :elevation="0" class="simple-app-bar" app>
      <v-container class="pa-0" fluid>
        <v-row align="center" no-gutters>
          <v-col cols="auto">
            <div class="simple-logo-section">
              <v-icon class="mr-2 simple-logo-icon">mdi-bell-outline</v-icon>
              <span class="simple-logo-text">REMINDLY</span>
            </div>
          </v-col>
          <v-spacer />
          <v-col cols="auto">
            <v-btn color="white" variant="outlined" @click="$router.push('/login')" class="login-btn">
              התחבר
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <!-- Navigation Drawer - only show when authenticated -->
    <v-navigation-drawer v-if="userStore.isAuthenticated" v-model="drawer" app temporary :width="280">
      <v-list>
        <v-list-item v-for="(item, index) in navigationItems" :key="index" :to="item.to" :prepend-icon="item.icon"
          :title="item.title" :subtitle="item.subtitle" @click="drawer = false" />
      </v-list>

      <template v-slot:append>
        <v-divider />
        <v-list>
          <v-list-item prepend-icon="mdi-plus" title="רשימה חדשה" @click="createNewList" />
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="main-content">
      <router-view />
    </v-main>

    <!-- Floating Action Button - only show when authenticated -->
    <v-fab v-if="userStore.isAuthenticated" icon="mdi-plus" color="primary" size="large" location="bottom end"
      @click="showAddTaskDialog = true" />

    <!-- Add Task Dialog - only show when authenticated -->
    <v-dialog v-if="userStore.isAuthenticated" v-model="showAddTaskDialog" max-width="600">
      <v-card>
        <v-card-title>
          <span class="text-h5">הוספת משימה חדשה</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="addTaskForm">
            <v-text-field v-model="newTask.title" label="כותרת המשימה" required />

            <v-textarea v-model="newTask.description" label="תיאור (אופציונלי)" rows="3" />

            <v-select v-model="newTask.listId" :items="availableLists" item-title="name" item-value="id" label="רשימה"
              required />

            <v-row>
              <v-col cols="6">
                <v-text-field v-model="newTask.dueDate" type="date" label="תאריך יעד" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="newTask.dueTime" type="time" label="שעה" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showAddTaskDialog = false">
            ביטול
          </v-btn>
          <v-btn color="primary" @click="addTask">
            הוספה
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Voice Recording Dialog - only show when authenticated -->
    <v-dialog v-if="userStore.isAuthenticated" v-model="showVoiceDialog" max-width="400">
      <v-card>
        <v-card-title class="text-center">
          הקלטה קולית
        </v-card-title>

        <v-card-text class="text-center">
          <v-btn :color="isRecording ? 'error' : 'primary'" :icon="isRecording ? 'mdi-stop' : 'mdi-microphone'"
            size="x-large" @click="toggleRecording" />

          <div class="mt-4">
            <p v-if="!isRecording">לחץ על הכפתור כדי להתחיל להקליט</p>
            <p v-else class="text-error">מקליט... לחץ שוב כדי לעצור</p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useListStore } from '@/stores/listStore'
import { useUserStore } from '@/stores/userStore'
import { useVoiceRecordingStore } from '@/stores/voiceRecordingStore'

const router = useRouter()
const taskStore = useTaskStore()
const listStore = useListStore()
const userStore = useUserStore()
const voiceRecordingStore = useVoiceRecordingStore()

// Reactive data
const drawer = ref(false)
const searchQuery = ref('')
const showAddTaskDialog = ref(false)
const showVoiceDialog = ref(false)
const isRecording = ref(false)
const unreadNotifications = ref(0)
const isLoading = ref(true)

const newTask = ref({
  title: '',
  description: '',
  listId: '',
  dueDate: '',
  dueTime: ''
})

// Navigation items
const navigationItems = computed(() => [
  {
    title: 'דף הבית',
    subtitle: 'סקירה כללית',
    icon: 'mdi-home',
    to: '/'
  },
  {
    title: 'כל המשימות',
    subtitle: 'משימות מכל הרשימות',
    icon: 'mdi-format-list-checks',
    to: '/tasks'
  },
  {
    title: 'רשימת קניות',
    subtitle: 'מוצרים לקנייה',
    icon: 'mdi-cart',
    to: '/shopping'
  },
  {
    title: 'שיחות טלפון',
    subtitle: 'אנשים להתקשר אליהם',
    icon: 'mdi-phone',
    to: '/calls'
  },
  {
    title: 'פגישות',
    subtitle: 'פגישות ואירועים',
    icon: 'mdi-calendar',
    to: '/meetings'
  },
  {
    title: 'תורים',
    subtitle: 'תורים לרופאים וטיפולים',
    icon: 'mdi-hospital',
    to: '/appointments'
  },
  {
    title: 'תיקונים',
    subtitle: 'דברים שצריך לתקן',
    icon: 'mdi-wrench',
    to: '/repairs'
  }
])

const availableLists = computed(() => listStore.lists)

// Methods
const handleSearch = () => {
  // Implement search functionality
  console.log('Searching for:', searchQuery.value)
}

const startVoiceRecording = () => {
  // Navigate to voice memos page instead of showing dialog
  router.push('/voice')
}

const toggleRecording = () => {
  if (isRecording.value) {
    // Stop recording and process
    isRecording.value = false
    showVoiceDialog.value = false
    // Process the recorded audio
    processVoiceRecording()
  } else {
    // Start recording
    isRecording.value = true
    // Start recording logic here
  }
}

const processVoiceRecording = async () => {
  try {
    // Create a new voice recording
    const newRecording = {
      title: `Recording ${new Date().toLocaleString()}`,
      description: 'Voice memo from app bar',
      duration: 30, // Mock duration
      audioUrl: '/audio/new-recording.mp3',
      isProcessed: false
    }
    
    // Save to voice recording store
    await voiceRecordingStore.createRecording(newRecording)
    
    // Show success message
    console.log('Voice recording saved successfully!')
    
    // Navigate to voice memos page to see the new recording
    router.push('/voice')
  } catch (error) {
    console.error('Error processing voice recording:', error)
  }
}

const createNewList = () => {
  // Navigate to create new list page
  router.push('/lists/new')
}

const toggleLanguage = async () => {
  const newLanguage = userStore.userLanguage === 'he' ? 'en' : 'he'
  await userStore.updateProfile({ language: newLanguage })
}

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}

const addTask = async () => {
  if (newTask.value.title && newTask.value.listId) {
    await taskStore.addTask({
      title: newTask.value.title,
      description: newTask.value.description,
      listId: newTask.value.listId,
      priority: 'medium',
      dueDate: newTask.value.dueDate,
      dueTime: newTask.value.dueTime
    })

    // Reset form
    newTask.value = {
      title: '',
      description: '',
      listId: '',
      dueDate: '',
      dueTime: ''
    }

    showAddTaskDialog.value = false
  }
}

onMounted(async () => {
  try {
    // Load user data first
    await userStore.loadUser()

    // Only load data if user is authenticated
    if (userStore.isAuthenticated) {
      await Promise.all([
        listStore.loadLists(),
        taskStore.loadTasks()
      ])
    }
  } catch (error) {
    console.error('Error loading initial data:', error)
  } finally {
    // Always hide loading after 1 second minimum
    setTimeout(() => {
      isLoading.value = false
    }, 1000)
  }
})
</script>

<style scoped>
/* Custom App Bar Styling */
.custom-app-bar {
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #DDA0DD 100%) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0 16px;
  position: relative;
  z-index: 1000;
}

.logo-section {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 8px;
}

.logo-section:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.app-bar-logo {
  width: 32px;
  height: 32px;
  margin-right: 8px;
  object-fit: contain;
}

/* Responsive app bar logo for mobile */
@media (max-width: 768px) {
  .app-bar-logo {
    width: 24px;
    height: 24px;
    margin-right: 6px;
  }
}

@media (max-width: 480px) {
  .app-bar-logo {
    width: 20px;
    height: 20px;
    margin-right: 4px;
  }
}

.logo-icon {
  color: #2c3e50;
  font-size: 24px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 900;
  color: #2c3e50;
  letter-spacing: 1px;
}

/* Responsive logo text for mobile */
@media (max-width: 768px) {
  .logo-text {
    font-size: 1.2rem;
    letter-spacing: 0.5px;
  }
}

@media (max-width: 480px) {
  .logo-text {
    font-size: 1rem;
    letter-spacing: 0px;
  }
}

.menu-btn {
  color: #2c3e50 !important;
  transition: all 0.3s ease;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: scale(1.05);
}

.search-field {
  max-width: 400px;
  min-width: 200px;
}

.search-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 12px !important;
}

.search-field :deep(.v-field__input) {
  color: #2c3e50 !important;
  font-weight: 500;
}

.search-field :deep(.v-field__input::placeholder) {
  color: rgba(44, 62, 80, 0.7) !important;
}

.action-btn {
  color: #2c3e50 !important;
  margin: 0 4px;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logout-btn:hover {
  background: rgba(244, 67, 54, 0.1) !important;
  color: #f44336 !important;
}

/* Responsive Design */
@media (max-width: 960px) {
  .search-field {
    max-width: 250px;
    min-width: 150px;
  }

  .logo-text {
    font-size: 1.3rem;
  }

  .action-btn {
    margin: 0 2px;
  }
}

@media (max-width: 600px) {
  .custom-app-bar {
    padding: 0 8px;
  }

  .search-field {
    max-width: 200px;
    min-width: 120px;
  }

  .logo-text {
    font-size: 1.1rem;
  }

  .logo-icon {
    font-size: 20px;
  }

  .action-btn {
    margin: 0 1px;
    min-width: 36px;
  }
}

/* FAB Styling */
.v-fab {
  margin: 16px;
  background: linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%) !important;
  box-shadow: 0 8px 25px rgba(79, 195, 247, 0.4) !important;
  transition: all 0.3s ease;
}

.v-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(79, 195, 247, 0.6) !important;
}

/* Language Toggle Icon */
.action-btn .v-icon {
  transition: all 0.3s ease;
}

.action-btn:hover .v-icon {
  transform: scale(1.1);
}

/* Badge Styling */
.v-badge .v-badge__badge {
  font-size: 10px;
  font-weight: 600;
}

/* Container Padding */
.custom-app-bar .v-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Smooth Transitions */
.custom-app-bar * {
  transition: all 0.3s ease;
}

/* Focus States */
.action-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.search-field:focus-within {
  transform: scale(1.02);
}

/* Main Content Styling */
.main-content {
  padding-top: 0 !important;
  min-height: calc(100vh - 64px);
  background: transparent;
}

/* Ensure content is visible */
.v-main__wrap {
  background: transparent;
}

/* Simple App Bar Styling */
.simple-app-bar {
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #DDA0DD 100%) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0 16px;
  position: relative;
  z-index: 1000;
}

.simple-logo-section {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 8px;
}

.simple-logo-section:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.simple-logo-icon {
  color: #2c3e50;
  font-size: 24px;
}

.simple-logo-text {
  font-size: 1.5rem;
  font-weight: 900;
  color: #2c3e50;
  letter-spacing: 1px;
}

.login-btn {
  color: #2c3e50 !important;
  border-color: #2c3e50 !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: rgba(44, 62, 80, 0.1) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
