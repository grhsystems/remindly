<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="remindly-card">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ $t('repairs.title') }}</span>
            <v-btn
              color="primary"
              prepend-icon="mdi-wrench"
              @click="addRepair"
            >
              {{ $t('repairs.addNew') }}
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="repairs.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-wrench</v-icon>
              <p class="text-h6 mt-4 text-grey">{{ $t('repairs.empty') }}</p>
              <v-btn
                color="primary"
                @click="addRepair"
              >
                {{ $t('repairs.addFirst') }}
              </v-btn>
            </div>
            <v-list v-else>
              <v-list-item
                v-for="repair in repairs"
                :key="repair.id"
                class="remindly-task-item"
              >
                <template #prepend>
                  <v-icon color="error">mdi-wrench</v-icon>
                </template>
                <v-list-item-title>{{ repair.title }}</v-list-item-title>
                <v-list-item-subtitle v-if="repair.description">
                  {{ repair.description }}
                </v-list-item-subtitle>
                <template #append>
                  <v-chip
                    v-if="repair.priority"
                    :color="getPriorityColor(repair.priority)"
                    size="small"
                  >
                    {{ $t(`repairs.priority.${repair.priority}`) }}
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

const repairs = ref([])

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    urgent: 'error'
  }
  return colors[priority] || 'info'
}

const loadRepairs = async () => {
  try {
    // TODO: Implement API call to load repairs
    console.log('Loading repairs...')
  } catch (error) {
    console.error('Error loading repairs:', error)
  }
}

const addRepair = () => {
  // TODO: Implement add repair functionality
  console.log('Add repair')
}

onMounted(() => {
  loadRepairs()
})
</script>
