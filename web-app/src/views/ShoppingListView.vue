<template>
  <div class="shopping-list-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <v-icon class="mr-2 header-icon">mdi-cart</v-icon>
        <h1 class="app-title">Shopping List</h1>
        <p class="app-subtitle">{{ shoppingList?.description || 'Grocery Store, This Week' }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <v-container fluid class="pa-4">
      <v-row>
        <v-col cols="12">
          <v-card class="shopping-list-card" elevation="4">
            <v-card-text class="pa-6">
              <!-- Shopping Items List -->
              <div v-if="items.length > 0" class="items-list">
                <div
                  v-for="item in items"
                  :key="item.id"
                  class="shopping-item"
                  :class="{ 'completed': item.completed }"
                >
                  <div class="item-left">
                    <v-checkbox
                      :model-value="item.completed"
                      @update:model-value="toggleItem(item)"
                      color="primary"
                      hide-details
                    />
                  </div>
                  
                  <div class="item-content">
                    <h3 class="item-name">{{ item.name }}</h3>
                    <p v-if="item.quantity" class="item-quantity">Qty: {{ item.quantity }}</p>
                  </div>
                  
                  <div class="item-actions">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click="editItem(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click="deleteItem(item)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="empty-state">
                <v-icon size="80" color="grey" class="mb-4">mdi-cart-outline</v-icon>
                <h3 class="empty-title">No Items Yet</h3>
                <p class="empty-description">Add your first item to get started</p>
              </div>

              <!-- Add Item Button -->
              <div class="add-item-section">
                <v-btn
                  color="primary"
                  size="large"
                  @click="showAddItemDialog = true"
                  class="add-item-button"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Add Item
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Add Item Dialog -->
    <v-dialog v-model="showAddItemDialog" max-width="500">
      <v-card>
        <v-card-title>Add New Item</v-card-title>
        <v-card-text>
          <v-form ref="addForm" v-model="formValid">
            <v-text-field
              v-model="newItem.name"
              label="Item Name"
              :rules="[rules.required]"
              required
            />
            <v-text-field
              v-model="newItem.quantity"
              label="Quantity"
              type="number"
              min="1"
            />
            <v-text-field
              v-model="newItem.notes"
              label="Notes (optional)"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="cancelAddItem">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="addItem"
            :disabled="!formValid"
            :loading="adding"
          >
            {{ adding ? 'Adding...' : 'Add Item' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Item Dialog -->
    <v-dialog v-model="showEditItemDialog" max-width="500">
      <v-card>
        <v-card-title>Edit Item</v-card-title>
        <v-card-text>
          <v-form ref="editForm" v-model="editFormValid">
            <v-text-field
              v-model="editingItem.name"
              label="Item Name"
              :rules="[rules.required]"
              required
            />
            <v-text-field
              v-model="editingItem.quantity"
              label="Quantity"
              type="number"
              min="1"
            />
            <v-text-field
              v-model="editingItem.notes"
              label="Notes (optional)"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="cancelEditItem">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveEditItem"
            :disabled="!editFormValid"
            :loading="saving"
          >
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Reactive data
const showAddItemDialog = ref(false)
const showEditItemDialog = ref(false)
const formValid = ref(false)
const editFormValid = ref(false)
const adding = ref(false)
const saving = ref(false)

const newItem = reactive({
  name: '',
  quantity: 1,
  notes: ''
})

const editingItem = reactive({
  id: '',
  name: '',
  quantity: 1,
  notes: ''
})

// Mock data for now
const shoppingList = ref({
  id: route.params.id,
  name: 'Weekly Groceries',
  description: 'Grocery Store, This Week'
})

const items = ref([
  {
    id: '1',
    name: 'Milk',
    quantity: 2,
    completed: true,
    notes: ''
  },
  {
    id: '2',
    name: 'Eggs',
    quantity: 12,
    completed: false,
    notes: 'Free range'
  },
  {
    id: '3',
    name: 'Bread',
    quantity: 1,
    completed: false,
    notes: 'Whole wheat'
  },
  {
    id: '4',
    name: 'Apples',
    quantity: 6,
    completed: false,
    notes: 'Red apples'
  },
  {
    id: '5',
    name: 'Apples',
    quantity: 4,
    completed: false,
    notes: 'Green apples'
  },
  {
    id: '6',
    name: 'Chicken Breast',
    quantity: 2,
    completed: false,
    notes: 'Organic'
  },
  {
    id: '7',
    name: 'Spinach',
    quantity: 1,
    completed: false,
    notes: 'Fresh'
  }
])

// Validation rules
const rules = {
  required: (value: any) => !!value || 'Required field'
}

// Methods
const toggleItem = async (item: any) => {
  try {
    item.completed = !item.completed
    console.log('Toggle item:', item.id, 'completed:', item.completed)
  } catch (error) {
    console.error('Error toggling item:', error)
  }
}

const addItem = async () => {
  if (!formValid.value) return
  
  adding.value = true
  try {
    const item = {
      id: Date.now().toString(),
      ...newItem,
      completed: false
    }
    
    items.value.push(item)
    showAddItemDialog.value = false
    
    // Reset form
    newItem.name = ''
    newItem.quantity = 1
    newItem.notes = ''
  } catch (error) {
    console.error('Error adding item:', error)
  } finally {
    adding.value = false
  }
}

const editItem = (item: any) => {
  editingItem.id = item.id
  editingItem.name = item.name
  editingItem.quantity = item.quantity
  editingItem.notes = item.notes
  showEditItemDialog.value = true
}

const saveEditItem = async () => {
  if (!editFormValid.value) return
  
  saving.value = true
  try {
    const index = items.value.findIndex(i => i.id === editingItem.id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...editingItem }
    }
    showEditItemDialog.value = false
  } catch (error) {
    console.error('Error saving item:', error)
  } finally {
    saving.value = false
  }
}

const deleteItem = (item: any) => {
  const index = items.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    items.value.splice(index, 1)
  }
}

const cancelAddItem = () => {
  showAddItemDialog.value = false
  newItem.name = ''
  newItem.quantity = 1
  newItem.notes = ''
}

const cancelEditItem = () => {
  showEditItemDialog.value = false
  editingItem.id = ''
  editingItem.name = ''
  editingItem.quantity = 1
  editingItem.notes = ''
}

onMounted(() => {
  // Load shopping list and items
  console.log('Loading shopping list:', route.params.id)
})
</script>

<style scoped>
.shopping-list-view {
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

.shopping-list-card {
  border-radius: 16px;
  overflow: hidden;
}

.items-list {
  margin-bottom: 2rem;
}

.shopping-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.shopping-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.shopping-item.completed {
  opacity: 0.6;
  background: #f5f5f5;
}

.item-left {
  margin-right: 16px;
}

.item-content {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.item-quantity {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.item-actions {
  display: flex;
  gap: 4px;
}

.add-item-section {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.add-item-button {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 12px 32px;
  text-transform: none;
  letter-spacing: 1px;
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

  .shopping-item {
    padding: 12px;
  }

  .item-name {
    font-size: 14px;
  }

  .item-quantity {
    font-size: 12px;
  }
}
</style>
