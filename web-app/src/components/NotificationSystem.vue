<template>
    <div class="notification-system">
        <!-- Notification Bell -->
        <v-btn icon variant="text" @click="showNotifications = !showNotifications" class="notification-bell">
            <v-badge :content="unreadCount" :value="unreadCount > 0" color="error" size="small">
                <v-icon size="20">mdi-bell</v-icon>
            </v-badge>
        </v-btn>

        <!-- Notifications Dropdown -->
        <v-menu v-model="showNotifications" :close-on-content-click="false" location="bottom end" offset="8">
            <v-card class="notifications-dropdown" max-width="400" min-width="300">
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>{{ $t('notifications.title') }}</span>
                    <v-btn v-if="unreadCount > 0" size="small" variant="text" @click="markAllAsRead">
                        {{ $t('notifications.markAllAsRead') }}
                    </v-btn>
                </v-card-title>

                <v-divider />

                <v-card-text class="pa-0" style="max-height: 400px; overflow-y: auto;">
                    <div v-if="notifications.length === 0" class="empty-state text-center py-8">
                        <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-bell-outline</v-icon>
                        <p class="text-grey">{{ $t('notifications.noNotifications') }}</p>
                    </div>

                    <v-list v-else>
                        <v-list-item v-for="notification in notifications" :key="notification.id"
                            :class="{ 'notification-unread': !notification.read }"
                            @click="handleNotificationClick(notification)">
                            <template v-slot:prepend>
                                <v-avatar :color="getNotificationColor(notification.type)" size="32">
                                    <v-icon :color="'white'" size="16">
                                        {{ getNotificationIcon(notification.type) }}
                                    </v-icon>
                                </v-avatar>
                            </template>

                            <v-list-item-title class="notification-title">
                                {{ notification.title }}
                            </v-list-item-title>

                            <v-list-item-subtitle class="notification-message">
                                {{ notification.message }}
                            </v-list-item-subtitle>

                            <template v-slot:append>
                                <div class="notification-actions">
                                    <v-btn v-if="!notification.read" icon size="small"
                                        @click.stop="markAsRead(notification)">
                                        <v-icon size="16">mdi-check</v-icon>
                                    </v-btn>
                                    <v-btn icon size="small" @click.stop="deleteNotification(notification)"
                                        color="error">
                                        <v-icon size="16">mdi-delete</v-icon>
                                    </v-btn>
                                </div>
                            </template>
                        </v-list-item>
                    </v-list>
                </v-card-text>

                <v-divider />

                <v-card-actions>
                    <v-btn variant="text" @click="showNotifications = false">
                        {{ $t('common.close') }}
                    </v-btn>
                    <v-spacer />
                    <v-btn color="primary" variant="text" @click="viewAllNotifications">
                        {{ $t('common.viewAll') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-menu>

        <!-- Notification Toast -->
        <v-snackbar v-model="showToast" :color="toastColor" :timeout="toastTimeout" location="top right">
            <div class="d-flex align-center">
                <v-icon class="mr-2">{{ toastIcon }}</v-icon>
                <span>{{ toastMessage }}</span>
            </div>

            <template v-slot:actions>
                <v-btn color="white" variant="text" @click="showToast = false">
                    {{ $t('common.close') }}
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { Notification } from '@/types'

const { t } = useI18n()
const router = useRouter()

// Reactive data
const notifications = ref<Notification[]>([])
const showNotifications = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastColor = ref('info')
const toastIcon = ref('mdi-information')
const toastTimeout = ref(5000)

// Computed
const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length
)

// Methods
const loadNotifications = async () => {
    try {
        // Mock notifications for now
        notifications.value = [
            {
                id: '1',
                type: 'task_reminder',
                title: t('notifications.taskReminder'),
                message: 'משימה "קנה חלב" מגיעה לזמן היעד',
                read: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                data: { taskId: '1' }
            },
            {
                id: '2',
                type: 'voice_processed',
                title: t('notifications.voiceProcessed'),
                message: 'הקלטה קולית עובדה בהצלחה',
                read: true,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                data: { voiceId: '1' }
            },
            {
                id: '3',
                type: 'price_updated',
                title: t('notifications.priceUpdated'),
                message: 'מחיר "חלב" עודכן ל-₪5.50',
                read: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                data: { itemId: '1', newPrice: 5.50 }
            }
        ]
    } catch (error) {
        console.error('Error loading notifications:', error)
    }
}

const markAsRead = async (notification: Notification) => {
    try {
        notification.read = true
        // API call would go here
    } catch (error) {
        console.error('Error marking notification as read:', error)
    }
}

const markAllAsRead = async () => {
    try {
        notifications.value.forEach(n => n.read = true)
        // API call would go here
    } catch (error) {
        console.error('Error marking all notifications as read:', error)
    }
}

const deleteNotification = async (notification: Notification) => {
    try {
        notifications.value = notifications.value.filter(n => n.id !== notification.id)
        // API call would go here
    } catch (error) {
        console.error('Error deleting notification:', error)
    }
}

const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
        markAsRead(notification)
    }

    // Navigate based on notification type
    switch (notification.type) {
        case 'task_reminder':
            if (notification.data?.taskId) {
                router.push(`/tasks/${notification.data.taskId}`)
            }
            break
        case 'voice_processed':
            router.push('/voice')
            break
        case 'price_updated':
            router.push('/shopping')
            break
        default:
            router.push('/notifications')
    }

    showNotifications.value = false
}

