<template>
  <div class="home-view">
    <!-- Only show content if user is authenticated -->
    <div v-if="userStore.isAuthenticated">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="app-title-container">
            <img src="/LogoRemindly.png" alt="Remindly Logo" class="app-logo" />
            <h1 class="app-title">REMINDLY</h1>
          </div>
          <p class="app-subtitle">ORGANIZE. REMEMBER. ACHIEVE</p>
        </div>
      </div>

      <!-- Main Cards Grid -->
      <v-container fluid class="pa-4">
        <v-row>
          <!-- Shopping Lists Card -->
          <v-col cols="12" sm="6" class="mb-4">
            <v-card class="category-card shopping-card" elevation="4" @click="navigateToShoppingLists">
              <v-card-text class="pa-6">
                <div class="card-content">
                  <v-icon size="48" color="white" class="mb-3">mdi-cart-outline</v-icon>
                  <h3 class="card-title">Shopping Lists</h3>
                  <p class="card-description">Milk, Eggs, Bread... Grocery Store</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Appointments Card -->
          <v-col cols="12" sm="6" class="mb-4">
            <v-card class="category-card appointments-card" elevation="4" @click="navigateToAppointmentLists">
              <v-card-text class="pa-6">
                <div class="card-content">
                  <v-icon size="48" color="white" class="mb-3">mdi-calendar</v-icon>
                  <h3 class="card-title">Appointments</h3>
                  <p class="card-description">Dentist (Mon, 10 AM), Meeting...</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- TO-DOs Card -->
          <v-col cols="12" sm="6" class="mb-4">
            <v-card class="category-card todos-card" elevation="4" @click="navigateToTasksLists">
              <v-card-text class="pa-6">
                <div class="card-content">
                  <v-icon size="48" color="white" class="mb-3">mdi-checkbox-marked-circle-outline</v-icon>
                  <h3 class="card-title">TO-DOs</h3>
                  <p class="card-description">Finish Project X, Call Ban</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- IDEAS Card -->
          <v-col cols="12" sm="6" class="mb-4">
            <v-card class="category-card ideas-card" elevation="4" @click="navigateToIdeasLists">
              <v-card-text class="pa-6">
                <div class="card-content">
                  <v-icon size="48" color="white" class="mb-3">mdi-lightbulb-outline</v-icon>
                  <h3 class="card-title">IDEAS</h3>
                  <p class="card-description">New App Features, Travel Ideas</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- VOICE MEMOS Card -->
          <v-col cols="12" sm="6" class="mb-4">
            <v-card class="category-card voice-card" elevation="4" @click="navigateToVoice">
              <v-card-text class="pa-6">
                <div class="card-content">
                  <v-icon size="48" color="white" class="mb-3">mdi-microphone</v-icon>
                  <h3 class="card-title">VOICE MEMOS</h3>
                  <p class="card-description">Quick Thoughts, Audio Notes</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- MEDIA GALLERY Card -->
          <v-col cols="12" sm="6" class="mb-4">
            <v-card class="category-card media-card" elevation="4" @click="navigateToMediaGallery">
              <v-card-text class="pa-6">
                <div class="card-content">
                  <v-icon size="48" color="white" class="mb-3">mdi-photo-library</v-icon>
                  <h3 class="card-title">MEDIA GALLERY</h3>
                  <p class="card-description">Photos & Videos, Capture & Share</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

      </v-container>

      <!-- Footer with Add Button -->
      <div class="footer-section">
        <div class="footer-content">
          <v-btn
            class="add-button"
            color="primary"
            size="large"
            rounded
            elevation="8"
            @click="showAddTaskDialog = true"
          >
            <v-icon start>mdi-plus</v-icon>
            Add New Item
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Show login message if not authenticated -->
    <div v-else class="login-message">
      <div class="login-content">
        <v-icon size="80" color="white" class="mb-4">mdi-bell-outline</v-icon>
        <h1 class="login-title">ברוכים הבאים ל-REMINDLY</h1>
        <p class="login-subtitle">התחברו כדי להתחיל לנהל את המשימות שלכם</p>
        <v-btn color="white" size="large" @click="$router.push('/login')" class="login-button">
          התחבר עכשיו
        </v-btn>
      </div>
    </div>

    <!-- Add Task Dialog -->
    <v-dialog v-model="showAddTaskDialog" max-width="600">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ $t('tasks.addTask') }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="addTaskForm" v-model="formValid">
            <v-text-field v-model="newTask.title" :label="$t('tasks.taskTitle')" :rules="[rules.required]" required />

            <v-textarea v-model="newTask.description" :label="$t('tasks.taskDescription')" rows="3" />

            <v-select v-model="newTask.listId" :items="availableLists" :item-title="'name'" :item-value="'id'"
              :label="$t('lists.title')" :rules="[rules.required]" required />

            <v-row>
              <v-col cols="6">
                <v-text-field v-model="newTask.dueDate" type="date" :label="$t('tasks.dueDate')" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="newTask.dueTime" type="time" :label="$t('tasks.dueTime')" />
              </v-col>
            </v-row>

            <v-select v-model="newTask.priority" :items="priorityOptions" :item-title="'text'" :item-value="'value'"
              :label="$t('tasks.priority')" />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="cancelAddTask">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn color="primary" :disabled="!formValid" @click="addTask">
            {{ $t('common.add') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useListStore } from '@/stores/listStore'
import { useUserStore } from '@/stores/userStore'
import type { CreateTaskForm } from '@/types'

const router = useRouter()
const taskStore = useTaskStore()
const listStore = useListStore()
const userStore = useUserStore()

// Reactive data
const showAddTaskDialog = ref(false)
const formValid = ref(false)

const newTask = ref<CreateTaskForm>({
  title: '',
  description: '',
  listId: '',
  priority: 'medium',
  dueDate: '',
  dueTime: ''
})

// Computed properties
const user = computed(() => userStore.user)
const lists = computed(() => listStore.lists)
const tasks = computed(() => taskStore.tasks)
const todayTasks = computed(() => taskStore.todayTasks)
const pendingTasksCount = computed(() => taskStore.pendingTasks.length)
const completedTasksCount = computed(() => taskStore.completedTasks.length)
const overdueTasksCount = computed(() => taskStore.overdueTasks.length)
const listsCount = computed(() => lists.value.length)

const defaultLists = computed(() => {
  const defaultListNames = ['משימות', 'קניות', 'שיחות טלפון', 'פגישות', 'תורים', 'תיקונים']
  return lists.value.filter(list => defaultListNames.includes(list.name))
})

const availableLists = computed(() =>
  lists.value.map(list => ({
    id: list.id,
    name: list.name
  }))
)

const priorityOptions = computed(() => [
  { text: 'נמוכה', value: 'low' },
  { text: 'בינונית', value: 'medium' },
  { text: 'גבוהה', value: 'high' },
  { text: 'דחוף', value: 'urgent' }
])

// Validation rules
const rules = {
  required: (value: any) => !!value || 'שדה חובה'
}

// Methods
const navigateToShopping = () => {
  router.push('/shopping')
}

const navigateToShoppingLists = () => {
  router.push('/shopping-lists')
}

const navigateToAppointments = () => {
  router.push('/appointments')
}

const navigateToAppointmentLists = () => {
  router.push('/appointment-lists')
}

const navigateToTasks = () => {
  router.push('/tasks')
}

const navigateToTasksLists = () => {
  router.push('/tasks-lists')
}

const navigateToIdeas = () => {
  router.push('/lists')
}

const navigateToIdeasLists = () => {
  router.push('/ideas-lists')
}

const navigateToVoice = () => {
  router.push('/voice')
}

const navigateToMediaGallery = () => {
  router.push('/media-gallery')
}

const addTask = async () => {
  if (formValid.value) {
    const result = await taskStore.addTask(newTask.value)
    if (result.success) {
      showAddTaskDialog.value = false
      resetForm()
    }
  }
}

const cancelAddTask = () => {
  showAddTaskDialog.value = false
  resetForm()
}

const resetForm = () => {
  newTask.value = {
    title: '',
    description: '',
    listId: '',
    priority: 'medium',
    dueDate: '',
    dueTime: ''
  }
}

onMounted(() => {
  // Load data if not already loaded
  if (lists.value.length === 0) {
    listStore.loadLists()
  }
  if (tasks.value.length === 0) {
    taskStore.loadTasks()
  }
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #DDA0DD 100%);
  padding: 0;
}

        .header-section {
          background: linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #DDA0DD 100%);
          padding: 3rem 1rem 2rem 1rem;
          text-align: center;
          margin-top: 32px; /* Reduced margin to bring closer to App Bar */
        }

.header-content {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.app-title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.app-logo {
  width: 60px;
  height: 60px;
  margin-right: 1rem;
  object-fit: contain;
}

/* Responsive logo for mobile */
@media (max-width: 768px) {
  .app-logo {
    width: 40px;
    height: 40px;
    margin-right: 0.5rem;
  }
}

@media (max-width: 480px) {
  .app-logo {
    width: 30px;
    height: 30px;
    margin-right: 0.25rem;
  }
}

.header-icon {
  color: white;
  font-size: 2rem;
}

.app-title {
  font-size: 3rem;
  font-weight: 900;
  color: #2c3e50;
  margin: 0;
  letter-spacing: 3px;
  text-align: center;
}

/* Responsive title for mobile */
@media (max-width: 768px) {
  .app-title {
    font-size: 2.2rem;
    letter-spacing: 2px;
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 1.8rem;
    letter-spacing: 1px;
  }
}

.app-subtitle {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  letter-spacing: 2px;
  text-align: center;
}

.category-card {
  height: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  position: relative;
  z-index: 2;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-item {
  display: flex;
  align-items: center;
}

.card-text {
  font-size: 0.9rem;
  color: #2c3e50;
  margin: 0;
}

/* Card Colors */
.shopping-card {
  background: #E3F2FD;
}

.appointments-card {
  background: #E8F5E8;
}

.todos-card {
  background: #FCE4EC;
}

.ideas-card {
  background: #FFF8E1;
}

.voice-card {
  background: #E8F5E8;
}

.media-card {
  background: #F3E5F5;
}

/* Footer Styles */
.footer-section {
  background: linear-gradient(135deg, #1976D2 0%, #42A5F5 100%);
  padding: 2rem 0;
  margin-top: 2rem;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-button {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 12px 32px;
  text-transform: none;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* Responsive Design */
@media (max-width: 600px) {
  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 0.9rem;
  }

  .category-card {
    height: 180px;
  }

  .card-title {
    font-size: 1.3rem;
  }

  .card-description {
    font-size: 0.8rem;
  }
}

/* Animation for cards */
.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover::before {
  opacity: 1;
}

/* Icon animation */
.category-card .v-icon {
  transition: transform 0.3s ease;
}

.category-card:hover .v-icon {
  transform: scale(1.1);
}

/* Login Message Styling */
.login-message {
  min-height: 100vh;
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #DDA0DD 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-content {
  text-align: center;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  letter-spacing: 2px;
}

.login-subtitle {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0 0 2rem 0;
  opacity: 0.8;
}

.login-button {
  color: #2c3e50 !important;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 1px;
  padding: 12px 32px;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* Responsive Design */
@media (max-width: 600px) {
  .header-section {
    margin-top: 24px; /* Reduced margin for mobile to bring closer to App Bar */
    padding: 2.5rem 1rem 1.5rem 1rem;
  }

  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }

  .login-content {
    padding: 2rem 1rem;
    margin: 1rem;
  }

  .login-title {
    font-size: 2rem;
  }

  .login-subtitle {
    font-size: 1rem;
  }
}
</style>
