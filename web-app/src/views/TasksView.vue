<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="remindly-card">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ $t('tasks.title') }}</span>
            <div class="d-flex gap-2">
              <v-btn
                color="secondary"
                prepend-icon="mdi-robot"
                @click="showAIDialog = true"
              >
                {{ $t('tasks.aiProcess') }}
              </v-btn>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="addTask"
              >
                {{ $t('tasks.addNew') }}
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <v-tabs v-model="activeTab" class="mb-4">
              <v-tab value="all">{{ $t('tasks.all') }}</v-tab>
              <v-tab value="pending">{{ $t('tasks.pending') }}</v-tab>
              <v-tab value="completed">{{ $t('tasks.completed') }}</v-tab>
            </v-tabs>
            
            <v-list v-if="filteredTasks.length > 0">
              <v-list-item
                v-for="task in filteredTasks"
                :key="task.id"
                class="remindly-task-item"
                :class="{ 'completed': task.completed }"
              >
                <template #prepend>
                  <v-checkbox
                    :model-value="task.completed"
                    @update:model-value="toggleTask(task)"
                  />
                </template>
                <v-list-item-title>{{ task.title }}</v-list-item-title>
                <v-list-item-subtitle v-if="task.description">
                  {{ task.description }}
                </v-list-item-subtitle>
                <template #append>
                  <div class="d-flex align-center gap-2">
                    <v-chip
                      :color="getPriorityColor(task.priority)"
                      size="small"
                    >
                      {{ $t(`tasks.priority.${task.priority}`) }}
                    </v-chip>
                    <v-chip
                      v-if="task.dueDate"
                      size="small"
                      color="info"
                    >
                      {{ formatDate(task.dueDate) }}
                    </v-chip>
                  </div>
                </template>
              </v-list-item>
            </v-list>
            
            <div v-else class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-checkbox-marked-circle-outline</v-icon>
              <p class="text-h6 mt-4 text-grey">No tasks yet</p>
              <v-btn
                color="primary"
                @click="addTask"
              >
                Create Your First Task
              </v-btn>
            </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- AI Processing Dialog -->
  <v-dialog v-model="showAIDialog" max-width="600">
    <v-card>
      <v-card-title>
        <v-icon class="mr-2">mdi-robot</v-icon>
        {{ $t('tasks.aiProcess') }}
      </v-card-title>
      
      <v-card-text>
        <v-textarea
          v-model="aiText"
          :label="$t('tasks.aiTextLabel')"
          :placeholder="$t('tasks.aiTextPlaceholder')"
          rows="4"
          variant="outlined"
        />
        
        <v-select
          v-model="aiLanguage"
          :items="languages"
          :label="$t('tasks.language')"
          variant="outlined"
        />
      </v-card-text>
      
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="showAIDialog = false"
        >
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          :loading="aiProcessing"
          @click="processWithAI"
        >
          {{ $t('tasks.process') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/api'

const { t } = useI18n()

const activeTab = ref('all')
const tasks = ref([])

// AI Processing
const showAIDialog = ref(false)
const aiText = ref('')
const aiLanguage = ref('he')
const aiProcessing = ref(false)

const languages = [
  { title: 'עברית', value: 'he' },
  { title: 'English', value: 'en' }
]

const filteredTasks = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return tasks.value.filter(task => !task.completed)
    case 'completed':
      return tasks.value.filter(task => task.completed)
    default:
      return tasks.value
  }
})

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    urgent: 'error'
  }
  return colors[priority] || 'info'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const loadTasks = async () => {
  try {
    // TODO: Implement API call to load tasks
    console.log('Loading tasks...')
  } catch (error) {
    console.error('Error loading tasks:', error)
  }
}

const addTask = () => {
  // TODO: Implement add task functionality
  console.log('Add task')
}

const toggleTask = async (task: any) => {
  try {
    // TODO: Implement toggle task completion
    console.log('Toggle task:', task.id)
  } catch (error) {
    console.error('Error toggling task:', error)
  }
}

const processWithAI = async () => {
  if (!aiText.value.trim()) return
  
  try {
    aiProcessing.value = true
    const response = await api.ai.processText(aiText.value, aiLanguage.value)
    
    if (response.data.success) {
      // Add created tasks to the list
      if (response.data.results.tasks) {
        tasks.value.push(...response.data.results.tasks)
      }
      
      // Show success message
      console.log('AI processing completed successfully')
      
      // Reset form
      aiText.value = ''
      showAIDialog.value = false
    }
  } catch (error) {
    console.error('Error processing with AI:', error)
  } finally {
    aiProcessing.value = false
  }
}

onMounted(() => {
  loadTasks()
})
</script>
