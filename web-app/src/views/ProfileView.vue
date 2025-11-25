<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="remindly-card">
          <v-card-title>
            {{ $t('profile.title') }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="updateProfile">
              <v-text-field
                v-model="profile.name"
                :label="$t('profile.name')"
                :rules="nameRules"
                required
                class="mb-4"
              />
              <v-text-field
                v-model="profile.email"
                :label="$t('profile.email')"
                :rules="emailRules"
                required
                class="mb-4"
              />
              <v-select
                v-model="profile.language"
                :label="$t('profile.language')"
                :items="languages"
                variant="outlined"
                class="mb-4"
              />
              <v-select
                v-model="profile.theme"
                :label="$t('profile.theme')"
                :items="themes"
                variant="outlined"
                class="mb-4"
              />
              <div class="d-flex justify-space-between">
                <v-btn
                  variant="outlined"
                  @click="goBack"
                >
                  {{ $t('common.cancel') }}
                </v-btn>
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="loading"
                >
                  {{ $t('common.save') }}
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const profile = ref({
  name: '',
  email: '',
  language: 'he',
  theme: 'light'
})

const nameRules = [
  (v: string) => !!v || t('validation.required'),
  (v: string) => (v && v.length >= 2) || t('validation.minLength', { min: 2 }),
  (v: string) => (v && v.length <= 100) || t('validation.maxLength', { max: 100 })
]

const emailRules = [
  (v: string) => !!v || t('validation.required'),
  (v: string) => /.+@.+\..+/.test(v) || t('validation.email')
]

const languages = [
  { title: 'עברית', value: 'he' },
  { title: 'English', value: 'en' }
]

const themes = [
  { title: t('profile.light'), value: 'light' },
  { title: t('profile.dark'), value: 'dark' }
]

const loadProfile = async () => {
  try {
    // TODO: Implement API call to load profile
    console.log('Loading profile...')
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}

const updateProfile = async () => {
  try {
    loading.value = true
    // TODO: Implement API call to update profile
    console.log('Updating profile:', profile.value)
    router.push('/')
  } catch (error) {
    console.error('Error updating profile:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadProfile()
})
</script>
