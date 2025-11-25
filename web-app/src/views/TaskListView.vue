<template>
  <div class="task-list-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <v-icon class="mr-2 header-icon" :color="toDoList?.color || 'white'">{{ toDoList?.icon || 'mdi-checkbox-marked-circle-outline' }}</v-icon>
        <h1 class="app-title">{{ toDoList?.name || 'TO-DOs' }}</h1>
        <p class="app-subtitle">{{ toDoList?.description || 'Work & Personal, This Week' }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <v-container fluid class="pa-4">
      <v-row>
        <v-col cols="12">
          <v-card class="task-list-card" elevation="4">
            <v-card-text class="pa-6">
              <!-- Tasks List -->
              <div v-if="tasks.length > 0" class="tasks-list">
                <div
                  v-for="task in tasks"
                  :key="task.id"
                  class="task-item"
                  :class="{ 'completed': task.completed }"
                >
                  <div class="task-left">
                    <v-checkbox-btn
                      v-model="task.completed"
                      color="primary"
                      @click.stop="toggleTaskCompletion(task)"
                    />
                  </div>

                  <div class="task-content">
                    <h3 class="task-title">{{ task.title }}</h3>
                    <p v-if="task.description" class="task-description">{{ task.description }}</p>
                  </div>

                  <div class="task-actions">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click.stop="editTask(task)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click.stop="deleteTask(task)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="empty-state">
                <v-icon size="80" color="grey" class="mb-4">mdi-checkbox-marked-circle-outline</v-icon>
                <h3 class="empty-title">No Tasks Yet</h3>
                <p class="empty-description">Add your first task to this list</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Add Item Button (Floating Action Button style) -->
      <v-btn
        class="add-item-fab"
        color="primary"
        size="large"
        icon="mdi-plus"
        elevation="8"
        @click="showAddTaskDialog = true"
      />

      <!-- Add/Edit Task Dialog -->
      <v-dialog v-model="showAddTaskDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h5">{{ isEditing ? 'Edit Task' : 'Add New Task' }}</v-card-title>
          <v-card-text>
            <v-form ref="taskForm" v-model="taskFormValid">
              <v-text-field
                v-model="currentTask.title"
                label="Task Title"
                :rules="[rules.required]"
                required
                class="mb-4"
              />
              <v-textarea
                v-model="currentTask.description"
                label="Description (Optional)"
                rows="3"
                class="mb-4"
              />
              <v-checkbox
                v-model="currentTask.completed"
                label="Mark as Completed"
                class="mb-4"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="cancelTaskDialog">Cancel</v-btn>
            <v-btn color="primary" @click="saveTask" :disabled="!taskFormValid">{{ isEditing ? 'Save Changes' : 'Add Task' }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const listId = computed(() => route.params.id as string)

const showAddTaskDialog = ref(false)
const taskFormValid = ref(false)
const isEditing = ref(false)
const currentTask = ref({
  id: '',
  title: '',
  description: '',
  completed: false,
  listId: listId.value,
})

// Mock data for the specific TO-DO list
const toDoList = ref({
  id: listId.value,
  name: 'Work & Personal',
  description: 'Tasks for this week',
  color: '#E91E63',
  icon: 'mdi-checkbox-marked-circle-outline',
})

const tasks = ref([
  { id: 'task-1', title: 'Finish Project X Proposal', description: '', completed: true, listId: 'todo-1' },
  { id: 'task-2', title: 'Call Bank about Loan', description: '', completed: false, listId: 'todo-1' },
  { id: 'task-3', title: 'Schedule Car Maintenance', description: '', completed: false, listId: 'todo-1' },
  { id: 'task-4', title: 'Research Holiday Destinations', description: '', completed: false, listId: 'todo-1' },
])

const rules = {
  required: (value: any) => !!value || 'Required field'
}

const toggleTaskCompletion = (task: any) => {
  task.completed = !task.completed
  // Here you would update the task in the database
  console.log(`Task ${task.id} completion toggled to ${task.completed}`)
}

const editTask = (task: any) => {
  isEditing.value = true
  currentTask.value = { ...task }
  showAddTaskDialog.value = true
}

const deleteTask = (task: any) => {
  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
    tasks.value = tasks.value.filter(t => t.id !== task.id)
    // Here you would delete the task from the database
    console.log(`Task ${task.id} deleted`)
  }
}

const saveTask = () => {
  if (taskFormValid.value) {
    if (isEditing.value) {
      const index = tasks.value.findIndex(t => t.id === currentTask.value.id)
      if (index !== -1) {
        tasks.value[index] = { ...currentTask.value }
        // Here you would update the task in the database
        console.log(`Task ${currentTask.value.id} updated`)
      }
    } else {
      const newTask = {
        ...currentTask.value,
        id: `task-${Date.now()}`,
        listId: listId.value,
      }
      tasks.value.push(newTask)
      // Here you would add the new task to the database
      console.log(`New task added: ${newTask.title}`)
    }
    cancelTaskDialog()
  }
}

const cancelTaskDialog = () => {
  showAddTaskDialog.value = false
  isEditing.value = false
  currentTask.value = {
    id: '',
    title: '',
    description: '',
    completed: false,
    listId: listId.value,
  }
}

onMounted(() => {
  // In a real app, you would fetch the specific list and its tasks based on listId
  console.log(`Loading tasks for list: ${listId.value}`)
  // Filter mock tasks to only show those belonging to this listId
  tasks.value = tasks.value.filter(task => task.listId === listId.value);

  // Update the toDoList ref with actual data if available
  // For now, we'll just use the mock data and assume it matches the ID
  if (listId.value === 'todo-1') {
    toDoList.value = {
      id: 'todo-1',
      name: 'Work & Personal',
      description: 'Tasks for this week',
      color: '#E91E63',
      icon: 'mdi-checkbox-marked-circle-outline',
    };
    tasks.value = [
      { id: 'task-1', title: 'Finish Project X Proposal', description: '', completed: true, listId: 'todo-1' },
      { id: 'task-2', title: 'Call Bank about Loan', description: '', completed: false, listId: 'todo-1' },
      { id: 'task-3', title: 'Schedule Car Maintenance', description: '', completed: false, listId: 'todo-1' },
      { id: 'task-4', title: 'Research Holiday Destinations', description: '', completed: false, listId: 'todo-1' },
    ];
  } else if (listId.value === 'todo-2') {
    toDoList.value = {
      id: 'todo-2',
      name: 'Project X',
      description: 'Specific tasks for Project X',
      color: '#2196F3',
      icon: 'mdi-briefcase',
    };
    tasks.value = [
      { id: 'task-5', title: 'Review Project X Scope', description: '', completed: false, listId: 'todo-2' },
      { id: 'task-6', title: 'Prepare Project X Presentation', description: '', completed: false, listId: 'todo-2' },
    ];
  } else if (listId.value === 'todo-3') {
    toDoList.value = {
      id: 'todo-3',
      name: 'Home Chores',
      description: 'Things to do around the house',
      color: '#4CAF50',
      icon: 'mdi-home',
    };
    tasks.value = [
      { id: 'task-7', title: 'Clean Kitchen', description: '', completed: false, listId: 'todo-3' },
    ];
  } else {
    // Default for new lists or unknown IDs
    toDoList.value = {
      id: listId.value,
      name: 'New TO-DO List',
      description: 'Your new list of tasks',
      color: '#E91E63',
      icon: 'mdi-checkbox-marked-circle-outline',
    };
    tasks.value = [];
  }
})
</script>

<style scoped>
.task-list-view {
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
  font-size: 2.5rem;
  font-weight: 900;
  color: #2c3e50;
  margin: 0.5rem 0;
  letter-spacing: 2px;
}

.app-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  letter-spacing: 1px;
}

.task-list-card {
  border-radius: 16px;
  overflow: hidden;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.task-item.completed {
  background: #f0f0f0;
  opacity: 0.7;
  text-decoration: line-through;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.task-left {
  margin-right: 16px;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.task-item.completed .task-title {
  color: #666;
}

.task-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.task-actions {
  margin-left: 16px;
  display: flex;
  gap: 4px;
}

.add-item-fab {
  position: fixed;
  bottom: 80px; /* Adjust based on your footer height */
  right: 20px;
  z-index: 1000;
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
    font-size: 0.9rem;
  }

  .task-item {
    padding: 12px;
  }

  .task-title {
    font-size: 14px;
  }

  .task-description {
    font-size: 12px;
  }
}
</style>
