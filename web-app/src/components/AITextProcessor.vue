<template>
    <div class="ai-text-processor">
        <v-card class="remindly-card" elevation="4">
            <v-card-title>
                <v-icon class="mr-2">mdi-brain</v-icon>
                {{ $t('ai.title') }}
            </v-card-title>

            <v-card-text>
                <v-textarea v-model="inputText" :label="$t('ai.enterText')" :placeholder="$t('ai.placeholder')" rows="4"
                    variant="outlined" :disabled="isProcessing" @keydown.ctrl.enter="processText" />

                <div class="d-flex justify-space-between align-center mt-4">
                    <v-btn color="primary" @click="processText" :loading="isProcessing" :disabled="!inputText.trim()">
                        <v-icon class="mr-1">mdi-robot</v-icon>
                        {{ $t('ai.process') }}
                    </v-btn>

                    <v-btn color="secondary" variant="outlined" @click="clearText" :disabled="isProcessing">
                        <v-icon class="mr-1">mdi-refresh</v-icon>
                        {{ $t('common.clear') }}
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>

        <!-- Processing Results -->
        <v-card v-if="processedResult" class="remindly-card mt-4" elevation="4">
            <v-card-title>
                <v-icon class="mr-2">mdi-lightbulb-outline</v-icon>
                {{ $t('ai.results') }}
            </v-card-title>

            <v-card-text>
                <!-- Task Type -->
                <div class="mb-4">
                    <v-chip :color="getTaskTypeColor(processedResult.taskType)" class="mb-2">
                        {{ getTaskTypeLabel(processedResult.taskType) }}
                    </v-chip>
                </div>

                <!-- Task Details -->
                <v-form ref="taskForm" v-model="formValid">
                    <v-text-field v-model="processedResult.title" :label="$t('tasks.taskTitle')" variant="outlined"
                        class="mb-3" />

                    <v-textarea v-model="processedResult.description" :label="$t('tasks.taskDescription')"
                        variant="outlined" rows="3" class="mb-3" />

                    <v-row>
                        <v-col cols="6">
                            <v-select v-model="processedResult.priority" :items="priorityOptions"
                                :label="$t('tasks.priority')" variant="outlined" />
                        </v-col>
                        <v-col cols="6">
                            <v-select v-model="selectedListId" :items="availableLists" :item-title="'name'"
                                :item-value="'id'" :label="$t('lists.title')" variant="outlined" />
                        </v-col>
                    </v-row>

                    <!-- Shopping Items -->
                    <div v-if="processedResult.items && processedResult.items.length > 0" class="mb-4">
                        <h4 class="mb-2">{{ $t('shopping.title') }}:</h4>
                        <v-chip v-for="(item, index) in processedResult.items" :key="index" class="ma-1" color="primary"
                            variant="outlined">
                            {{ item }}
                        </v-chip>
                    </div>

                    <!-- Contact Info -->
                    <div v-if="processedResult.contactName" class="mb-4">
                        <h4 class="mb-2">{{ $t('ai.contact') }}:</h4>
                        <v-chip color="info" variant="outlined">
                            {{ processedResult.contactName }}
                        </v-chip>
                    </div>

                    <!-- Location -->
                    <div v-if="processedResult.location" class="mb-4">
                        <h4 class="mb-2">{{ $t('ai.location') }}:</h4>
                        <v-chip color="success" variant="outlined">
                            {{ processedResult.location }}
                        </v-chip>
                    </div>
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn color="grey" variant="outlined" @click="processedResult = null">
                    {{ $t('common.cancel') }}
                </v-btn>
                <v-btn color="primary" @click="createTask" :disabled="!formValid || !selectedListId">
                    <v-icon class="mr-1">mdi-plus</v-icon>
                    {{ $t('tasks.addTask') }}
                </v-btn>
            </v-card-actions>
        </v-card>

        <!-- Error Display -->
        <v-alert v-if="error" type="error" class="mt-4" closable @click:close="error = null">
            {{ error }}
        </v-alert>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/taskStore'
import { useListStore } from '@/stores/listStore'
import type { AIProcessedText } from '@/types'

const { t } = useI18n()
const taskStore = useTaskStore()
const listStore = useListStore()

// Reactive data
const inputText = ref('')
const isProcessing = ref(false)
const processedResult = ref<AIProcessedText | null>(null)
const selectedListId = ref('')
const formValid = ref(false)
const error = ref<string | null>(null)

// Computed
const availableLists = computed(() => listStore.lists)

const priorityOptions = computed(() => [
    { title: t('tasks.low'), value: 'low' },
    { title: t('tasks.medium'), value: 'medium' },
    { title: t('tasks.high'), value: 'high' },
    { title: t('tasks.urgent'), value: 'urgent' }
])

