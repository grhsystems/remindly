<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="remindly-card">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ $t('meetings.title') }}</span>
            <v-btn
              color="primary"
              prepend-icon="mdi-calendar-plus"
              @click="addMeeting"
            >
              {{ $t('meetings.addNew') }}
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="meetings.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-calendar</v-icon>
              <p class="text-h6 mt-4 text-grey">{{ $t('meetings.empty') }}</p>
              <v-btn
                color="primary"
                @click="addMeeting"
              >
                {{ $t('meetings.addFirst') }}
              </v-btn>
            </div>
            <v-list v-else>
              <v-list-item
                v-for="meeting in meetings"
                :key="meeting.id"
                class="remindly-task-item"
              >
                <template #prepend>
                  <v-icon color="info">mdi-calendar</v-icon>
                </template>
                <v-list-item-title>{{ meeting.title }}</v-list-item-title>
                <v-list-item-subtitle v-if="meeting.description">
                  {{ meeting.description }}
                </v-list-item-subtitle>
                <template #append>
                  <v-chip
                    v-if="meeting.date"
                    size="small"
                    color="info"
                  >
                    {{ formatDate(meeting.date) }}
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

const meetings = ref([])

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const loadMeetings = async () => {
  try {
    // TODO: Implement API call to load meetings
    console.log('Loading meetings...')
  } catch (error) {
    console.error('Error loading meetings:', error)
  }
}

const addMeeting = () => {
  // TODO: Implement add meeting functionality
  console.log('Add meeting')
}

onMounted(() => {
  loadMeetings()
})
</script>
