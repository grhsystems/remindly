<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="remindly-card">
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon
                :color="list?.color"
                class="mr-2"
              >
                {{ list?.icon }}
              </v-icon>
              {{ list?.name }}
            </div>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              @click="editList"
            />
          </v-card-title>
          <v-card-subtitle v-if="list?.description">
            {{ list.description }}
          </v-card-subtitle>
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-caption text-grey">
                {{ $t('lists.taskCount', { count: tasks.length }) }}
              </span>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="addTask"
              >
                {{ $t('tasks.addNew') }}
              </v-btn>
            </div>
            
            <v-list v-if="tasks.length > 0">
              <v-list-item
                v-for="task in tasks"
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
                  <v-chip
                    :color="getPriorityColor(task.priority)"
                    size="small"
                  >
                    {{ $t(`tasks.priority.${task.priority}`) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            
            <div v-else class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-checkbox-marked-circle-outline</v-icon>
              <p class="text-h6 mt-4 text-grey">{{ $t('tasks.empty') }}</p>
              <v-btn
                color="primary"
                @click="addTask"
              >
                {{ $t('tasks.addFirst') }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const list = ref(null)
const tasks = ref([])

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    urgent: 'error'
  }
  return colors[priority] || 'info'
}

const loadList = async () => {
  try {
    const listId = route.params.id
    // TODO: Implement API call to load list details
    console.log('Loading list:', listId)
  } catch (error) {
    console.error('Error loading list:', error)
  }
}

const loadTasks = async () => {
  try {
    const listId = route.params.id
    // TODO: Implement API call to load tasks
    console.log('Loading tasks for list:', listId)
  } catch (error) {
    console.error('Error loading tasks:', error)
  }
}

const addTask = () => {
  // TODO: Implement add task functionality
  console.log('Add task')
}

const editList = () => {
  // TODO: Implement edit list functionality
  console.log('Edit list')
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
  loadList()
  loadTasks()
})
</script>
