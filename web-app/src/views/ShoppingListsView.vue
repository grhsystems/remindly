<template>
  <div class="shopping-lists-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <v-icon class="mr-2 header-icon">mdi-cart</v-icon>
        <h1 class="app-title">SHOPPING LISTS</h1>
        <p class="app-subtitle">Grocery Store, This Week</p>
      </div>
    </div>

    <!-- Main Content -->
    <v-container fluid class="pa-4">
      <v-row>
        <v-col cols="12">
          <v-card class="shopping-lists-card" elevation="4">
            <v-card-text class="pa-6">
              <!-- Add New List Button -->
              <div class="add-list-section mb-6">
                <v-btn
                  color="primary"
                  size="large"
                  @click="showCreateListDialog = true"
                  class="add-list-button"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Create New Shopping List
                </v-btn>
              </div>

              <!-- Shopping Lists Grid -->
              <div v-if="shoppingLists.length > 0" class="lists-grid">
                <v-card
                  v-for="list in shoppingLists"
                  :key="list.id"
                  class="shopping-list-item"
                  elevation="2"
                  @click="openShoppingList(list)"
                >
                  <v-card-text class="pa-4">
                    <div class="list-header">
                      <v-icon color="primary" size="32" class="mr-3">mdi-cart</v-icon>
                      <div class="list-info">
                        <h3 class="list-title">{{ list.name }}</h3>
                        <p class="list-description">{{ list.description || 'Shopping list' }}</p>
                      </div>
                    </div>
                    <div class="list-stats">
                      <span class="item-count">{{ list.itemCount || 0 }} items</span>
                      <span class="list-date">{{ formatDate(list.updatedAt) }}</span>
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <!-- Empty State -->
              <div v-else class="empty-state">
                <v-icon size="80" color="grey" class="mb-4">mdi-cart</v-icon>
                <h3 class="empty-title">No Shopping Lists Yet</h3>
                <p class="empty-description">Create your first shopping list to get started</p>
                <v-btn
                  color="primary"
                  size="large"
                  @click="showCreateListDialog = true"
                  class="mt-4"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Create Your First Shopping List
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create Shopping List Dialog -->
    <v-dialog v-model="showCreateListDialog" max-width="500">
      <v-card>
        <v-card-title>Create New Shopping List</v-card-title>
        <v-card-text>
          <v-form ref="createForm" v-model="formValid">
            <v-text-field
              v-model="newList.name"
              label="List Name"
              :rules="[rules.required]"
              required
            />
            <v-textarea
              v-model="newList.description"
              label="Description"
              rows="3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="cancelCreateList">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="createShoppingList"
            :disabled="!formValid"
            :loading="creating"
          >
            {{ creating ? 'Creating...' : 'Create List' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive data
const showCreateListDialog = ref(false)
const formValid = ref(false)
const creating = ref(false)

const newList = reactive({
  name: '',
  description: ''
})

// Mock data for now
const shoppingLists = ref([
  {
    id: '1',
    name: 'Weekly Groceries',
    description: 'Grocery Store, This Week',
    itemCount: 7,
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Party Supplies',
    description: 'Birthday party shopping',
    itemCount: 12,
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Office Supplies',
    description: 'Work essentials',
    itemCount: 5,
    updatedAt: new Date()
  }
])

// Validation rules
const rules = {
  required: (value: any) => !!value || 'Required field'
}

// Methods
const openShoppingList = (list: any) => {
  router.push(`/shopping-list/${list.id}`)
}

const createShoppingList = async () => {
  if (!formValid.value) return
  
  creating.value = true
  try {
    const list = {
      id: Date.now().toString(),
      ...newList,
      itemCount: 0,
      updatedAt: new Date()
    }
    
    shoppingLists.value.unshift(list)
    showCreateListDialog.value = false
    
    // Reset form
    newList.name = ''
    newList.description = ''
  } catch (error) {
    console.error('Error creating shopping list:', error)
  } finally {
    creating.value = false
  }
}

const cancelCreateList = () => {
  showCreateListDialog.value = false
  newList.name = ''
  newList.description = ''
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString()
}

onMounted(() => {
  // Load shopping lists
  console.log('Loading shopping lists...')
})
</script>

<style scoped>
.shopping-lists-view {
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

.shopping-lists-card {
  border-radius: 16px;
  overflow: hidden;
}

.add-list-section {
  text-align: center;
}

.add-list-button {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 12px 32px;
  text-transform: none;
  letter-spacing: 1px;
}

.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.shopping-list-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.shopping-list-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.list-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.list-info {
  flex: 1;
}

.list-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.list-description {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.list-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 1rem;
  color: #666;
  margin: 0 0 2rem 0;
}

/* Responsive Design */
@media (max-width: 600px) {
  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }

  .lists-grid {
    grid-template-columns: 1fr;
  }
}
</style>