// Methods
const processText = async () => {
    if (!inputText.value.trim()) return

    isProcessing.value = true
    error.value = null

    try {
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Mock AI processing result
        const mockResult: AIProcessedText = {
            taskType: detectTaskType(inputText.value),
            title: generateTitle(inputText.value),
            description: inputText.value,
            priority: detectPriority(inputText.value),
            items: extractItems(inputText.value),
            contactName: extractContact(inputText.value),
            location: extractLocation(inputText.value)
        }

        processedResult.value = mockResult

        // Auto-select appropriate list
        const appropriateList = findAppropriateList(mockResult.taskType)
        if (appropriateList) {
            selectedListId.value = appropriateList.id
        }

    } catch (err) {
        console.error('Error processing text:', err)
        error.value = t('errors.unknown')
    } finally {
        isProcessing.value = false
    }
}

const detectTaskType = (text: string): AIProcessedText['taskType'] => {
    const lowerText = text.toLowerCase()

    if (lowerText.includes('קנה') || lowerText.includes('קני') || lowerText.includes('סופר') || lowerText.includes('מכולת')) {
        return 'shopping'
    }
    if (lowerText.includes('התקשר') || lowerText.includes('טלפון') || lowerText.includes('call')) {
        return 'call'
    }
    if (lowerText.includes('פגישה') || lowerText.includes('meeting') || lowerText.includes('ישיבה')) {
        return 'meeting'
    }
    if (lowerText.includes('תור') || lowerText.includes('רופא') || lowerText.includes('appointment')) {
        return 'appointment'
    }
    if (lowerText.includes('תקן') || lowerText.includes('תיקון') || lowerText.includes('repair')) {
        return 'repair'
    }

    return 'general'
}

const generateTitle = (text: string): string => {
    // Simple title generation - take first few words
    const words = text.split(' ').slice(0, 4)
    return words.join(' ')
}

const detectPriority = (text: string): AIProcessedText['priority'] => {
    const lowerText = text.toLowerCase()

    if (lowerText.includes('דחוף') || lowerText.includes('חשוב') || lowerText.includes('urgent')) {
        return 'urgent'
    }
    if (lowerText.includes('גבוה') || lowerText.includes('high')) {
        return 'high'
    }
    if (lowerText.includes('נמוך') || lowerText.includes('low')) {
        return 'low'
    }

    return 'medium'
}

const extractItems = (text: string): string[] => {
    // Simple item extraction for shopping lists
    const shoppingKeywords = ['חלב', 'ביצים', 'לחם', 'בשר', 'ירקות', 'פירות']
    return shoppingKeywords.filter(item => text.includes(item))
}

const extractContact = (text: string): string | undefined => {
    // Simple contact extraction
    const contactPattern = /(?:התקשר ל|call|טלפון ל)\s*([א-ת\s]+)/i
    const match = text.match(contactPattern)
    return match ? match[1].trim() : undefined
}

const extractLocation = (text: string): string | undefined => {
    // Simple location extraction
    const locationKeywords = ['בבית', 'במשרד', 'בסופר', 'בבית חולים', 'בבית הספר']
    return locationKeywords.find(loc => text.includes(loc))
}

const findAppropriateList = (taskType: AIProcessedText['taskType']) => {
    const listMap = {
        shopping: 'קניות',
        call: 'שיחות טלפון',
        meeting: 'פגישות',
        appointment: 'תורים',
        repair: 'תיקונים',
        general: 'משימות'
    }

    const listName = listMap[taskType]
    return listStore.lists.find(list => list.name === listName)
}

const getTaskTypeColor = (taskType: AIProcessedText['taskType']) => {
    const colorMap = {
        shopping: 'success',
        call: 'info',
        meeting: 'primary',
        appointment: 'warning',
        repair: 'error',
        general: 'secondary'
    }
    return colorMap[taskType]
}

const getTaskTypeLabel = (taskType: AIProcessedText['taskType']) => {
    const labelMap = {
        shopping: t('shopping.title'),
        call: t('navigation.calls'),
        meeting: t('navigation.meetings'),
        appointment: t('navigation.appointments'),
        repair: t('navigation.repairs'),
        general: t('tasks.title')
    }
    return labelMap[taskType]
}

const createTask = async () => {
    if (!processedResult.value || !selectedListId.value) return

    try {
        await taskStore.addTask({
            title: processedResult.value.title,
            description: processedResult.value.description,
            listId: selectedListId.value,
            priority: processedResult.value.priority
        })

        // Reset form
        processedResult.value = null
        inputText.value = ''
        selectedListId.value = ''

    } catch (err) {
        console.error('Error creating task:', err)
        error.value = t('errors.unknown')
    }
}

const clearText = () => {
    inputText.value = ''
    processedResult.value = null
    selectedListId.value = ''
    error.value = null
}
</script>

<style scoped>
.ai-text-processor {
    max-width: 800px;
    margin: 0 auto;
}

.v-textarea :deep(.v-field__input) {
    min-height: 100px;
}

/* Task type chip styling */
.v-chip {
    font-weight: 500;
}

/* Form validation */
.v-form {
    margin-top: 16px;
}

/* Responsive design */
@media (max-width: 600px) {
    .ai-text-processor {
        margin: 0 16px;
    }

    .v-card {
        margin-bottom: 16px;
    }
}
</style>
