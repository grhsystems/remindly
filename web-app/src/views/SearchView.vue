<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="remindly-card">
          <v-card-title>
            {{ $t('search.title') }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="searchQuery"
              :label="$t('search.placeholder')"
              prepend-inner-icon="mdi-magnify"
              clearable
              @input="performSearch"
              class="mb-4"
            />
            
            <div v-if="searchResults.length > 0">
              <h3 class="mb-4">{{ $t('search.results') }}</h3>
              <v-list>
                <v-list-item
                  v-for="result in searchResults"
                  :key="result.id"
                  class="search-result-item"
                  @click="openResult(result)"
                >
                  <template #prepend>
                    <v-icon :color="result.color">{{ result.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ result.title }}</v-list-item-title>
                  <v-list-item-subtitle v-if="result.description">
                    {{ result.description }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-chip
                      size="small"
                      :color="result.typeColor"
                    >
                      {{ $t(`search.types.${result.type}`) }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </div>
            
            <div v-else-if="searchQuery && !searching" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-magnify</v-icon>
              <p class="text-h6 mt-4 text-grey">{{ $t('search.noResults') }}</p>
            </div>
            
            <div v-else-if="!searchQuery" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-magnify</v-icon>
              <p class="text-h6 mt-4 text-grey">{{ $t('search.startSearching') }}</p>
            </div>
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

const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  try {
    searching.value = true
    // TODO: Implement API call to search
    console.log('Searching for:', searchQuery.value)
    // Simulate search results
    searchResults.value = []
  } catch (error) {
    console.error('Error searching:', error)
  } finally {
    searching.value = false
  }
}

const openResult = (result: any) => {
  // TODO: Implement navigation to result
  console.log('Open result:', result)
}
</script>
