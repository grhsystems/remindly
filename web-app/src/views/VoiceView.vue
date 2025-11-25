<template>
  <div class="voice-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <v-icon class="mr-2 header-icon">mdi-microphone</v-icon>
        <h1 class="app-title">VOICE MEMOS</h1>
        <p class="app-subtitle">Quick Thoughts, Audio Notes</p>
      </div>
    </div>

    <!-- Main Content -->
    <v-container fluid class="pa-4">
      <v-row>
        <!-- Voice Recordings List -->
        <v-col cols="12">
          <v-card class="recordings-card" elevation="4">
            <v-card-text class="pa-6">
              <div class="recordings-list">
                <div
                  v-for="(recording, index) in recordings"
                  :key="recording.id"
                  class="recording-item"
                >
                  <div class="recording-left">
                    <v-icon
                      :color="recording.isCompleted ? 'primary' : 'grey'"
                      size="24"
                    >
                      {{ recording.isCompleted ? 'mdi-check-circle' : 'mdi-microphone' }}
                    </v-icon>
                  </div>
                  
                  <div class="recording-content">
                    <h3 class="recording-title">{{ recording.title }}</h3>
                    <p class="recording-subtitle">{{ recording.subtitle }}</p>
                  </div>
                  
                  <div class="recording-actions">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click.stop="playRecording(recording)"
                      :disabled="!recording.audioUrl"
                    >
                      <v-icon>{{ isPlaying === recording.id ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click.stop="editRecording(recording)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click.stop="deleteRecording(recording)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Bottom Navigation Bar -->
    <div class="bottom-nav">
      <v-btn
        icon
        variant="text"
        size="large"
        @click="navigateToHome"
        class="nav-button"
      >
        <v-icon>mdi-home</v-icon>
        <span class="nav-label">Home</span>
      </v-btn>
      
      <v-btn
        color="primary"
        size="large"
        rounded
        elevation="8"
        @click="startRecording"
        class="new-recording-button"
      >
        <v-icon start>mdi-microphone</v-icon>
        New Recording
      </v-btn>
      
      <v-btn
        icon
        variant="text"
        size="large"
        @click="navigateToSettings"
        class="nav-button"
      >
        <v-icon>mdi-cog</v-icon>
        <span class="nav-label">Settings</span>
      </v-btn>
    </div>

    <!-- Recording Dialog -->
    <v-dialog v-model="showRecordingDialog" max-width="400">
      <v-card>
        <v-card-title class="text-center">
          Voice Recording
        </v-card-title>

        <v-card-text class="text-center">
          <v-btn
            :color="isRecording ? 'error' : 'primary'"
            :icon="isRecording ? 'mdi-stop' : 'mdi-microphone'"
            size="x-large"
            @click="toggleRecording"
          />

          <div class="mt-4">
            <p v-if="!isRecording">Click the button to start recording</p>
            <p v-else class="text-error">Recording... Click again to stop</p>
          </div>

          <div v-if="recordingDuration > 0" class="mt-2">
            <p class="text-h6">{{ formatDuration(recordingDuration) }}</p>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="cancelRecording">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveRecording"
            :disabled="recordingDuration === 0"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Recording Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600">
      <v-card>
        <v-card-title>
          Edit Recording
        </v-card-title>

        <v-card-text>
          <v-form ref="editForm" v-model="formValid">
            <v-text-field
              v-model="editingRecording.title"
              label="Title"
              :rules="[rules.required]"
              required
            />

            <v-textarea
              v-model="editingRecording.description"
              label="Description"
              rows="3"
            />

            <v-textarea
              v-model="editingRecording.transcription"
              label="Transcription"
              rows="4"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showEditDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="saveEdit" :disabled="!formValid">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Audio Player -->
    <audio
      ref="audioPlayer"
      @ended="onPlaybackEnded"
      @timeupdate="onTimeUpdate"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVoiceRecordingStore } from '@/stores/voiceRecordingStore'

const router = useRouter()
const voiceRecordingStore = useVoiceRecordingStore()

// Reactive data
const showRecordingDialog = ref(false)
const showEditDialog = ref(false)
const isRecording = ref(false)
const recordingDuration = ref(0)
const formValid = ref(false)
const recordingInterval = ref<number | null>(null)
const isPlaying = ref<string | null>(null)
const audioPlayer = ref<HTMLAudioElement | null>(null)

const editingRecording = ref({
  id: '',
  title: '',
  description: '',
  transcription: ''
})

// Mock data for now - matching the image exactly
const recordings = ref([
  {
    id: '1',
    title: 'Meeting Notes',
    subtitle: 'Mon, June 10, 2:44 PM • 3 min 12 sec',
    isCompleted: true,
    duration: 192,
    audioUrl: '/audio/meeting-notes.mp3'
  },
  {
    id: '2',
    title: 'Grocery List Draft',
    subtitle: '0 min 56 • 1 min 55 sec',
    isCompleted: false,
    duration: 115,
    audioUrl: '/audio/grocery-list.mp3'
  },
  {
    id: '3',
    title: 'Grocery List Draft',
    subtitle: 'This Morning',
    isCompleted: false,
    duration: 90,
    audioUrl: '/audio/grocery-draft.mp3'
  },
  {
    id: '4',
    title: 'New App Idea',
    subtitle: 'June 9 • 1 min 30 sc',
    isCompleted: false,
    duration: 90,
    audioUrl: '/audio/app-idea.mp3'
  },
  {
    id: '5',
    title: 'Workout Plan Reminders',
    subtitle: 'Yesterday • 2 min 07 sec',
    isCompleted: false,
    duration: 127,
    audioUrl: '/audio/workout-plan.mp3'
  }
])

// Validation rules
const rules = {
  required: (value: any) => !!value || 'Required field'
}

// Methods
const startRecording = () => {
  showRecordingDialog.value = true
  isRecording.value = false
  recordingDuration.value = 0
}

const toggleRecording = () => {
  if (isRecording.value) {
    // Stop recording
    isRecording.value = false
    if (recordingInterval.value) {
      clearInterval(recordingInterval.value)
      recordingInterval.value = null
    }
  } else {
    // Start recording
    isRecording.value = true
    recordingDuration.value = 0
    recordingInterval.value = setInterval(() => {
      recordingDuration.value++
    }, 1000)
  }
}

const cancelRecording = () => {
  isRecording.value = false
  recordingDuration.value = 0
  if (recordingInterval.value) {
    clearInterval(recordingInterval.value)
    recordingInterval.value = null
  }
  showRecordingDialog.value = false
}

const saveRecording = async () => {
  try {
    // Here you would save the actual recording
    const newRecording = {
      id: Date.now().toString(),
      title: `Recording ${new Date().toLocaleDateString()}`,
      subtitle: `${formatDuration(recordingDuration.value)}`,
      isCompleted: false,
      duration: recordingDuration.value
    }
    
    recordings.value.unshift(newRecording)
    
    // Reset
    cancelRecording()
  } catch (error) {
    console.error('Error saving recording:', error)
  }
}

const playRecording = (recording: any) => {
  if (isPlaying.value === recording.id) {
    // Pause current recording
    if (audioPlayer.value) {
      audioPlayer.value.pause()
    }
    isPlaying.value = null
  } else {
    // Play new recording
    if (audioPlayer.value) {
      audioPlayer.value.src = recording.audioUrl
      audioPlayer.value.play()
      isPlaying.value = recording.id
    }
  }
}

const onPlaybackEnded = () => {
  isPlaying.value = null
}

const onTimeUpdate = () => {
  // Handle time updates if needed
}

const deleteRecording = (recording: any) => {
  const index = recordings.value.findIndex(r => r.id === recording.id)
  if (index > -1) {
    recordings.value.splice(index, 1)
  }
}

const editRecording = (recording: any) => {
  editingRecording.value = { ...recording }
  showEditDialog.value = true
}

const saveEdit = async () => {
  try {
    const index = recordings.value.findIndex(r => r.id === editingRecording.value.id)
    if (index !== -1) {
      recordings.value[index] = { ...recordings.value[index], ...editingRecording.value }
    }
    showEditDialog.value = false
  } catch (error) {
    console.error('Error saving edit:', error)
  }
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Navigation functions
const navigateToHome = () => {
  router.push('/')
}

const navigateToSettings = () => {
  router.push('/settings')
}

onMounted(() => {
  // Load recordings from store
  voiceRecordingStore.loadRecordings()
})
</script>

<style scoped>
.voice-view {
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
  max-width: 400px;
  margin: 0 auto;
}

.header-icon {
  color: white;
  font-size: 2rem;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #2c3e50;
  margin: 0.5rem 0;
  letter-spacing: 2px;
}

.app-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  letter-spacing: 1px;
}

.recordings-card {
  border-radius: 16px;
  overflow: hidden;
}

.recordings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recording-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.recording-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.recording-left {
  margin-right: 16px;
}

.recording-content {
  flex: 1;
}

.recording-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.recording-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.recording-actions {
  margin-left: 16px;
  display: flex;
  gap: 4px;
}

/* Bottom Navigation Bar */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 16px;
  z-index: 1000;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.nav-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
  height: 60px;
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.new-recording-button {
  font-size: 1rem;
  font-weight: 600;
  padding: 12px 24px;
  text-transform: none;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.new-recording-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* Add bottom padding to main content to account for fixed bottom nav */
.voice-view {
  padding-bottom: 80px;
}

/* Responsive Design */
@media (max-width: 600px) {
  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 0.9rem;
  }

  .recording-item {
    padding: 12px;
  }

  .recording-title {
    font-size: 14px;
  }

  .recording-subtitle {
    font-size: 12px;
  }

  .bottom-nav {
    padding: 4px 8px;
  }

  .nav-button {
    min-width: 50px;
    height: 50px;
  }

  .nav-label {
    font-size: 10px;
  }

  .new-recording-button {
    font-size: 0.9rem;
    padding: 8px 16px;
  }
}
</style>