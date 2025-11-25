<template>
  <div class="media-gallery-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <v-icon class="mr-2 header-icon">mdi-photo-library</v-icon>
        <h1 class="app-title">MEDIA GALLERY</h1>
        <p class="app-subtitle">Photos, Videos & Audio</p>
      </div>
    </div>

    <!-- Filter Tabs -->
    <v-container fluid class="pa-4">
      <v-row>
        <v-col cols="12">
          <v-chip-group
            v-model="selectedFilter"
            mandatory
            class="filter-chips"
          >
            <v-chip
              v-for="filter in filters"
              :key="filter.value"
              :value="filter.value"
              :color="selectedFilter === filter.value ? 'primary' : 'grey'"
              :variant="selectedFilter === filter.value ? 'flat' : 'outlined'"
            >
              <v-icon :start="true">{{ filter.icon }}</v-icon>
              {{ filter.label }}
            </v-chip>
          </v-chip-group>
        </v-col>
      </v-row>

      <!-- Media Grid -->
      <v-row>
        <v-col cols="12">
          <v-card class="media-card" elevation="4">
            <v-card-text class="pa-6">
              <div class="media-grid">
                <!-- Add Media Button -->
                <div class="add-media-item" @click="showAddMediaDialog">
                  <v-icon size="48" color="grey">mdi-plus-circle-outline</v-icon>
                  <p class="text-grey">Add Media</p>
                </div>

                <!-- Media Items -->
                <div
                  v-for="(media, index) in filteredMedia"
                  :key="media.id"
                  class="media-item"
                  @click="showMediaDetails(media)"
                >
                  <div class="media-preview">
                    <img
                      v-if="media.mediaType === 'image'"
                      :src="media.thumbnailUrl || media.fileUrl"
                      :alt="media.title"
                      @error="handleImageError"
                    />
                    <div
                      v-else-if="media.mediaType === 'video'"
                      class="video-preview"
                    >
                      <img
                        :src="media.thumbnailUrl"
                        :alt="media.title"
                        @error="handleImageError"
                      />
                      <v-icon class="play-icon">mdi-play-circle</v-icon>
                    </div>
                    <div v-else class="audio-preview">
                      <v-icon size="48" color="grey">mdi-music-note</v-icon>
                    </div>
                  </div>
                  <div class="media-info">
                    <h4 class="media-title">{{ media.title }}</h4>
                    <p class="media-date">{{ formatDate(media.createdAt) }}</p>
                  </div>
                  <div class="media-actions">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click.stop="shareMedia(media)"
                    >
                      <v-icon>mdi-share</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click.stop="editMedia(media)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Add Media Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500">
      <v-card>
        <v-card-title>Add Media</v-card-title>
        <v-card-text>
          <v-form ref="addForm" v-model="formValid">
            <v-text-field
              v-model="newMedia.title"
              label="Title"
              :rules="[rules.required]"
              required
            />
            <v-textarea
              v-model="newMedia.description"
              label="Description"
              rows="3"
            />
            <v-file-input
              v-model="newMedia.file"
              label="Media File"
              :rules="[rules.required]"
              accept="image/*,video/*,audio/*"
              required
            />
            <v-select
              v-model="newMedia.mediaType"
              :items="mediaTypes"
              label="Media Type"
              :rules="[rules.required]"
              required
            />
            <v-combobox
              v-model="newMedia.tags"
              label="Tags"
              multiple
              chips
              closable-chips
            />
            <v-switch
              v-model="newMedia.isPublic"
              label="Public"
              color="primary"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="cancelAddMedia">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="addMedia"
            :disabled="!formValid"
            :loading="uploading"
          >
            {{ uploading ? 'Uploading...' : 'Add Media' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Media Details Dialog -->
    <v-dialog v-model="showDetailsDialog" max-width="800">
      <v-card v-if="selectedMedia">
        <v-card-title>
          {{ selectedMedia.title }}
          <v-spacer />
          <v-btn icon @click="showDetailsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div class="media-details">
            <div class="media-display">
              <img
                v-if="selectedMedia.mediaType === 'image'"
                :src="selectedMedia.fileUrl"
                :alt="selectedMedia.title"
                class="media-image"
              />
              <video
                v-else-if="selectedMedia.mediaType === 'video'"
                :src="selectedMedia.fileUrl"
                controls
                class="media-video"
              />
              <audio
                v-else
                :src="selectedMedia.fileUrl"
                controls
                class="media-audio"
              />
            </div>
            <div class="media-meta">
              <p><strong>Type:</strong> {{ selectedMedia.mediaType }}</p>
              <p><strong>Size:</strong> {{ formatFileSize(selectedMedia.fileSize) }}</p>
              <p v-if="selectedMedia.duration">
                <strong>Duration:</strong> {{ formatDuration(selectedMedia.duration) }}
              </p>
              <p v-if="selectedMedia.description">
                <strong>Description:</strong> {{ selectedMedia.description }}
              </p>
              <p v-if="selectedMedia.tags && selectedMedia.tags.length">
                <strong>Tags:</strong>
                <v-chip
                  v-for="tag in selectedMedia.tags"
                  :key="tag"
                  size="small"
                  class="ma-1"
                >
                  {{ tag }}
                </v-chip>
              </p>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="shareMedia(selectedMedia)">
            <v-icon start>mdi-share</v-icon>
            Share
          </v-btn>
          <v-btn color="secondary" @click="editMedia(selectedMedia)">
            <v-icon start>mdi-pencil</v-icon>
            Edit
          </v-btn>
          <v-spacer />
          <v-btn color="error" @click="deleteMedia(selectedMedia)">
            <v-icon start>mdi-delete</v-icon>
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMediaGalleryStore } from '@/stores/mediaGalleryStore'

const mediaGalleryStore = useMediaGalleryStore()

// Reactive data
const selectedFilter = ref('all')
const showAddDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedMedia = ref(null)
const formValid = ref(false)
const uploading = ref(false)

const newMedia = ref({
  title: '',
  description: '',
  file: null,
  mediaType: 'image',
  tags: [],
  isPublic: false
})

// Filter options
const filters = [
  { value: 'all', label: 'All', icon: 'mdi-view-grid' },
  { value: 'image', label: 'Photos', icon: 'mdi-image' },
  { value: 'video', label: 'Videos', icon: 'mdi-video' },
  { value: 'audio', label: 'Audio', icon: 'mdi-music-note' }
]

const mediaTypes = [
  { value: 'image', title: 'Image' },
  { value: 'video', title: 'Video' },
  { value: 'audio', title: 'Audio' }
]

// Mock data for now
const mediaItems = ref([
  {
    id: '1',
    title: 'Sunset Photo',
    description: 'Beautiful sunset at the beach',
    mediaType: 'image',
    fileUrl: 'https://picsum.photos/800/600?random=1',
    thumbnailUrl: 'https://picsum.photos/300/300?random=1',
    fileSize: 1024000,
    duration: 0,
    tags: ['sunset', 'beach', 'nature'],
    isPublic: false,
    createdAt: '2024-01-15T10:30:00Z',
    viewCount: 5,
    shareCount: 2
  },
  {
    id: '2',
    title: 'Vacation Video',
    description: 'Fun times at the beach',
    mediaType: 'video',
    fileUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: 'https://picsum.photos/300/300?random=2',
    fileSize: 1048576,
    duration: 60,
    tags: ['vacation', 'beach', 'fun'],
    isPublic: true,
    createdAt: '2024-01-14T15:45:00Z',
    viewCount: 12,
    shareCount: 5
  },
  {
    id: '3',
    title: 'Meeting Audio',
    description: 'Important team meeting',
    mediaType: 'audio',
    fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    fileSize: 512000,
    duration: 30,
    tags: ['meeting', 'work', 'important'],
    isPublic: false,
    createdAt: '2024-01-13T09:20:00Z',
    viewCount: 3,
    shareCount: 0
  }
])

// Computed
const filteredMedia = computed(() => {
  if (selectedFilter.value === 'all') {
    return mediaItems.value
  }
  return mediaItems.value.filter(item => item.mediaType === selectedFilter.value)
})

// Validation rules
const rules = {
  required: (value: any) => !!value || 'Required field'
}

// Methods
const showAddMediaDialog = () => {
  newMedia.value = {
    title: '',
    description: '',
    file: null,
    mediaType: 'image',
    tags: [],
    isPublic: false
  }
  showAddDialog.value = true
}

const cancelAddMedia = () => {
  showAddDialog.value = false
  newMedia.value = {
    title: '',
    description: '',
    file: null,
    mediaType: 'image',
    tags: [],
    isPublic: false
  }
}

const addMedia = async () => {
  if (!newMedia.value.file) return
  
  uploading.value = true
  try {
    // TODO: Implement actual upload
    const newItem = {
      id: Date.now().toString(),
      title: newMedia.value.title,
      description: newMedia.value.description,
      mediaType: newMedia.value.mediaType,
      fileUrl: URL.createObjectURL(newMedia.value.file),
      thumbnailUrl: newMedia.value.mediaType === 'image' ? URL.createObjectURL(newMedia.value.file) : null,
      fileSize: newMedia.value.file.size,
      duration: 0,
      tags: newMedia.value.tags,
      isPublic: newMedia.value.isPublic,
      createdAt: new Date().toISOString(),
      viewCount: 0,
      shareCount: 0
    }
    
    mediaItems.value.unshift(newItem)
    showAddDialog.value = false
  } catch (error) {
    console.error('Error adding media:', error)
  } finally {
    uploading.value = false
  }
}

const showMediaDetails = (media: any) => {
  selectedMedia.value = media
  showDetailsDialog.value = true
}

const editMedia = (media: any) => {
  // TODO: Implement edit functionality
  console.log('Edit media:', media)
}

const shareMedia = (media: any) => {
  // TODO: Implement share functionality
  console.log('Share media:', media)
}

const deleteMedia = (media: any) => {
  const index = mediaItems.value.findIndex(item => item.id === media.id)
  if (index !== -1) {
    mediaItems.value.splice(index, 1)
  }
  showDetailsDialog.value = false
}

const handleImageError = (event: any) => {
  event.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  // Load media items from store
  mediaGalleryStore.loadMediaItems()
})
</script>

<style scoped>
.media-gallery-view {
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

.filter-chips {
  justify-content: center;
  margin-bottom: 2rem;
}

.media-card {
  border-radius: 16px;
  overflow: hidden;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.add-media-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 2px dashed #ccc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-media-item:hover {
  border-color: #1976D2;
  background-color: #f5f5f5;
}

.media-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.media-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.media-preview {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.media-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.audio-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f5f5f5;
}

.media-info {
  padding: 12px;
  background: white;
}

.media-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #2c3e50;
}

.media-date {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.media-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-item:hover .media-actions {
  opacity: 1;
}

.media-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.media-display {
  text-align: center;
}

.media-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
}

.media-video {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
}

.media-audio {
  width: 100%;
  max-width: 400px;
}

.media-meta {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

.media-meta p {
  margin: 8px 0;
}

/* Responsive Design */
@media (max-width: 600px) {
  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 0.9rem;
  }

  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .add-media-item {
    height: 150px;
  }

  .media-preview {
    height: 120px;
  }
}
</style>
