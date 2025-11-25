<template>
    <div class="shopping-list">
        <v-card class="remindly-card" elevation="4">
            <v-card-title class="d-flex justify-space-between align-center">
                <div>
                    <v-icon class="mr-2">mdi-cart</v-icon>
                    {{ $t('shopping.title') }}
                </div>
                <v-btn color="primary" @click="showAddItemDialog = true" :disabled="!selectedList">
                    <v-icon class="mr-1">mdi-plus</v-icon>
                    {{ $t('shopping.addItem') }}
                </v-btn>
            </v-card-title>

            <v-card-text>
                <!-- List Selection -->
                <v-select v-model="selectedListId" :items="shoppingLists" :item-title="'name'" :item-value="'id'"
                    :label="$t('lists.title')" variant="outlined" class="mb-4"
                    @update:model-value="loadShoppingItems" />

                <!-- Shopping Items -->
                <div v-if="shoppingItems.length > 0" class="shopping-items">
                    <v-list>
                        <v-list-item v-for="item in shoppingItems" :key="item.id" class="shopping-item"
                            :class="{ 'item-checked': item.checked }">
                            <template v-slot:prepend>
                                <v-checkbox v-model="item.checked" @change="toggleItem(item)" color="success" />
                            </template>

                            <v-list-item-title class="item-name">
                                {{ item.productName }}
                            </v-list-item-title>

                            <v-list-item-subtitle class="item-details">
                                <div class="d-flex justify-space-between align-center">
                                    <span>{{ $t('shopping.quantity') }}: {{ item.quantity }}</span>
                                    <span v-if="item.price" class="item-price">
                                        ₪{{ item.price.toFixed(2) }}
                                    </span>
                                </div>
                            </v-list-item-subtitle>

                            <template v-slot:append>
                                <div class="item-actions">
                                    <v-btn icon size="small" @click="searchPrice(item)" :loading="item.searchingPrice"
                                        class="mr-1">
                                        <v-icon>mdi-magnify</v-icon>
                                    </v-btn>
                                    <v-btn icon size="small" @click="editItem(item)" class="mr-1">
                                        <v-icon>mdi-pencil</v-icon>
                                    </v-btn>
                                    <v-btn icon size="small" @click="deleteItem(item)" color="error">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                </div>
                            </template>
                        </v-list-item>
                    </v-list>

                    <!-- Total Price -->
                    <v-divider class="my-4" />
                    <div class="total-section">
                        <div class="d-flex justify-space-between align-center">
                            <span class="text-h6">{{ $t('shopping.total') }}:</span>
                            <span class="text-h6 text-success">₪{{ totalPrice.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else-if="selectedList" class="empty-state text-center py-8">
                    <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-cart-outline</v-icon>
                    <h3 class="text-h6 text-grey">{{ $t('shopping.noItems') }}</h3>
                    <p class="text-body-2 text-grey">{{ $t('shopping.addFirstItem') }}</p>
                </div>

                <!-- No List Selected -->
                <div v-else class="no-list-state text-center py-8">
                    <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-format-list-bulleted</v-icon>
                    <h3 class="text-h6 text-grey">{{ $t('shopping.selectList') }}</h3>
                    <p class="text-body-2 text-grey">{{ $t('shopping.selectListDescription') }}</p>
                </div>
            </v-card-text>
        </v-card>

        <!-- Add Item Dialog -->
        <v-dialog v-model="showAddItemDialog" max-width="500">
            <v-card>
                <v-card-title>
                    {{ $t('shopping.addItem') }}
                </v-card-title>

                <v-card-text>
                    <v-form ref="addItemForm" v-model="formValid">
                        <v-text-field v-model="newItem.productName" :label="$t('shopping.productName')"
                            variant="outlined" :rules="[rules.required]" class="mb-3" />

                        <v-row>
                            <v-col cols="6">
                                <v-text-field v-model.number="newItem.quantity" :label="$t('shopping.quantity')"
                                    type="number" min="1" variant="outlined"
                                    :rules="[rules.required, rules.minQuantity]" />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field v-model.number="newItem.price" :label="$t('shopping.price')" type="number"
                                    step="0.01" min="0" variant="outlined" prefix="₪" />
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer />
                    <v-btn color="grey" @click="cancelAddItem">
                        {{ $t('common.cancel') }}
                    </v-btn>
                    <v-btn color="primary" @click="addItem" :disabled="!formValid">
                        {{ $t('common.add') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Edit Item Dialog -->
        <v-dialog v-model="showEditItemDialog" max-width="500">
            <v-card>
                <v-card-title>
                    {{ $t('shopping.editItem') }}
                </v-card-title>

                <v-card-text>
                    <v-form ref="editItemForm" v-model="editFormValid">
                        <v-text-field v-model="editingItem.productName" :label="$t('shopping.productName')"
                            variant="outlined" :rules="[rules.required]" class="mb-3" />

                        <v-row>
                            <v-col cols="6">
                                <v-text-field v-model.number="editingItem.quantity" :label="$t('shopping.quantity')"
                                    type="number" min="1" variant="outlined"
                                    :rules="[rules.required, rules.minQuantity]" />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field v-model.number="editingItem.price" :label="$t('shopping.price')"
                                    type="number" step="0.01" min="0" variant="outlined" prefix="₪" />
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer />
                    <v-btn color="grey" @click="cancelEditItem">
                        {{ $t('common.cancel') }}
                    </v-btn>
                    <v-btn color="primary" @click="updateItem" :disabled="!editFormValid">
                        {{ $t('common.save') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useListStore } from '@/stores/listStore'
import type { ShoppingItem, CreateShoppingItemForm } from '@/types'

const { t } = useI18n()
const listStore = useListStore()

// Reactive data
const selectedListId = ref('')
const shoppingItems = ref<ShoppingItem[]>([])
const showAddItemDialog = ref(false)
const showEditItemDialog = ref(false)
const formValid = ref(false)
const editFormValid = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const newItem = ref<CreateShoppingItemForm>({
    productName: '',
    quantity: 1,
    price: undefined
})

const editingItem = ref<ShoppingItem | null>(null)

// Computed
const shoppingLists = computed(() =>
    listStore.lists.filter(list =>
        list.name === 'קניות' || list.name === 'Shopping'
    )
)

const selectedList = computed(() =>
    shoppingLists.value.find(list => list.id === selectedListId.value)
)

const totalPrice = computed(() =>
    shoppingItems.value
        .filter(item => item.price)
        .reduce((total, item) => total + (item.price! * item.quantity), 0)
)

// Validation rules
const rules = {
    required: (value: any) => !!value || t('common.required'),
    minQuantity: (value: number) => value >= 1 || t('common.minQuantity')
}

// Methods
const loadShoppingItems = async () => {
    if (!selectedListId.value) return

    loading.value = true
    error.value = null

    try {
        // Mock data for now
        shoppingItems.value = [
            {
                id: '1',
                listId: selectedListId.value,
                productName: 'חלב',
                quantity: 2,
                price: 5.50,
                checked: false,
                position: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '2',
                listId: selectedListId.value,
                productName: 'ביצים',
                quantity: 1,
                price: 12.00,
                checked: true,
                position: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '3',
                listId: selectedListId.value,
                productName: 'לחם',
                quantity: 1,
                price: 8.50,
                checked: false,
                position: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]
    } catch (err) {
        console.error('Error loading shopping items:', err)
        error.value = t('errors.unknown')
    } finally {
        loading.value = false
    }
}

const addItem = async () => {
    if (!formValid.value || !selectedListId.value) return

    try {
        const newShoppingItem: ShoppingItem = {
            id: Date.now().toString(),
            listId: selectedListId.value,
            productName: newItem.value.productName,
            quantity: newItem.value.quantity,
            price: newItem.value.price,
            checked: false,
            position: shoppingItems.value.length,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        shoppingItems.value.push(newShoppingItem)

        // Reset form
        newItem.value = {
            productName: '',
            quantity: 1,
            price: undefined
        }

        showAddItemDialog.value = false
    } catch (err) {
        console.error('Error adding item:', err)
        error.value = t('errors.unknown')
    }
}

const editItem = (item: ShoppingItem) => {
    editingItem.value = { ...item }
    showEditItemDialog.value = true
}

const updateItem = async () => {
    if (!editFormValid.value || !editingItem.value) return

    try {
        const index = shoppingItems.value.findIndex(item => item.id === editingItem.value!.id)
        if (index !== -1) {
            shoppingItems.value[index] = { ...editingItem.value! }
        }

        editingItem.value = null
        showEditItemDialog.value = false
    } catch (err) {
        console.error('Error updating item:', err)
        error.value = t('errors.unknown')
    }
}

const deleteItem = async (item: ShoppingItem) => {
    try {
        shoppingItems.value = shoppingItems.value.filter(i => i.id !== item.id)
    } catch (err) {
        console.error('Error deleting item:', err)
        error.value = t('errors.unknown')
    }
}

const toggleItem = async (item: ShoppingItem) => {
    try {
        // Update item in store
        const index = shoppingItems.value.findIndex(i => i.id === item.id)
        if (index !== -1) {
            shoppingItems.value[index].checked = item.checked
        }
    } catch (err) {
        console.error('Error toggling item:', err)
        error.value = t('errors.unknown')
    }
}

const searchPrice = async (item: ShoppingItem) => {
    try {
        item.searchingPrice = true

        // Mock price search
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock price result
        const mockPrice = Math.random() * 50 + 5
        item.price = Math.round(mockPrice * 100) / 100

    } catch (err) {
        console.error('Error searching price:', err)
        error.value = t('shopping.priceNotFound')
    } finally {
        item.searchingPrice = false
    }
}

const cancelAddItem = () => {
    newItem.value = {
        productName: '',
        quantity: 1,
        price: undefined
    }
    showAddItemDialog.value = false
}

const cancelEditItem = () => {
    editingItem.value = null
    showEditItemDialog.value = false
}

// Lifecycle
onMounted(() => {
    // Auto-select first shopping list if available
    if (shoppingLists.value.length > 0) {
        selectedListId.value = shoppingLists.value[0].id
        loadShoppingItems()
    }
})
</script>

<style scoped>
.shopping-list {
    max-width: 800px;
    margin: 0 auto;
}

.shopping-item {
    border-radius: 8px;
    margin-bottom: 8px;
    transition: all 0.3s ease;
}

.shopping-item:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

.item-checked {
    opacity: 0.6;
    text-decoration: line-through;
}

.item-checked .item-name {
    text-decoration: line-through;
}

.item-name {
    font-weight: 500;
    font-size: 1.1rem;
}

.item-details {
    margin-top: 4px;
}

.item-price {
    font-weight: 600;
    color: #4caf50;
    font-size: 1.1rem;
}

.item-actions {
    display: flex;
    align-items: center;
}

.total-section {
    background-color: rgba(76, 175, 80, 0.1);
    padding: 16px;
    border-radius: 8px;
    border: 1px solid rgba(76, 175, 80, 0.2);
}

.empty-state,
.no-list-state {
    padding: 48px 24px;
}

/* Responsive design */
@media (max-width: 600px) {
    .shopping-list {
        margin: 0 16px;
    }

    .item-actions {
        flex-direction: column;
        gap: 4px;
    }

    .item-actions .v-btn {
        margin: 0;
    }
}
</style>
