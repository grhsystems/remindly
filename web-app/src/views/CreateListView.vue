<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="remindly-card">
          <v-card-title>
            {{ $t('lists.createNew') }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createList">
              <v-text-field
                v-model="form.name"
                :label="$t('lists.name')"
                :rules="nameRules"
                required
                class="mb-4"
              />
              <v-textarea
                v-model="form.description"
                :label="$t('lists.description')"
                rows="3"
                class="mb-4"
              />
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="form.icon"
                    :label="$t('lists.icon')"
                    prepend-inner-icon="mdi-palette"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="6">
                  <v-color-picker
                    v-model="form.color"
                    :label="$t('lists.color')"
                    hide-inputs
                    class="mb-4"
                  />
                </v-col>
              </v-row>
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
                  {{ $t('common.create') }}
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const form = ref({
  name: '',
  description: '',
  icon: 'mdi-format-list-bulleted',
  color: '#1976d2'
})

const nameRules = [
  (v: string) => !!v || t('validation.required'),
  (v: string) => (v && v.length >= 1) || t('validation.minLength', { min: 1 }),
  (v: string) => (v && v.length <= 100) || t('validation.maxLength', { max: 100 })
]

const createList = async () => {
  try {
    loading.value = true
    // TODO: Implement API call to create list
    console.log('Creating list:', form.value)
    router.push('/lists')
  } catch (error) {
    console.error('Error creating list:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/lists')
}
</script>
