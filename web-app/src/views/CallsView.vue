<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="remindly-card">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ $t('calls.title') }}</span>
            <v-btn
              color="primary"
              prepend-icon="mdi-phone-plus"
              @click="addCall"
            >
              {{ $t('calls.addNew') }}
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="calls.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-phone</v-icon>
              <p class="text-h6 mt-4 text-grey">{{ $t('calls.empty') }}</p>
              <v-btn
                color="primary"
                @click="addCall"
              >
                {{ $t('calls.addFirst') }}
              </v-btn>
            </div>
            <v-list v-else>
              <v-list-item
                v-for="call in calls"
                :key="call.id"
                class="remindly-task-item"
              >
                <template #prepend>
                  <v-icon color="primary">mdi-phone</v-icon>
                </template>
                <v-list-item-title>{{ call.title }}</v-list-item-title>
                <v-list-item-subtitle v-if="call.description">
                  {{ call.description }}
                </v-list-item-subtitle>
                <template #append>
                  <v-btn
                    icon="mdi-phone"
                    color="success"
                    @click="makeCall(call)"
                  />
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

const calls = ref([])

const loadCalls = async () => {
  try {
    // TODO: Implement API call to load calls
    console.log('Loading calls...')
  } catch (error) {
    console.error('Error loading calls:', error)
  }
}

const addCall = () => {
  // TODO: Implement add call functionality
  console.log('Add call')
}

const makeCall = (call: any) => {
  // TODO: Implement make call functionality
  console.log('Make call:', call)
}

onMounted(() => {
  loadCalls()
})
</script>
