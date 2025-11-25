<template>
  <div class="appointment-list-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <v-icon class="mr-2 header-icon">mdi-calendar</v-icon>
        <h1 class="app-title">{{ appointmentList?.name || 'Appointment List' }}</h1>
        <p class="app-subtitle">{{ appointmentList?.description || 'This Week, Dr Lee\'s Office' }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <v-container fluid class="pa-4">
      <v-row>
        <v-col cols="12">
          <v-card class="appointment-list-card" elevation="4">
            <v-card-text class="pa-6">
              <!-- Appointments List -->
              <div v-if="appointments.length > 0" class="appointments-list">
                <div
                  v-for="appointment in appointments"
                  :key="appointment.id"
                  class="appointment-item"
                  :class="{ 'completed': appointment.isCompleted }"
                >
                  <div class="appointment-left">
                    <v-checkbox-btn
                      v-model="appointment.isCompleted"
                      color="primary"
                      @click.stop="toggleAppointmentCompletion(appointment)"
                    />
                  </div>
                  
                  <div class="appointment-content">
                    <h3 class="appointment-title">{{ appointment.title }}</h3>
                    <p class="appointment-subtitle">{{ appointment.subtitle }}</p>
                  </div>
                  
                  <div class="appointment-actions">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click.stop="editAppointment(appointment)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click.stop="deleteAppointment(appointment)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="empty-state">
                <v-icon size="80" color="grey" class="mb-4">mdi-calendar-clock</v-icon>
                <h3 class="empty-title">No appointments scheduled yet</h3>
                <p class="empty-description">Add your first appointment to this list</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Add Appointment Button -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-btn
            color="primary"
            size="large"
            block
            rounded
            elevation="8"
            class="add-appointment-button"
            @click="showAddAppointmentDialog = true"
          >
            <v-icon start>mdi-plus</v-icon>
            Add New Appointment
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- Add/Edit Appointment Dialog -->
    <v-dialog v-model="showAddAppointmentDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">{{ isEditing ? 'Edit Appointment' : 'Add New Appointment' }}</v-card-title>
        <v-card-text>
          <v-form ref="appointmentForm" v-model="appointmentFormValid">
            <v-text-field
              v-model="currentAppointment.title"
              label="Title"
              :rules="[rules.required]"
              required
              class="mb-4"
            />
            <v-textarea
              v-model="currentAppointment.subtitle"
              label="Description / Details"
              rows="3"
              class="mb-4"
            />
            <v-text-field
              v-model="currentAppointment.date"
              label="Date (e.g., Mon, June 10)"
              :rules="[rules.required]"
              required
              class="mb-4"
            />
            <v-text-field
              v-model="currentAppointment.time"
              label="Time (e.g., 10:00 AM)"
              :rules="[rules.required]"
              required
              class="mb-4"
            />
            <v-checkbox
              v-model="currentAppointment.isCompleted"
              label="Completed"
              class="mb-4"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="cancelAppointmentDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveAppointment" :disabled="!appointmentFormValid">
            {{ isEditing ? 'Save Changes' : 'Add Appointment' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const appointmentListId = computed(() => route.params.id as string)

const showAddAppointmentDialog = ref(false)
const appointmentFormValid = ref(false)
const isEditing = ref(false)

const currentAppointment = ref({
  id: '',
  title: '',
  subtitle: '',
  date: '',
  time: '',
  isCompleted: false,
})

const rules = {
  required: (value: any) => !!value || 'Required field',
}

// Mock data for the specific appointment list
const appointmentList = ref({
  id: appointmentListId.value,
  name: 'Work Meetings',
  description: 'All work-related appointments and meetings',
  color: 'blue',
  icon: 'mdi-briefcase',
  appointmentCount: 3,
  updatedAt: new Date()
})

const appointments = ref([
  {
    id: 'a1',
    title: 'Dentist Check-up',
    subtitle: 'Mon, June 10, 10:00 AM',
    date: 'Mon, June 10',
    time: '10:00 AM',
    isCompleted: true,
  },
  {
    id: 'a2',
    title: 'Project Meeting',
    subtitle: '12:00 AM',
    date: 'Mon, June 10',
    time: '12:00 AM',
    isCompleted: false,
  },
  {
    id: 'a3',
    title: 'Project Meeting',
    subtitle: 'Thu, June 13, 6:00 PM',
    date: 'Thu, June 13',
    time: '6:00 PM',
    isCompleted: false,
  },
  {
    id: 'a4',
    title: 'Yoga Class',
    subtitle: 'Spinach',
    date: 'Fri, June 14',
    time: '7:00 PM',
    isCompleted: false,
  },
])

const toggleAppointmentCompletion = (appointment: any) => {
  appointment.isCompleted = !appointment.isCompleted
  // TODO: Call API to update completion status
  console.log(`Appointment ${appointment.id} completion toggled to ${appointment.isCompleted}`)
}

const addAppointment = () => {
  isEditing.value = false
  currentAppointment.value = {
    id: '',
    title: '',
    subtitle: '',
    date: '',
    time: '',
    isCompleted: false,
  }
  showAddAppointmentDialog.value = true
}

const editAppointment = (appointment: any) => {
  isEditing.value = true
  currentAppointment.value = { ...appointment }
  showAddAppointmentDialog.value = true
}

const saveAppointment = () => {
  if (appointmentFormValid.value) {
    if (isEditing.value) {
      const index = appointments.value.findIndex(a => a.id === currentAppointment.value.id)
      if (index !== -1) {
        appointments.value[index] = { ...currentAppointment.value }
      }
    } else {
      const newId = Date.now().toString()
      appointments.value.push({ ...currentAppointment.value, id: newId })
    }
    cancelAppointmentDialog()
  }
}

const deleteAppointment = (appointment: any) => {
  const index = appointments.value.findIndex(a => a.id === appointment.id)
  if (index > -1) {
    appointments.value.splice(index, 1)
  }
}

const cancelAppointmentDialog = () => {
  showAddAppointmentDialog.value = false
  isEditing.value = false
  currentAppointment.value = {
    id: '',
    title: '',
    subtitle: '',
    date: '',
    time: '',
    isCompleted: false,
  }
}

onMounted(() => {
  // In a real app, fetch appointment list details and its appointments based on appointmentListId
  console.log(`Loading appointments for list: ${appointmentListId.value}`)
  // For now, mock data is used.
})
</script>

<style scoped>
.appointment-list-view {
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

.appointment-list-card {
  border-radius: 16px;
  overflow: hidden;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.appointment-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.appointment-item.completed {
  opacity: 0.7;
  background-color: #f0f0f0;
}

.appointment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.appointment-left {
  margin-right: 16px;
}

.appointment-content {
  flex: 1;
}

.appointment-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.appointment-item.completed .appointment-title {
  text-decoration: line-through;
  color: #999;
}

.appointment-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.appointment-actions {
  margin-left: 16px;
  display: flex;
  gap: 4px;
}

.add-appointment-button {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 12px 32px;
  text-transform: none;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.add-appointment-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
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

  .appointment-item {
    padding: 12px;
  }

  .appointment-title {
    font-size: 14px;
  }

  .appointment-subtitle {
    font-size: 12px;
  }
}
</style>
