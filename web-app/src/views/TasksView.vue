<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="remindly-card">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ $t('tasks.title') }}</span>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="addTask"
            >
              {{ $t('tasks.addNew') }}
            </v-btn>
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
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const activeTab = ref('all')
const tasks = ref([])

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

onMounted(() => {
  loadTasks()
})
</script>
