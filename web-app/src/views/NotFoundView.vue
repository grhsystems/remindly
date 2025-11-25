<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6" class="text-center">
        <v-card class="remindly-card">
          <v-card-text class="py-12">
            <v-icon size="120" color="grey-lighten-1">mdi-alert-circle-outline</v-icon>
            <h1 class="text-h2 mt-4 mb-2">404</h1>
            <h2 class="text-h4 mb-4">{{ $t('notFound.title') }}</h2>
            <p class="text-h6 text-grey mb-6">{{ $t('notFound.message') }}</p>
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-home"
              @click="goHome"
            >
              {{ $t('notFound.goHome') }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const goHome = () => {
  router.push('/')
}
</script>
