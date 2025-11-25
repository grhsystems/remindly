# 🎯 Remindly - אפליקציית ניהול משימות חכמה

<div align="center">

![Remindly Logo](https://via.placeholder.com/200x200?text=Remindly)

**אפליקציה מתקדמת לניהול משימות, תזכורות ורשימות עם תמיכה בבינה מלאכותית**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Flutter](https://img.shields.io/badge/flutter-%3E%3D3.0.0-blue.svg)](https://flutter.dev/)
[![Vue.js](https://img.shields.io/badge/vue.js-3.x-green.svg)](https://vuejs.org/)

[תיעוד](#-תכונות-עיקריות) • [הגדרה](#-התקנה-מהירה) • [API](#-backend-api) • [תמיכה](#-תמיכה)

</div>

---

## 📖 תיאור

Remindly היא אפליקציה מקיפה לניהול משימות יומיות, תזכורות ורשימות קניות, המשלבת בינה מלאכותית לעיבוד חכם של טקסט והקלטות קול. האפליקציה זמינה כ-**Web App** וכ-**Mobile App**, עם סנכרון מלא בין כל המכשירים.

### 🎯 למה Remindly?

- ✅ **ניהול משימות חכם** - יצירה, עריכה וארגון משימות בקלות
- 🤖 **AI מובנה** - ניתוח אוטומטי של טקסט חופשי ליצירת משימות
- 🎤 **הקלטה קולית** - המרה אוטומטית של דיבור למשימות
- 🔔 **התראות מתקדמות** - SMS, Email, Push ושיחות טלפון אוטומטיות
- 🛒 **רשימת קניות חכמה** - חיפוש מחירים אוטומטי וחישוב סה"כ
- 🌐 **תמיכה רב-לשונית** - עברית (RTL מלא), אנגלית ועוד
- 📱 **סנכרון מלא** - עובד על Web, Android ו-iOS
- 🔒 **אבטחה מתקדמת** - הצפנה, JWT authentication וכו'

---

## 🚀 תכונות עיקריות

### 📝 ניהול רשימות ומשימות

- יצירת רשימות מותאמות אישית (משימות, קניות, שיחות, פגישות, תורים לרופאים, תיקונים)
- הוספה, עריכה ומחיקה של משימות
- סידור וארגון משימות לפי עדיפות
- סימון משימות כהושלמו
- גרירה והזזה של רשימות ומשימות

### 🤖 בינה מלאכותית

- **ניתוח טקסט חופשי**: "לא לשכוח להתקשר מחר ב-10 בבוקר ליהודה" → משימה עם תזכורת
- **זיהוי אוטומטי** של סוג משימה, תאריך, שעה ואיש קשר
- **תרגום במקום** בין שפות שונות
- **המלצות חכמות** למשימות על סמך היסטוריה
- **ניתוח עדיפות** אוטומטי

### 🎤 הקלטה קולית

- הקלטה ישירה באפליקציה
- המרה אוטומטית לטקסט (Whisper API)
- שליחה ל-Webhook (Make.com/n8n) לעיבוד מתקדם
- יצירה אוטומטית של משימות מהקלטות

### 🔔 מערכת התראות מתקדמת

- **SMS** - הודעות טקסט דרך Twilio
- **Email** - אימיילים מעוצבים דרך SendGrid
- **Push Notifications** - התראות דרך Firebase
- **שיחות טלפון אוטומטיות** - דרך Twilio Voice
- בחירת ערוצי התראה מותאמת אישית

### 🛒 רשימת קניות מתקדמת

- הוספת מוצרים עם כמות
- חיפוש מחירים אוטומטי באינטרנט
- חישוב עלות כוללת אוטומטי
- סימון פריטים שנקנו

### 🌐 תמיכה רב-לשונית

- תמיכה מלאה בעברית (RTL)
- אנגלית
- תרגום אוטומטי בין שפות
- ממשק מותאם לכל שפה

### 🔍 חיפוש חכם

- חיפוש גלובלי בכל הרשימות והמשימות
- חיפוש לפי מילת מפתח אחת
- הדגשת תוצאות
- פילטרים מתקדמים

### 💾 עבודה Offline

- שמירה מקומית של כל הנתונים
- הוספה ועריכה ללא אינטרנט
- סנכרון אוטומטי בחזרה לאינטרנט
- פתרון קונפליקטים חכם

---

## 🏗️ ארכיטקטורה

```
remindly/
├── backend/              # Node.js + Express + PostgreSQL
│   ├── config/          # הגדרות
│   ├── middleware/      # Middleware
│   ├── models/          # Sequelize Models
│   ├── routes/          # API Routes
│   ├── services/        # Business Logic
│   └── utils/           # Utilities
│
├── web-app/             # Vue.js 3 + Vuetify 3
│   ├── src/
│   │   ├── components/  # Vue Components
│   │   ├── views/       # Pages
│   │   ├── stores/      # Pinia Stores
│   │   ├── router/      # Vue Router
│   │   ├── locales/     # i18n Translations
│   │   └── utils/       # Utilities
│   └── public/          # Static Assets
│
└── mobile-app/          # Flutter
    ├── lib/
    │   ├── core/        # Core Config
    │   ├── data/        # Data Layer
    │   ├── domain/      # Business Logic
    │   ├── features/    # Feature Modules
    │   └── shared/      # Shared Widgets
    └── assets/          # Assets
```

---

## 💻 טכנולוגיות

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL + Sequelize ORM
- **Auth**: JWT (JSON Web Tokens)
- **AI**: OpenAI GPT-4, Whisper
- **Notifications**:
  - Twilio (SMS & Voice)
  - SendGrid (Email)
  - Firebase Cloud Messaging (Push)
- **Validation**: express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, bcrypt

### Web App

- **Framework**: Vue.js 3 (Composition API)
- **UI**: Vuetify 3 (Material Design)
- **State**: Pinia
- **Router**: Vue Router 4
- **HTTP**: Axios
- **i18n**: Vue I18n
- **Build**: Vite
- **Language**: TypeScript

### Mobile App

- **Framework**: Flutter 3+
- **Language**: Dart
- **State**: Riverpod
- **HTTP**: Dio
- **Storage**: Hive / SQLite
- **i18n**: easy_localization
- **UI**: Material 3

---

## 🚀 התקנה מהירה

### דרישות מקדימות

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Flutter >= 3.x (למובייל)

### 1. Clone הפרויקט

```bash
git clone https://github.com/grhsystems/remindly.git
cd remindly
```

### 2. Backend Setup

```bash
cd backend
npm install

# צור .env file (ראה .env.example)
cp .env.example .env

# הגדר PostgreSQL
createdb remindly

# הפעל שרת
npm run dev
```

### 3. Web App Setup

```bash
cd web-app
npm install

# צור .env file
echo "VITE_API_BASE_URL=http://localhost:3001/api" > .env

# הפעל
npm run dev
```

### 4. Mobile App Setup

```bash
cd mobile-app
flutter pub get

# הפעל
flutter run
```

📖 **למדריך מפורט**, ראה [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 📡 Backend API

### Authentication

```bash
POST /api/auth/register    # הרשמה
POST /api/auth/login        # התחברות
GET  /api/auth/me           # פרטי משתמש
```

### Lists

```bash
GET    /api/lists           # קבלת כל הרשימות
POST   /api/lists           # יצירת רשימה
PUT    /api/lists/:id       # עדכון רשימה
DELETE /api/lists/:id       # מחיקת רשימה
```

### Tasks

```bash
GET    /api/tasks           # קבלת כל המשימות
POST   /api/tasks           # יצירת משימה
PUT    /api/tasks/:id       # עדכון משימה
DELETE /api/tasks/:id       # מחיקת משימה
PATCH  /api/tasks/:id/complete  # סימון הושלמה
```

### AI

```bash
POST /api/ai/parse              # ניתוח טקסט
POST /api/ai/parse-and-create   # ניתוח + יצירה
POST /api/ai/translate          # תרגום
```

### Voice

```bash
POST /api/voice/transcribe  # תמלול אודיו
POST /api/voice/process     # עיבוד מלא
```

### Notifications

```bash
POST /api/notifications/sms     # שליחת SMS
POST /api/notifications/email   # שליחת Email
POST /api/notifications/push    # שליחת Push
POST /api/notifications/call    # שיחת טלפון
```

📖 **לתיעוד API מלא**, ראה [backend/README.md](./backend/README.md)

---

## 🎨 Screenshots

### Web App

![Web Dashboard](https://via.placeholder.com/800x400?text=Web+Dashboard)
![Task List](https://via.placeholder.com/800x400?text=Task+List)

### Mobile App

<p align="center">
  <img src="https://via.placeholder.com/250x500?text=Mobile+Home" width="250" />
  <img src="https://via.placeholder.com/250x500?text=Mobile+Tasks" width="250" />
  <img src="https://via.placeholder.com/250x500?text=Mobile+Voice" width="250" />
</p>

---

## 🧪 בדיקות

### Backend

```bash
cd backend
npm test
npm run test:coverage
```

### Web App

```bash
cd web-app
npm run test:unit
npm run test:e2e
```

### Mobile App

```bash
cd mobile-app
flutter test
```

---

## 📦 פריסה (Deployment)

### Backend

```bash
# Using PM2
pm2 start server.js --name remindly-backend

# Using Docker
docker build -t remindly-backend .
docker run -p 3001:3001 remindly-backend
```

### Web App

```bash
npm run build
# Deploy dist/ folder to Vercel/Netlify/etc.
```

### Mobile App

```bash
# Android
flutter build apk

# iOS
flutter build ios
```

---

## 🔐 אבטחה

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting
- ✅ Input Validation
- ✅ CORS Protection
- ✅ Helmet Security Headers
- ✅ SQL Injection Protection
- ✅ XSS Protection

---

## 🌟 תכונות עתידיות (Phase 2)

- [ ] שיתוף רשימות עם משתמשים אחרים
- [ ] תבניות רשימות מוכנות
- [ ] סטטיסטיקות והישגים
- [ ] אינטגרציה עם Google Calendar
- [ ] ייבוא וייצוא נתונים
- [ ] גיבוי אוטומטי
- [ ] Widget למסך הבית
- [ ] תמיכה ב-Apple Watch / Wear OS

---

## 🤝 תרומה

אנחנו מברכים כל תרומה! אם אתה רוצה לתרום:

1. Fork את הפרויקט
2. צור branch חדש (`git checkout -b feature/amazing-feature`)
3. Commit את השינויים (`git commit -m 'Add amazing feature'`)
4. Push ל-branch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

---

## 📄 רישיון

פרויקט זה מופץ תחת רישיון MIT. ראה [LICENSE](LICENSE) לפרטים נוספים.

---

## 💬 תמיכה

- 📧 **Email**: support@remindly.app
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/remindly/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/remindly/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/yourusername/remindly/wiki)

---

## 🙏 תודות

תודה מיוחדת ל:

- [OpenAI](https://openai.com/) - GPT-4 & Whisper
- [Twilio](https://www.twilio.com/) - SMS & Voice
- [SendGrid](https://sendgrid.com/) - Email
- [Firebase](https://firebase.google.com/) - Push Notifications
- [Make.com](https://www.make.com/) - Automation
- [Vue.js](https://vuejs.org/) - Web Framework
- [Flutter](https://flutter.dev/) - Mobile Framework

---

<div align="center">

**Made with ❤️ by Remindly Team**

[⬆ Back to Top](#-remindly---אפליקציית-ניהול-משימות-חכמה)

</div>