const viewAllNotifications = () => {
    router.push('/notifications')
    showNotifications.value = false
}

const getNotificationColor = (type: string) => {
    const colorMap = {
        task_reminder: 'warning',
        voice_processed: 'info',
        price_updated: 'success',
        list_shared: 'primary',
        error: 'error'
    }
    return colorMap[type] || 'grey'
}

const getNotificationIcon = (type: string) => {
    const iconMap = {
        task_reminder: 'mdi-alarm',
        voice_processed: 'mdi-microphone',
        price_updated: 'mdi-currency-usd',
        list_shared: 'mdi-share',
        error: 'mdi-alert'
    }
    return iconMap[type] || 'mdi-bell'
}

const showNotificationToast = (type: string, message: string) => {
    toastMessage.value = message
    toastColor.value = getNotificationColor(type)
    toastIcon.value = getNotificationIcon(type)
    showToast.value = true
}

// Simulate real-time notifications
const simulateNotification = () => {
    const types = ['task_reminder', 'voice_processed', 'price_updated']
    const messages = [
        'משימה חדשה נוצרה',
        'הקלטה קולית עובדה',
        'מחיר עודכן'
    ]

    const randomType = types[Math.floor(Math.random() * types.length)]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    showNotificationToast(randomType, randomMessage)
}

// Lifecycle
onMounted(() => {
    loadNotifications()

    // Simulate notifications every 30 seconds for demo
    const interval = setInterval(simulateNotification, 30000)

    onUnmounted(() => {
        clearInterval(interval)
    })
})
</script>

<style scoped>
.notification-system {
    position: relative;
}

.notification-bell {
    transition: all 0.3s ease;
}

.notification-bell:hover {
    transform: scale(1.1);
}

.notifications-dropdown {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border-radius: 12px;
}

.notification-unread {
    background-color: rgba(25, 118, 210, 0.05);
    border-left: 3px solid #1976d2;
}

.notification-title {
    font-weight: 500;
    font-size: 0.9rem;
}

.notification-message {
    font-size: 0.8rem;
    opacity: 0.8;
    margin-top: 4px;
}

.notification-actions {
    display: flex;
    gap: 4px;
}

.empty-state {
    padding: 32px 16px;
}

/* Animation for new notifications */
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.notification-unread {
    animation: slideIn 0.3s ease;
}

/* Responsive design */
@media (max-width: 600px) {
    .notifications-dropdown {
        max-width: 300px;
        min-width: 250px;
    }

    .notification-actions {
        flex-direction: column;
    }
}
</style>
