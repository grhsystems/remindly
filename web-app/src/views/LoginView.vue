<template>
  <div class="login-view">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4" xl="3">
          <v-card class="remindly-card login-card" elevation="8">
            <v-card-text class="pa-8">
              <!-- Logo and Title -->
              <div class="text-center mb-8">
                <v-icon size="64" color="primary" class="mb-4">mdi-bell-outline</v-icon>
                <h1 class="text-h4 font-weight-bold mb-2">{{ $t('app.name') }}</h1>
                <p class="text-body-1 text-medium-emphasis">{{ $t('app.description') }}</p>
              </div>

              <!-- Login Form -->
              <v-form ref="loginForm" v-model="formValid" @submit.prevent="handleLogin">
                <v-text-field v-model="loginData.email" :label="$t('auth.email')" type="email"
                  :rules="[rules.required, rules.email]" prepend-inner-icon="mdi-email" variant="outlined" class="mb-4"
                  required />

                <v-text-field v-model="loginData.password" :label="$t('auth.password')"
                  :type="showPassword ? 'text' : 'password'" :rules="[rules.required, rules.minLength(6)]"
                  prepend-inner-icon="mdi-lock" :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword" variant="outlined" class="mb-4" required />

                <div class="d-flex align-center justify-space-between mb-4">
                  <v-checkbox v-model="rememberMe" :label="$t('auth.rememberMe')" color="primary" hide-details />
                  <v-btn variant="text" size="small" color="primary" @click="forgotPassword">
                    {{ $t('auth.forgotPassword') }}
                  </v-btn>
                </div>

                <v-btn type="submit" color="primary" size="large" block :loading="loading" :disabled="!formValid"
                  class="mb-4">
                  {{ $t('auth.login') }}
                </v-btn>

                <!-- Social Login -->
                <v-divider class="my-4">
                  <span class="text-body-2 text-medium-emphasis px-4">או</span>
                </v-divider>

                <v-btn color="white" variant="outlined" size="large" block class="mb-4" @click="loginWithGoogle">
                  <v-icon class="mr-2">mdi-google</v-icon>
                  {{ $t('auth.loginWithGoogle') }}
                </v-btn>

                <v-btn color="primary" variant="outlined" size="large" block @click="loginWithFacebook">
                  <v-icon class="mr-2">mdi-facebook</v-icon>
                  {{ $t('auth.loginWithFacebook') }}
                </v-btn>
              </v-form>

              <!-- Register Link -->
              <div class="text-center mt-6">
                <span class="text-body-2 text-medium-emphasis">
                  {{ $t('auth.dontHaveAccount') }}
                </span>
                <v-btn variant="text" color="primary" @click="$router.push('/register')">
                  {{ $t('auth.createAccount') }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Demo Account Info -->
          <v-card class="remindly-card demo-card mt-4" elevation="4">
            <v-card-text class="pa-4">
              <div class="text-center">
                <v-icon color="info" class="mb-2">mdi-information</v-icon>
                <h3 class="text-h6 font-weight-bold mb-2">חשבון דמו</h3>
                <p class="text-body-2 text-medium-emphasis mb-3">
                  נסה את האפליקציה עם חשבון דמו
                </p>
                <v-btn color="info" variant="outlined" size="small" @click="loginWithDemo">
                  התחבר עם דמו
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="5000" location="top">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showError = false">
          {{ $t('common.close') }}
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSuccess" color="success" timeout="3000" location="top">
      {{ successMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showSuccess = false">
          {{ $t('common.close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// Reactive data
const loginForm = ref()
const formValid = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const showError = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const loginData = ref({
  email: '',
  password: ''
})

// Computed properties
const loading = computed(() => userStore.loading)

// Validation rules
const rules = {
  required: (value: any) => !!value || 'שדה חובה',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'כתובת אימייל לא תקינה'
  },
  minLength: (min: number) => (value: string) =>
    (value && value.length >= min) || `מינימום ${min} תווים`
}

// Methods
const handleLogin = async () => {
  if (formValid.value) {
    const result = await userStore.login(loginData.value.email, loginData.value.password)

    if (result.success) {
      successMessage.value = 'התחברת בהצלחה'
      showSuccess.value = true

      // Wait a bit for the success message to show, then redirect
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      errorMessage.value = result.error || 'שגיאה בהתחברות'
      showError.value = true
    }
  }
}

const loginWithGoogle = async () => {
  // Implement Google OAuth
  console.log('Login with Google')
  errorMessage.value = 'התחברות עם Google תגיע בקרוב'
  showError.value = true
}

const loginWithFacebook = async () => {
  // Implement Facebook OAuth
  console.log('Login with Facebook')
  errorMessage.value = 'התחברות עם Facebook תגיע בקרוב'
  showError.value = true
}

const loginWithDemo = async () => {
  const result = await userStore.login('demo@remindly.com', 'demo123')

  if (result.success) {
    successMessage.value = 'התחברת עם חשבון דמו'
    showSuccess.value = true

    // Wait a bit for the success message to show, then redirect
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } else {
    errorMessage.value = 'שגיאה בהתחברות עם דמו'
    showError.value = true
  }
}

const forgotPassword = () => {
  // Implement forgot password
  console.log('Forgot password')
  errorMessage.value = 'איפוס סיסמה יגיע בקרוב'
  showError.value = true
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.login-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.demo-card {
  background: rgba(33, 150, 243, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.v-card {
  position: relative;
  z-index: 1;
}

/* Animation for form elements */
.v-text-field {
  transition: all 0.3s ease;
}

.v-text-field:focus-within {
  transform: translateY(-2px);
}

.v-btn {
  transition: all 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* RTL Support */
[dir="rtl"] .v-text-field .v-field__input {
  text-align: right;
}

[dir="rtl"] .v-text-field .v-label {
  text-align: right;
}

/* Responsive design */
@media (max-width: 600px) {
  .login-card {
    margin: 16px;
  }

  .login-card .v-card-text {
    padding: 24px;
  }
}

/* Loading animation */
.v-btn--loading .v-btn__content {
  opacity: 0;
}

.v-btn--loading .v-progress-circular {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Custom focus styles */
.v-text-field:focus-within .v-field__outline {
  color: rgb(var(--v-theme-primary));
}

/* Error state styling */
.v-text-field--error .v-field__outline {
  color: rgb(var(--v-theme-error));
}

/* Success state styling */
.v-text-field--success .v-field__outline {
  color: rgb(var(--v-theme-success));
}
</style>
