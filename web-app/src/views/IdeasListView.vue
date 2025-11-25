<template>
  <div class="ideas-list-view">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <v-icon class="mr-2 header-icon">mdi-lightbulb-outline</v-icon>
        <h1 class="app-title">IDEAS</h1>
        <p class="app-subtitle">{{ ideasList?.description || 'New App Features & Travel Plans' }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <v-container fluid class="pa-4">
      <v-row>
        <v-col cols="12">
          <v-card class="ideas-list-card" elevation="4">
            <v-card-text class="pa-6">
              <!-- Ideas List -->
              <div v-if="ideas.length > 0" class="ideas-list">
                <div
                  v-for="idea in ideas"
                  :key="idea.id"
                  class="idea-item"
                  :class="{ 'completed': idea.completed }"
                >
                  <div class="idea-left">
                    <v-checkbox-btn
                      v-model="idea.completed"
                      color="primary"
                      @click.stop="toggleIdeaCompletion(idea)"
                    />
                  </div>
                  
                  <div class="idea-content">
                    <h3 class="idea-title">{{ idea.title }}</h3>
                    <p v-if="idea.description" class="idea-description">{{ idea.description }}</p>
                  </div>
                  
                  <div class="idea-actions">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click.stop="editIdea(idea)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click.stop="deleteIdea(idea)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="empty-state">
                <v-icon size="80" color="grey" class="mb-4">mdi-lightbulb-outline</v-icon>
                <h3 class="empty-title">No Ideas Yet</h3>
                <p class="empty-description">Add your first idea to this list</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Add Idea Button -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-btn
            color="primary"
            size="large"
            block
            rounded
            elevation="8"
            class="add-idea-button"
            @click="showAddIdeaDialog = true"
          >
            <v-icon start>mdi-plus</v-icon>
            Add New Idea
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- Add/Edit Idea Dialog -->
    <v-dialog v-model="showAddIdeaDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">{{ isEditing ? 'Edit Idea' : 'Add New Idea' }}</v-card-title>
        <v-card-text>
          <v-form ref="ideaForm" v-model="ideaFormValid">
            <v-text-field
              v-model="currentIdea.title"
              label="Idea Title"
              :rules="[rules.required]"
              required
              class="mb-4"
            />
            <v-textarea
              v-model="currentIdea.description"
              label="Description (Optional)"
              rows="3"
              class="mb-4"
            />
            <v-checkbox
              v-model="currentIdea.completed"
              label="Completed"
              class="mb-4"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="cancelIdeaDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveIdea" :disabled="!ideaFormValid">
            {{ isEditing ? 'Save Changes' : 'Add Idea' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const ideasListId = computed(() => route.params.id as string)

const showAddIdeaDialog = ref(false)
const ideaFormValid = ref(false)
const isEditing = ref(false)

const currentIdea = ref({
  id: '',
  title: '',
  description: '',
  completed: false,
})

const rules = {
  required: (value: any) => !!value || 'Required field',
}

// Mock data for the specific ideas list
const ideasList = ref({
  id: ideasListId.value,
  name: 'App Features',
  description: 'New App Features & Travel Plans',
  color: 'yellow',
  icon: 'mdi-lightbulb-outline',
  ideaCount: 4,
  updatedAt: new Date()
})

const ideas = ref([
  {
    id: 'i1',
    title: 'Develop Dark Mode',
    description: 'Add dark theme support to the app',
    completed: true,
  },
  {
    id: 'i2',
    title: 'Integrate with Calendar Loan',
    description: 'Connect app with calendar for loan reminders',
    completed: false,
  },
  {
    id: 'i3',
    title: 'Plan Trip to Japan (Kyoto & Tokyo)',
    description: 'Research and plan a vacation to Japan',
    completed: false,
  },
  {
    id: 'i4',
    title: 'Brainstorm AI Assistant Features',
    description: 'Think of new AI features for the app',
    completed: false,
  },
])

const toggleIdeaCompletion = (idea: any) => {
  idea.completed = !idea.completed
  // TODO: Call API to update completion status
  console.log(`Idea ${idea.id} completion toggled to ${idea.completed}`)
}

const addIdea = () => {
  isEditing.value = false
  currentIdea.value = {
    id: '',
    title: '',
    description: '',
    completed: false,
  }
  showAddIdeaDialog.value = true
}

const editIdea = (idea: any) => {
  isEditing.value = true
  currentIdea.value = { ...idea }
  showAddIdeaDialog.value = true
}

const saveIdea = () => {
  if (ideaFormValid.value) {
    if (isEditing.value) {
      const index = ideas.value.findIndex(i => i.id === currentIdea.value.id)
      if (index !== -1) {
        ideas.value[index] = { ...currentIdea.value }
      }
    } else {
      const newId = Date.now().toString()
      ideas.value.push({ ...currentIdea.value, id: newId })
    }
    cancelIdeaDialog()
  }
}

const deleteIdea = (idea: any) => {
  const index = ideas.value.findIndex(i => i.id === idea.id)
  if (index > -1) {
    ideas.value.splice(index, 1)
  }
}

const cancelIdeaDialog = () => {
  showAddIdeaDialog.value = false
  isEditing.value = false
  currentIdea.value = {
    id: '',
    title: '',
    description: '',
    completed: false,
  }
}

onMounted(() => {
  // In a real app, fetch ideas list details and its ideas based on ideasListId
  console.log(`Loading ideas for list: ${ideasListId.value}`)
  // For now, mock data is used.
})
</script>

<style scoped>
.ideas-list-view {
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

.ideas-list-card {
  border-radius: 16px;
  overflow: hidden;
}

.ideas-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.idea-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.idea-item.completed {
  opacity: 0.7;
  background-color: #f0f0f0;
}

.idea-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.idea-left {
  margin-right: 16px;
}

.idea-content {
  flex: 1;
}

.idea-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.idea-item.completed .idea-title {
  text-decoration: line-through;
  color: #999;
}

.idea-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.idea-actions {
  margin-left: 16px;
  display: flex;
  gap: 4px;
}

.add-idea-button {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 12px 32px;
  text-transform: none;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.add-idea-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
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

  .idea-item {
    padding: 12px;
  }

  .idea-title {
    font-size: 14px;
  }

  .idea-description {
    font-size: 12px;
  }
}
</style>
