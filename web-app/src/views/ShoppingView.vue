<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="remindly-card">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ $t('shopping.title') }}</span>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="addItem"
            >
              {{ $t('shopping.addItem') }}
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row v-if="items.length === 0">
              <v-col cols="12" class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1">mdi-cart</v-icon>
                <p class="text-h6 mt-4 text-grey">No items in your shopping list yet</p>
                <v-btn
                  color="primary"
                  @click="addItem"
                >
                  Add Your First Item
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col
                v-for="item in items"
                :key="item.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card
                  class="remindly-shopping-item"
                  :class="{ 'checked': item.completed }"
                >
                  <v-card-title class="d-flex justify-space-between align-center">
                    <span>{{ item.name }}</span>
                    <v-checkbox
                      :model-value="item.completed"
                      @update:model-value="toggleItem(item)"
                    />
                  </v-card-title>
                  <v-card-text>
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="text-caption text-grey">
                        {{ $t('shopping.quantity') }}: {{ item.quantity || 1 }}
                      </span>
                      <v-chip
                        v-if="item.category"
                        size="small"
                        color="info"
                      >
                        {{ item.category }}
                      </v-chip>
                    </div>
                    <div v-if="item.price" class="text-h6 text-success">
                      ${{ item.price }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
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

const items = ref([])

const loadItems = async () => {
  try {
    // TODO: Implement API call to load shopping items
    console.log('Loading shopping items...')
  } catch (error) {
    console.error('Error loading shopping items:', error)
  }
}

const addItem = () => {
  // TODO: Implement add item functionality
  console.log('Add shopping item')
}

const toggleItem = async (item: any) => {
  try {
    // TODO: Implement toggle item completion
    console.log('Toggle item:', item.id)
  } catch (error) {
    console.error('Error toggling item:', error)
  }
}

onMounted(() => {
  loadItems()
})
</script>
