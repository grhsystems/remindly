<template>
  <div class="tasks-lists-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <v-icon class="mr-2 header-icon">mdi-checkbox-marked-circle-outline</v-icon>
        <h1 class="app-title">TO-DO LISTS</h1>
        <p class="app-subtitle">Organize Your Tasks & Projects</p>
      </div>
    </div>

    <!-- Main Content -->
    <v-container fluid class="pa-4">
      <v-row>
        <v-col cols="12">
          <v-card class="tasks-lists-card" elevation="4">
            <v-card-text class="pa-6">
              <!-- Add New List Button -->
              <div class="add-list-section mb-6">
                <v-btn
                  color="primary"
                  size="large"
                  @click="showCreateListDialog = true"
                  class="add-list-button"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Create New TO-DO List
                </v-btn>
              </div>

              <!-- Lists Grid -->
              <div v-if="toDoLists.length > 0" class="lists-grid">
                <v-card
                  v-for="list in toDoLists"
                  :key="list.id"
                  class="list-item"
                  elevation="2"
                  @click="openToDoList(list)"
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
                <v-icon size="80" color="grey" class="mb-4">mdi-checkbox-marked-circle-outline</v-icon>
                <h3 class="empty-title">No TO-DO Lists Yet</h3>
                <p class="empty-description">Create your first TO-DO list to get started organizing your tasks</p>
                <v-btn
                  color="primary"
                  size="large"
                  @click="showCreateListDialog = true"
                  class="mt-4"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Create Your First TO-DO List
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Create New List Dialog -->
      <v-dialog v-model="showCreateListDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h5">Create New TO-DO List</v-card-title>
          <v-card-text>
            <v-form ref="createListForm" v-model="createListFormValid">
              <v-text-field
                v-model="newToDoList.name"
                label="List Name"
                :rules="[rules.required]"
                required
                class="mb-4"
              />
              <v-textarea
                v-model="newToDoList.description"
                label="Description (Optional)"
                rows="3"
                class="mb-4"
              />
              <v-select
                v-model="newToDoList.icon"
                :items="availableIcons"
                label="Icon"
                item-title="name"
                item-value="icon"
                :rules="[rules.required]"
                required
                class="mb-4"
              >
                <template v-slot:selection="{ item }">
                  <v-icon :color="item.raw.color" class="mr-2">{{ item.raw.icon }}</v-icon>
                  {{ item.raw.name }}
                </template>
                <template v-slot:item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon :color="item.raw.color">{{ item.raw.icon }}</v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
              <v-color-picker
                v-model="newToDoList.color"
                hide-canvas
                hide-inputs
                hide-sliders
                show-swatches
                class="mx-auto"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="showCreateListDialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="saveNewToDoList" :disabled="!createListFormValid">Create</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const showCreateListDialog = ref(false)
const createListFormValid = ref(false)
const newToDoList = ref({
  name: '',
  description: '',
  icon: 'mdi-checkbox-marked-circle-outline',
  color: '#E91E63', // Default color for TO-DOs
})

const availableIcons = [
  { name: 'Tasks', icon: 'mdi-checkbox-marked-circle-outline', color: '#E91E63' },
  { name: 'Work', icon: 'mdi-briefcase', color: '#2196F3' },
  { name: 'Personal', icon: 'mdi-account', color: '#4CAF50' },
  { name: 'Home', icon: 'mdi-home', color: '#FFC107' },
  { name: 'Study', icon: 'mdi-book-open-variant', color: '#9C27B0' },
  { name: 'Health', icon: 'mdi-heart-pulse', color: '#F44336' },
]

// Mock data for now
const toDoLists = ref([
  {
    id: 'todo-1',
    name: 'Work & Personal',
    description: 'Tasks for this week',
    color: '#E91E63',
    icon: 'mdi-checkbox-marked-circle-outline',
    taskCount: 4,
    updatedAt: new Date()
  },
  {
    id: 'todo-2',
    name: 'Project X',
    description: 'Specific tasks for Project X',
    color: '#2196F3',
    icon: 'mdi-briefcase',
    taskCount: 2,
    updatedAt: new Date(Date.now() - 86400000) // Yesterday
  },
  {
    id: 'todo-3',
    name: 'Home Chores',
    description: 'Things to do around the house',
    color: '#4CAF50',
    icon: 'mdi-home',
    taskCount: 1,
    updatedAt: new Date(Date.now() - 2 * 86400000) // 2 days ago
  }
])

const rules = {
  required: (value: any) => !!value || 'Required field'
}

const openToDoList = (list: any) => {
  router.push(`/task-list/${list.id}`)
}

const saveNewToDoList = () => {
  if (createListFormValid.value) {
    const newList = {
      id: `todo-${Date.now()}`,
      name: newToDoList.value.name,
      description: newToDoList.value.description,
      icon: newToDoList.value.icon,
      color: newToDoList.value.color,
      taskCount: 0,
      updatedAt: new Date()
    }
    toDoLists.value.unshift(newList)
    showCreateListDialog.value = false
    newToDoList.value = {
      name: '',
      description: '',
      icon: 'mdi-checkbox-marked-circle-outline',
      color: '#E91E63',
    }
    // Optionally navigate to the new list
    router.push(`/task-list/${newList.id}`)
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString()
}

onMounted(() => {
  // Load lists from store/API
})
</script>

<style scoped>
.tasks-lists-view {
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

.tasks-lists-card {
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
