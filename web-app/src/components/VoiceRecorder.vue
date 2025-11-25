<template>
    <div class="voice-recorder">
        <v-card class="remindly-card" elevation="4">
            <v-card-title class="text-center">
                <v-icon size="32" class="mr-2">mdi-microphone</v-icon>
                {{ $t('voice.title') }}
            </v-card-title>

            <v-card-text class="text-center">
                <!-- Recording Button -->
                <v-btn :color="isRecording ? 'error' : 'primary'" :icon="isRecording ? 'mdi-stop' : 'mdi-microphone'"
                    size="x-large" :loading="isProcessing" :disabled="!isSupported" @click="toggleRecording"
                    class="recording-button mb-4" />

                <!-- Status Text -->
                <div class="status-text">
                    <p v-if="!isSupported" class="text-error">
                        {{ $t('voice.error') }} - {{ $t('errors.unknown') }}
                    </p>
                    <p v-else-if="isRecording" class="text-error">
                        {{ $t('voice.recording') }}
                    </p>
                    <p v-else-if="isProcessing" class="text-info">
                        {{ $t('voice.processing') }}
                    </p>
                    <p v-else-if="error" class="text-error">
                        {{ error }}
                    </p>
                    <p v-else-if="lastRecording" class="text-success">
                        {{ $t('voice.completed') }}
                    </p>
                    <p v-else class="text-medium-emphasis">
                        {{ $t('voice.speakNow') }}
                    </p>
                </div>

                <!-- Recording Duration -->
                <div v-if="isRecording" class="recording-duration mt-2">
                    <v-chip color="error" variant="outlined">
                        {{ formatDuration(recordingDuration) }}
                    </v-chip>
                </div>

                <!-- Audio Waveform Visualization -->
                <div v-if="isRecording" class="waveform-container mt-4">
                    <div class="waveform">
                        <div v-for="(bar, index) in waveformBars" :key="index" class="waveform-bar"
                            :style="{ height: bar + '%' }" />
                    </div>
                </div>
            </v-card-text>

            <v-card-actions v-if="lastRecording" class="justify-center">
                <v-btn color="primary" variant="outlined" @click="processRecording" :loading="isProcessing">
                    {{ $t('voice.createTask') }}
                </v-btn>
                <v-btn color="secondary" variant="outlined" @click="playRecording" :disabled="!audioUrl">
                    <v-icon class="mr-1">mdi-play</v-icon>
                    {{ $t('common.play') }}
                </v-btn>
            </v-card-actions>
        </v-card>

        <!-- Processing Results Dialog -->
        <v-dialog v-model="showResults" max-width="600">
            <v-card>
                <v-card-title>
                    <v-icon class="mr-2">mdi-brain</v-icon>
                    {{ $t('voice.processing') }}
                </v-card-title>

                <v-card-text>
                    <div v-if="processedText">
                        <h4 class="mb-2">{{ $t('common.text') }}:</h4>
                        <p class="mb-4">{{ processedText }}</p>
                    </div>

                    <div v-if="aiProcessed">
                        <h4 class="mb-2">{{ $t('tasks.title') }}:</h4>
                        <v-list>
                            <v-list-item>
                                <v-list-item-title>{{ aiProcessed.title }}</v-list-item-title>
                                <v-list-item-subtitle v-if="aiProcessed.description">
                                    {{ aiProcessed.description }}
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </div>
                </v-card-text>

                <v-card-actions>
                    <v-spacer />
                    <v-btn color="grey" @click="showResults = false">
                        {{ $t('common.cancel') }}
                    </v-btn>
                    <v-btn color="primary" @click="createTaskFromVoice">
                        {{ $t('voice.createTask') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/taskStore'
import { useListStore } from '@/stores/listStore'
import type { AIProcessedText } from '@/types'

const { t } = useI18n()
const taskStore = useTaskStore()
const listStore = useListStore()

// Reactive data
const isRecording = ref(false)
const isProcessing = ref(false)
const isSupported = ref(true)
const error = ref<string | null>(null)
const recordingDuration = ref(0)
const audioUrl = ref<string | null>(null)
const processedText = ref<string | null>(null)
const aiProcessed = ref<AIProcessedText | null>(null)
const showResults = ref(false)
const lastRecording = ref<Blob | null>(null)

// MediaRecorder and related
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let recordingInterval: number | null = null
let waveformInterval: number | null = null

// Waveform visualization
const waveformBars = ref<number[]>(Array(20).fill(0))

// Computed
const canRecord = computed(() => isSupported.value && !isProcessing.value)

// Methods
const toggleRecording = async () => {
    if (isRecording.value) {
        stopRecording()
    } else {
        await startRecording()
    }
}

const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

        mediaRecorder = new MediaRecorder(stream)
        audioChunks = []

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data)
            }
        }

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
            lastRecording.value = audioBlob
            audioUrl.value = URL.createObjectURL(audioBlob)

            // Stop all tracks
            stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.start()
        isRecording.value = true
        recordingDuration.value = 0
        error.value = null

        // Start duration timer
        recordingInterval = window.setInterval(() => {
            recordingDuration.value++
        }, 1000)

        // Start waveform animation
        startWaveformAnimation()

    } catch (err) {
        console.error('Error starting recording:', err)
        error.value = t('voice.error')
        isSupported.value = false
    }
}

