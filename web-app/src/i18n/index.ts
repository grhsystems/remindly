import { createI18n } from 'vue-i18n'
import he from './locales/he.json'
import en from './locales/en.json'

const messages = {
  he,
  en
}

const i18n = createI18n({
  legacy: false,
  locale: 'he',
  fallbackLocale: 'en',
  messages
})

export default i18n
