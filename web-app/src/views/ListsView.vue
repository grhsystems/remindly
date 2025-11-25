<template>
  <div class="lists-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <v-icon class="mr-2 header-icon">mdi-format-list-bulleted</v-icon>
        <h1 class="app-title">LISTS</h1>
        <p class="app-subtitle">Organize Your Tasks</p>
      </div>
    </div>

    <!-- Main Content -->
    <v-container fluid class="pa-4">
      <v-row>
        <v-col cols="12">
          <v-card class="lists-card" elevation="4">
            <v-card-text class="pa-6">
              <!-- Add New List Button -->
              <div class="add-list-section mb-6">
                <v-btn
                  color="primary"
                  size="large"
                  @click="createList"
                  class="add-list-button"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Create New List
                </v-btn>
              </div>
              <!-- Lists Grid -->
              <div v-if="lists.length > 0" class="lists-grid">
                <v-card
                  v-for="list in lists"
                  :key="list.id"
                  class="list-item"
                  elevation="2"
                  @click="openList(list)"
                >
                  <v-card-text class="pa-4">
                    <div class="list-header">
                      <v-icon :color="list.color" size="32" class="mr-3">{{ list.icon }}</v-icon>
                      <div class="list-info">
                        <h3 class="list-title">{{ list.name }}</h3>
                        <p class="list-description">{{ list.description || 'No description' }}</p>
                      </div>
                    </div>
                    <div class="list-stats">
                      <span class="task-count">{{ list.taskCount || 0 }} tasks</span>
                      <span class="list-date">{{ formatDate(list.updatedAt) }}</span>
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <!-- Empty State -->
              <div v-else class="empty-state">
                <v-icon size="80" color="grey" class="mb-4">mdi-format-list-bulleted</v-icon>
                <h3 class="empty-title">No Lists Yet</h3>
                <p class="empty-description">Create your first list to get started organizing your tasks</p>
                <v-btn
                  color="primary"
                  size="large"
                  @click="createList"
                  class="mt-4"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Create Your First List
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

// Mock data for now
const lists = ref([
  {
    id: '1',
    name: 'Work Tasks',
    description: 'Important work-related tasks',
    color: 'blue',
    icon: 'mdi-briefcase',
    taskCount: 5,
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Personal',
    description: 'Personal tasks and reminders',
    color: 'green',
    icon: 'mdi-account',
    taskCount: 3,
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Shopping',
    description: 'Grocery and shopping list',
    color: 'orange',
    icon: 'mdi-cart',
    taskCount: 8,
    updatedAt: new Date()
  }
])

const createList = () => {
  router.push('/lists/new')
}

const openList = (list: any) => {
  router.push(`/lists/${list.id}`)
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString()
}

const loadLists = async () => {
  try {
    // TODO: Implement API call to load lists
    console.log('Loading lists...')
  } catch (error) {
    console.error('Error loading lists:', error)
  }
}

onMounted(() => {
  loadLists()
})
</script>

<style scoped>
.lists-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #DDA0DD 100%);
  padding: 0;
}

.header-section {
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #DDA0DD 100%);
  padding: 2rem 1rem;
  text-align: center;
}

.header-content {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
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

.app-subtitle {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  letter-spacing: 2px;
  text-align: center;
}

.lists-card {
  border-radius: 16px;
  overflow: hidden;
}

.add-list-section {
  text-align: center;
}

.add-list-button {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 12px 32px;
  text-transform: none;
  letter-spacing: 1px;
}

.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.list-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.list-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.list-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.list-info {
  flex: 1;
}

.list-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.list-description {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.list-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 1rem;
  color: #666;
  margin: 0 0 2rem 0;
}

/* Responsive Design */
@media (max-width: 600px) {
  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }

  .lists-grid {
    grid-template-columns: 1fr;
  }
}
</style>
