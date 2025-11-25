<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="remindly-card">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ $t('notifications.title') }}</span>
            <v-btn
              icon="mdi-refresh"
              variant="text"
              @click="loadNotifications"
            />
          </v-card-title>
          <v-card-text>
            <div v-if="notifications.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-bell-outline</v-icon>
              <p class="text-h6 mt-4 text-grey">{{ $t('notifications.empty') }}</p>
            </div>
            <v-list v-else>
              <v-list-item
                v-for="notification in notifications"
                :key="notification.id"
                class="remindly-notification"
                :class="{ 'unread': !notification.read }"
              >
                <template #prepend>
                  <v-icon
                    :color="getNotificationColor(notification.type)"
                    :icon="getNotificationIcon(notification.type)"
                  />
                </template>
                <v-list-item-title>{{ notification.title }}</v-list-item-title>
                <v-list-item-subtitle v-if="notification.message">
                  {{ notification.message }}
                </v-list-item-subtitle>
                <template #append>
                  <div class="d-flex flex-column align-end">
                    <v-chip
                      v-if="!notification.read"
                      size="small"
                      color="primary"
                    >
                      {{ $t('notifications.unread') }}
                    </v-chip>
                    <span class="text-caption text-grey mt-1">
                      {{ formatDate(notification.createdAt) }}
                    </span>
                  </div>
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

const notifications = ref([])

const getNotificationColor = (type: string) => {
  const colors = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error'
  }
  return colors[type] || 'info'
}

const getNotificationIcon = (type: string) => {
  const icons = {
    info: 'mdi-information',
    success: 'mdi-check-circle',
    warning: 'mdi-alert',
    error: 'mdi-alert-circle'
  }
  return icons[type] || 'mdi-information'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const loadNotifications = async () => {
  try {
    // TODO: Implement API call to load notifications
    console.log('Loading notifications...')
  } catch (error) {
    console.error('Error loading notifications:', error)
  }
}

onMounted(() => {
  loadNotifications()
})
</script>