const stopRecording = () => {
    if (mediaRecorder && isRecording.value) {
        mediaRecorder.stop()
        isRecording.value = false

        // Clear intervals
        if (recordingInterval) {
            clearInterval(recordingInterval)
            recordingInterval = null
        }
        if (waveformInterval) {
            clearInterval(waveformInterval)
            waveformInterval = null
        }
    }
}

const startWaveformAnimation = () => {
    waveformInterval = window.setInterval(() => {
        waveformBars.value = waveformBars.value.map(() =>
            Math.random() * 100
        )
    }, 100)
}

const processRecording = async () => {
    if (!lastRecording.value) return

    isProcessing.value = true
    error.value = null

    try {
        // Simulate voice processing
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Mock processed text
        processedText.value = "קנה חלב, ביצים ולחם מהסופר"

        // Mock AI processing
        aiProcessed.value = {
            taskType: 'shopping',
            title: 'קנייה בסופר',
            description: 'קנה חלב, ביצים ולחם',
            priority: 'medium',
            items: ['חלב', 'ביצים', 'לחם']
        }

        showResults.value = true

    } catch (err) {
        console.error('Error processing recording:', err)
        error.value = t('voice.error')
    } finally {
        isProcessing.value = false
    }
}

const createTaskFromVoice = async () => {
    if (!aiProcessed.value) return

    try {
        // Find shopping list
        const shoppingList = listStore.lists.find(l => l.name === 'קניות')
        if (!shoppingList) {
            error.value = 'רשימת קניות לא נמצאה'
            return
        }

        // Create task
        await taskStore.addTask({
            title: aiProcessed.value.title,
            description: aiProcessed.value.description,
            listId: shoppingList.id,
            priority: aiProcessed.value.priority
        })

        showResults.value = false
        processedText.value = null
        aiProcessed.value = null
        lastRecording.value = null

        if (audioUrl.value) {
            URL.revokeObjectURL(audioUrl.value)
            audioUrl.value = null
        }

    } catch (err) {
        console.error('Error creating task:', err)
        error.value = t('errors.unknown')
    }
}

const playRecording = () => {
    if (audioUrl.value) {
        const audio = new Audio(audioUrl.value)
        audio.play()
    }
}

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Lifecycle
onMounted(() => {
    // Check if MediaRecorder is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        isSupported.value = false
        error.value = t('voice.error')
    }
})

onUnmounted(() => {
    if (recordingInterval) {
        clearInterval(recordingInterval)
    }
    if (waveformInterval) {
        clearInterval(waveformInterval)
    }
    if (audioUrl.value) {
        URL.revokeObjectURL(audioUrl.value)
    }
})
</script>

<style scoped>
.voice-recorder {
    max-width: 500px;
    margin: 0 auto;
}

.recording-button {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.recording-button:hover {
    transform: scale(1.05);
}

.recording-button.recording {
    animation: pulse 1.5s infinite;
}

.status-text p {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
}

.recording-duration {
    display: flex;
    justify-content: center;
}

.waveform-container {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}

.waveform {
    display: flex;
    align-items: end;
    height: 60px;
    gap: 2px;
}

.waveform-bar {
    width: 4px;
    background: linear-gradient(to top, #1976d2, #42a5f5);
    border-radius: 2px;
    transition: height 0.1s ease;
    min-height: 2px;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
    }

    70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
    }

    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
    }
}

/* Responsive design */
@media (max-width: 600px) {
    .recording-button {
        width: 60px;
        height: 60px;
    }

    .waveform {
        height: 40px;
    }

    .waveform-bar {
        width: 3px;
    }
}
</style>
