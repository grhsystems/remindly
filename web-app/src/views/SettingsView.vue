<template>
  <div class="settings-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <v-icon class="mr-2 header-icon">mdi-cog</v-icon>
        <h1 class="app-title">SETTINGS</h1>
        <p class="app-subtitle">Customize Your Experience</p>
      </div>
    </div>

    <!-- Main Settings Content -->
    <v-container fluid class="pa-4">
      <v-row>
        <v-col cols="12">
          <v-card class="settings-card" elevation="4">
            <v-card-text class="pa-6">
              <v-tabs v-model="activeTab" class="mb-4">
                <v-tab value="general">{{ $t('settings.general') }}</v-tab>
                <v-tab value="notifications">{{ $t('settings.notifications') }}</v-tab>
                <v-tab value="appearance">{{ $t('settings.appearance') }}</v-tab>
                <v-tab value="account">{{ $t('settings.account') }}</v-tab>
                <v-tab value="integrations">Integrations</v-tab>
              </v-tabs>
            
            <v-window v-model="activeTab">
              <v-window-item value="general">
                <div class="settings-section">
                  <h3 class="section-title">{{ $t('settings.general') }}</h3>
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-title">{{ $t('settings.language') }}</div>
                      <div class="setting-description">{{ $t('settings.languageDescription') }}</div>
                    </div>
                    <div class="setting-control">
                      <v-select
                        v-model="settings.language"
                        :items="languages"
                        variant="outlined"
                        density="compact"
                      />
                    </div>
                  </div>
                </div>
              </v-window-item>
              
              <v-window-item value="notifications">
                <div class="settings-section">
                  <h3 class="section-title">{{ $t('settings.notifications') }}</h3>
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-title">{{ $t('settings.pushNotifications') }}</div>
                      <div class="setting-description">{{ $t('settings.pushNotificationsDescription') }}</div>
                    </div>
                    <div class="setting-control">
                      <v-switch v-model="settings.pushNotifications" />
                    </div>
                  </div>
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-title">{{ $t('settings.emailNotifications') }}</div>
                      <div class="setting-description">{{ $t('settings.emailNotificationsDescription') }}</div>
                    </div>
                    <div class="setting-control">
                      <v-switch v-model="settings.emailNotifications" />
                    </div>
                  </div>
                </div>
              </v-window-item>
              
              <v-window-item value="appearance">
                <div class="settings-section">
                  <h3 class="section-title">{{ $t('settings.appearance') }}</h3>
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-title">{{ $t('settings.theme') }}</div>
                      <div class="setting-description">{{ $t('settings.themeDescription') }}</div>
                    </div>
                    <div class="setting-control">
                      <v-select
                        v-model="settings.theme"
                        :items="themes"
                        variant="outlined"
                        density="compact"
                      />
                    </div>
                  </div>
                </div>
              </v-window-item>
              
              <v-window-item value="account">
                <div class="settings-section">
                  <h3 class="section-title">{{ $t('settings.account') }}</h3>
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-title">{{ $t('settings.changePassword') }}</div>
                      <div class="setting-description">{{ $t('settings.changePasswordDescription') }}</div>
                    </div>
                    <div class="setting-control">
                      <v-btn variant="outlined" @click="changePassword">
                        {{ $t('settings.changePassword') }}
                      </v-btn>
                    </div>
                  </div>
                  <div class="setting-item">
                    <div class="setting-info">
                      <div class="setting-title">{{ $t('settings.deleteAccount') }}</div>
                      <div class="setting-description">{{ $t('settings.deleteAccountDescription') }}</div>
                    </div>
                    <div class="setting-control">
                      <v-btn color="error" variant="outlined" @click="deleteAccount">
                        {{ $t('settings.deleteAccount') }}
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-window-item>

              <v-window-item value="integrations">
                <div class="settings-section">
                  <h3 class="section-title">
                    <v-icon class="mr-2">mdi-calendar-account</v-icon>
                    Google Calendar Integration
                  </h3>
                  <v-card variant="outlined" class="integration-card">
                    <v-card-text>
                      <div class="integration-content">
                        <div class="integration-info">
                          <v-icon color="primary" size="48" class="mb-2">mdi-google</v-icon>
                          <h4>Connect Google Calendar</h4>
                          <p>Sync your appointments and events with Google Calendar</p>
                        </div>
                        <v-btn
                          :color="settings.googleCalendarConnected ? 'success' : 'primary'"
                          :variant="settings.googleCalendarConnected ? 'outlined' : 'flat'"
                          @click="toggleGoogleCalendar"
                        >
                          <v-icon start>{{ settings.googleCalendarConnected ? 'mdi-check' : 'mdi-link' }}</v-icon>
                          {{ settings.googleCalendarConnected ? 'Connected' : 'Connect' }}
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const activeTab = ref('general')
const settings = ref({
  language: 'he',
  theme: 'light',
  pushNotifications: true,
  emailNotifications: true,
  googleCalendarConnected: false
})

const languages = [
  { title: 'עברית', value: 'he' },
  { title: 'English', value: 'en' }
]

const themes = [
  { title: t('settings.light'), value: 'light' },
  { title: t('settings.dark'), value: 'dark' }
]

const loadSettings = async () => {
  try {
    // TODO: Implement API call to load settings
    console.log('Loading settings...')
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

const saveSettings = async () => {
  try {
    // TODO: Implement API call to save settings
    console.log('Saving settings:', settings.value)
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

const changePassword = () => {
  // TODO: Implement change password functionality
  console.log('Change password')
}

const deleteAccount = () => {
  // TODO: Implement delete account functionality
  console.log('Delete account')
}

const toggleGoogleCalendar = () => {
  settings.value.googleCalendarConnected = !settings.value.googleCalendarConnected
  console.log('Google Calendar connection:', settings.value.googleCalendarConnected)
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-view {
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

.settings-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.settings-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.setting-description {
  font-size: 0.9rem;
  color: #666;
}

.setting-control {
  margin-left: 1rem;
}

.integration-card {
  border-radius: 12px;
  border: 2px solid #e0e0e0;
}

.integration-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.integration-info {
  text-align: center;
}

.integration-info h4 {
  margin: 0.5rem 0;
  color: #2c3e50;
}

.integration-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 600px) {
  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }

  .integration-content {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
