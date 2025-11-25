<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="remindly-card">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ $t('appointments.title') }}</span>
            <v-btn
              color="primary"
              prepend-icon="mdi-calendar-plus"
              @click="addAppointment"
            >
              {{ $t('appointments.addNew') }}
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="appointments.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-calendar-clock</v-icon>
                <p class="text-h6 mt-4 text-grey">No appointments scheduled yet</p>
                <v-btn
                  color="primary"
                  @click="addAppointment"
                >
                  Schedule Your First Appointment
                </v-btn>
            </div>
            <v-list v-else>
              <v-list-item
                v-for="appointment in appointments"
                :key="appointment.id"
                class="remindly-task-item"
              >
                <template #prepend>
                  <v-icon color="warning">mdi-calendar-clock</v-icon>
                </template>
                <v-list-item-title>{{ appointment.title }}</v-list-item-title>
                <v-list-item-subtitle v-if="appointment.description">
                  {{ appointment.description }}
                </v-list-item-subtitle>
                <template #append>
                  <v-chip
                    v-if="appointment.date"
                    size="small"
                    color="warning"
                  >
                    {{ formatDate(appointment.date) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const appointments = ref([])

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const loadAppointments = async () => {
  try {
    // TODO: Implement API call to load appointments
    console.log('Loading appointments...')
  } catch (error) {
    console.error('Error loading appointments:', error)
  }
}

const addAppointment = () => {
  // TODO: Implement add appointment functionality
  console.log('Add appointment')
}

onMounted(() => {
  loadAppointments()
})
</script>
