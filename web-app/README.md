# Remindly - Smart Task Management App

אפליקציה חכמה לניהול משימות, תזכורות ורשימות עם תמיכה בבינה מלאכותית.

## תכונות עיקריות

- 🎯 **ניהול משימות** - יצירה, עריכה, מחיקה וסידור משימות
- 📝 **רשימות מותאמות** - רשימות מוגדרות ומותאמות אישית
- 🛒 **רשימת קניות מתקדמת** - עם חיפוש מחירים אוטומטי
- 🤖 **AI מובנה** - ניתוח טקסט אוטומטי והכנסה לרשימות
- 🎤 **הקלטה קולית** - אינטגרציה עם Make.com/n8n
- 📱 **עבודה Offline** - עם סנכרון אוטומטי
- 🔔 **התראות חכמות** - SMS, Email, Push, שיחות טלפון
- 🌐 **תמיכה רב-לשונית** - עברית (RTL) ואנגלית
- 🔍 **חיפוש חכם** - בכל הרשימות והמשימות

## טכנולוגיות

- **Frontend**: Vue.js 3 + Vuetify 3 + TypeScript
- **State Management**: Pinia
- **Routing**: Vue Router
- **Internationalization**: Vue I18n
- **PWA**: Vite PWA Plugin
- **Styling**: SCSS + Vuetify

## התקנה

1. התקן את התלויות:
```bash
npm install
```

2. צור קובץ `.env` מהדוגמה:
```bash
cp .env.example .env
```

3. עדכן את המשתנים בקובץ `.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_OPENAI_API_KEY=your_openai_api_key_here
# ... שאר המשתנים
```

4. הפעל את שרת הפיתוח:
```bash
npm run dev
```

## סקריפטים זמינים

- `npm run dev` - הפעלת שרת פיתוח
- `npm run build` - בניית הפרויקט לפרודקשן
- `npm run preview` - תצוגה מקדימה של הבנייה
- `npm run lint` - בדיקת קוד עם ESLint
- `npm run format` - עיצוב קוד עם Prettier

## מבנה הפרויקט

```
src/
├── components/          # קומפוננטות Vue
├── views/              # דפי האפליקציה
├── stores/             # Pinia stores
├── router/             # הגדרות routing
├── composables/        # Vue composables
├── types/              # TypeScript types
├── utils/              # פונקציות עזר
├── locales/            # קבצי תרגום
├── styles/             # קבצי SCSS
└── main.ts             # נקודת הכניסה
```

## תכונות מתקדמות

### AI Processing
- ניתוח טקסט אוטומטי
- זיהוי סוג משימה
- יצירת תזכורות אוטומטית
- תרגום במקום

### Voice Recording
- הקלטה ישירה באפליקציה
- שליחה לעיבוד ב-Make.com/n8n
- המרה לטקסט
- עיבוד AI אוטומטי

### Offline Mode
- שמירה מקומית
- סנכרון אוטומטי
- פתרון קונפליקטים

### Notifications
- Push notifications
- SMS
- Email
- שיחות טלפון

## פיתוח

### הוספת קומפוננטה חדשה
```bash
# צור קומפוננטה חדשה
touch src/components/MyComponent.vue
```

### הוספת store חדש
```bash
# צור store חדש
touch src/stores/myStore.ts
```

### הוספת תרגום
ערוך את הקבצים ב-`src/locales/` והוסף את המפתחות החדשים.

## בנייה לפרודקשן

1. בנה את הפרויקט:
```bash
npm run build
```

2. הקבצים ייווצרו בתיקייה `dist/`

3. העלה את התוכן לשרת האירוח שלך

## רישיון

MIT License - ראה קובץ LICENSE לפרטים נוספים.

## תמיכה

לשאלות ותמיכה, צור קשר:
- Email: support@remindly.com
- GitHub Issues: [דף הבעיות](https://github.com/remindly/issues)

## תרומה

תרומות מתקבלות בברכה! אנא קרא את [מדריך התרומה](CONTRIBUTING.md) לפני שתתחיל.
