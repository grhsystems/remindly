<template>
  <div class="appointments-lists-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <v-icon class="mr-2 header-icon">mdi-calendar</v-icon>
        <h1 class="app-title">APPOINTMENT LISTS</h1>
        <p class="app-subtitle">Organize Your Schedule</p>
      </div>
    </div>

    <!-- Main Content -->
    <v-container fluid class="pa-4">
      <v-row>
        <v-col cols="12">
          <v-card class="appointments-lists-card" elevation="4">
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
                  Create New Appointment List
                </v-btn>
              </div>

              <!-- Lists Grid -->
              <div v-if="appointmentLists.length > 0" class="lists-grid">
                <v-card
                  v-for="list in appointmentLists"
                  :key="list.id"
                  class="list-item"
                  elevation="2"
                  @click="openAppointmentList(list)"
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
                      <span class="appointment-count">{{ list.appointmentCount || 0 }} appointments</span>
                      <span class="list-date">{{ formatDate(list.updatedAt) }}</span>
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <!-- Empty State -->
              <div v-else class="empty-state">
                <v-icon size="80" color="grey" class="mb-4">mdi-calendar-plus</v-icon>
                <h3 class="empty-title">No Appointment Lists Yet</h3>
                <p class="empty-description">Create your first appointment list to get started organizing your schedule</p>
                <v-btn
                  color="primary"
                  size="large"
                  @click="showCreateListDialog = true"
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

    <!-- Create List Dialog -->
    <v-dialog v-model="showCreateListDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">Create New Appointment List</v-card-title>
        <v-card-text>
          <v-form ref="createListForm" v-model="createListFormValid">
            <v-text-field
              v-model="newAppointmentList.name"
              label="List Name"
              :rules="[rules.required]"
              required
              class="mb-4"
            />
            <v-textarea
              v-model="newAppointmentList.description"
              label="Description (Optional)"
              rows="3"
              class="mb-4"
            />
            <v-select
              v-model="newAppointmentList.icon"
              :items="availableIcons"
              label="Icon"
              :rules="[rules.required]"
              required
              class="mb-4"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" :title="item.title">
                  <template v-slot:prepend>
                    <v-icon :icon="item.value"></v-icon>
                  </template>
                </v-list-item>
              </template>
              <template v-slot:selection="{ item }">
                <v-icon :icon="item.value" class="mr-2"></v-icon>
                {{ item.title }}
              </template>
            </v-select>
            <v-color-picker
              v-model="newAppointmentList.color"
              hide-canvas
              hide-inputs
              show-swatches
              class="mx-auto"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showCreateListDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveNewAppointmentList" :disabled="!createListFormValid">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

const newAppointmentList = ref({
  name: '',
  description: '',
  icon: 'mdi-calendar',
  color: '#4CAF50', // Default green
})

const rules = {
  required: (value: any) => !!value || 'Required field',
}

const availableIcons = [
  { title: 'Calendar', value: 'mdi-calendar' },
  { title: 'Briefcase', value: 'mdi-briefcase' },
  { title: 'Hospital', value: 'mdi-hospital' },
  { title: 'Account', value: 'mdi-account' },
  { title: 'School', value: 'mdi-school' },
  { title: 'Heart', value: 'mdi-heart' },
  { title: 'Home', value: 'mdi-home' },
  { title: 'Sport', value: 'mdi-dumbbell' },
]

// Mock data for now
const appointmentLists = ref([
  {
    id: '1',
    name: 'Work Meetings',
    description: 'All work-related appointments and meetings',
    color: 'blue',
    icon: 'mdi-briefcase',
    appointmentCount: 3,
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Personal Appointments',
    description: 'Dentist, Doctor, Hairdresser, etc.',
    color: 'green',
    icon: 'mdi-hospital',
    appointmentCount: 2,
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Family Events',
    description: 'Birthdays, gatherings, school events',
    color: 'orange',
    icon: 'mdi-account-group',
    appointmentCount: 4,
    updatedAt: new Date()
  }
])

const openAppointmentList = (list: any) => {
  router.push(`/appointment-list/${list.id}`)
}

const saveNewAppointmentList = () => {
  if (createListFormValid.value) {
    const newList = {
      id: Date.now().toString(),
      name: newAppointmentList.value.name,
      description: newAppointmentList.value.description,
      color: newAppointmentList.value.color,
      icon: newAppointmentList.value.icon,
      appointmentCount: 0,
      updatedAt: new Date(),
    }
    appointmentLists.value.push(newList)
    showCreateListDialog.value = false
    newAppointmentList.value = { name: '', description: '', icon: 'mdi-calendar', color: '#4CAF50' }
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString()
}

const loadAppointmentLists = async () => {
  try {
    // TODO: Implement API call to load appointment lists
    console.log('Loading appointment lists...')
  } catch (error) {
    console.error('Error loading appointment lists:', error)
  }
}

onMounted(() => {
  loadAppointmentLists()
})
</script>

<style scoped>
.appointments-lists-view {
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

.appointments-lists-card {
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
