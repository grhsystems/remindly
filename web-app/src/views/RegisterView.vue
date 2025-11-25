<template>
  <div class="register-view">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4" xl="3">
          <v-card class="remindly-card register-card" elevation="8">
            <v-card-text class="pa-8">
              <!-- Logo and Title -->
              <div class="text-center mb-8">
                <v-icon size="64" color="primary" class="mb-4">mdi-bell-outline</v-icon>
                <h1 class="text-h4 font-weight-bold mb-2">{{ $t('auth.createNewAccount') }}</h1>
                <p class="text-body-1 text-medium-emphasis">{{ $t('app.description') }}</p>
              </div>

              <!-- Register Form -->
              <v-form ref="registerForm" v-model="formValid" @submit.prevent="handleRegister">
                <v-text-field v-model="registerData.name" :label="$t('common.name')"
                  :rules="[rules.required, rules.minLength(2)]" prepend-inner-icon="mdi-account" variant="outlined"
                  class="mb-4" required />

                <v-text-field v-model="registerData.email" :label="$t('auth.email')" type="email"
                  :rules="[rules.required, rules.email]" prepend-inner-icon="mdi-email" variant="outlined" class="mb-4"
                  required />

                <v-text-field v-model="registerData.password" :label="$t('auth.password')"
                  :type="showPassword ? 'text' : 'password'" :rules="[rules.required, rules.minLength(6)]"
                  prepend-inner-icon="mdi-lock" :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword" variant="outlined" class="mb-4" required />

                <v-text-field v-model="registerData.confirmPassword" :label="$t('auth.confirmPassword')"
                  :type="showConfirmPassword ? 'text' : 'password'" :rules="[rules.required, rules.confirmPassword]"
                  prepend-inner-icon="mdi-lock-check"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword" variant="outlined" class="mb-4"
                  required />

                <!-- Language Selection -->
                <v-select v-model="registerData.language" :items="languageOptions" :item-title="'text'"
                  :item-value="'value'" :label="$t('settings.language')" prepend-inner-icon="mdi-translate"
                  variant="outlined" class="mb-4" />

                <!-- Terms and Conditions -->
                <v-checkbox v-model="acceptTerms" :rules="[rules.required]" color="primary" class="mb-4">
                  <template v-slot:label>
                    <span class="text-body-2">
                      אני מסכים ל
                      <a href="#" @click.prevent="showTerms = true" class="text-primary">
                        תנאי השימוש
                      </a>
                      ו
                      <a href="#" @click.prevent="showPrivacy = true" class="text-primary">
                        מדיניות הפרטיות
                      </a>
                    </span>
                  </template>
                </v-checkbox>

                <v-btn type="submit" color="primary" size="large" block :loading="loading"
                  :disabled="!formValid || !acceptTerms" class="mb-4">
                  {{ $t('auth.register') }}
                </v-btn>

                <!-- Social Register -->
                <v-divider class="my-4">
                  <span class="text-body-2 text-medium-emphasis px-4">או</span>
                </v-divider>

                <v-btn color="white" variant="outlined" size="large" block class="mb-4" @click="registerWithGoogle">
                  <v-icon class="mr-2">mdi-google</v-icon>
                  {{ $t('auth.register') }} עם Google
                </v-btn>

                <v-btn color="primary" variant="outlined" size="large" block @click="registerWithFacebook">
                  <v-icon class="mr-2">mdi-facebook</v-icon>
                  {{ $t('auth.register') }} עם Facebook
                </v-btn>
              </v-form>

              <!-- Login Link -->
              <div class="text-center mt-6">
                <span class="text-body-2 text-medium-emphasis">
                  {{ $t('auth.alreadyHaveAccount') }}
                </span>
                <v-btn variant="text" color="primary" @click="$router.push('/login')">
                  {{ $t('auth.login') }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Terms and Conditions Dialog -->
    <v-dialog v-model="showTerms" max-width="600">
      <v-card>
        <v-card-title>
          <span class="text-h5">תנאי השימוש</span>
        </v-card-title>
        <v-card-text>
          <div class="text-body-1">
            <h3 class="text-h6 mb-3">1. קבלת השירות</h3>
            <p class="mb-4">
              על ידי שימוש באפליקציית Remindly, אתה מסכים לתנאים אלו. אם אינך מסכים לתנאים אלו, אנא אל תשתמש באפליקציה.
            </p>

            <h3 class="text-h6 mb-3">2. שימוש באפליקציה</h3>
            <p class="mb-4">
              אתה רשאי להשתמש באפליקציה למטרות אישיות בלבד. אסור לך להשתמש באפליקציה למטרות מסחריות ללא אישור מפורש.
            </p>

            <h3 class="text-h6 mb-3">3. פרטיות</h3>
            <p class="mb-4">
              אנו מכבדים את הפרטיות שלך ומתחייבים להגן על המידע האישי שלך בהתאם למדיניות הפרטיות שלנו.
            </p>

            <h3 class="text-h6 mb-3">4. אחריות</h3>
            <p class="mb-4">
              האפליקציה מסופקת "כפי שהיא" ללא כל אחריות. אנו לא נושאים באחריות לכל נזק שעלול להיגרם כתוצאה משימוש
              באפליקציה.
            </p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="showTerms = false">
            {{ $t('common.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Privacy Policy Dialog -->
    <v-dialog v-model="showPrivacy" max-width="600">
      <v-card>
        <v-card-title>
          <span class="text-h5">מדיניות הפרטיות</span>
        </v-card-title>
        <v-card-text>
          <div class="text-body-1">
            <h3 class="text-h6 mb-3">איסוף מידע</h3>
            <p class="mb-4">
              אנו אוספים מידע שאתה מספק לנו ישירות, כגון שם, כתובת אימייל ומידע אחר שאתה בוחר לשתף.
            </p>

            <h3 class="text-h6 mb-3">שימוש במידע</h3>
            <p class="mb-4">
              אנו משתמשים במידע שאספנו כדי לספק לך את השירותים שלנו, לשפר את האפליקציה ולתקשר איתך.
            </p>

            <h3 class="text-h6 mb-3">שיתוף מידע</h3>
            <p class="mb-4">
              אנו לא מוכרים, לא משכירים ולא חושפים את המידע האישי שלך לצדדים שלישיים ללא הסכמתך המפורשת.
            </p>

            <h3 class="text-h6 mb-3">אבטחת מידע</h3>
            <p class="mb-4">
              אנו נוקטים באמצעי אבטחה מתאימים כדי להגן על המידע האישי שלך מפני גישה לא מורשית, שימוש, שינוי או חשיפה.
            </p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="showPrivacy = false">
            {{ $t('common.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
const registerForm = ref()
const formValid = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const acceptTerms = ref(false)
const showTerms = ref(false)
const showPrivacy = ref(false)
const showError = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const registerData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  language: 'he'
})

// Language options
const languageOptions = [
  { text: 'עברית', value: 'he' },
  { text: 'English', value: 'en' }
]

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
    (value && value.length >= min) || `מינימום ${min} תווים`,
  confirmPassword: (value: string) =>
    value === registerData.value.password || 'הסיסמאות לא תואמות'
}

// Methods
const handleRegister = async () => {
  if (formValid.value && acceptTerms.value) {
    const result = await userStore.register({
      name: registerData.value.name,
      email: registerData.value.email,
      password: registerData.value.password,
      language: registerData.value.language
    })

    if (result.success) {
      successMessage.value = 'נרשמת בהצלחה!'
      showSuccess.value = true

      // Wait a bit for the success message to show, then redirect
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      errorMessage.value = result.error || 'שגיאה בהרשמה'
      showError.value = true
    }
  }
}

const registerWithGoogle = async () => {
  // Implement Google OAuth
  console.log('Register with Google')
  errorMessage.value = 'הרשמה עם Google תגיע בקרוב'
  showError.value = true
}

const registerWithFacebook = async () => {
  // Implement Facebook OAuth
  console.log('Register with Facebook')
  errorMessage.value = 'הרשמה עם Facebook תגיע בקרוב'
  showError.value = true
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.register-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  .register-card {
    margin: 16px;
  }

  .register-card .v-card-text {
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

/* Terms and conditions styling */
.v-checkbox .v-label {
  line-height: 1.4;
}

.v-checkbox .v-label a {
  text-decoration: none;
  font-weight: 500;
}

.v-checkbox .v-label a:hover {
  text-decoration: underline;
}
</style>
