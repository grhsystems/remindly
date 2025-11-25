# ⚡ פריסה מהירה - Remindly

מדריך מהיר לפריסת Remindly ב-5 דקות.

---

## 🚀 פריסה מהירה עם Docker Compose

### שלב 1: הכנה (2 דקות)

```bash
# 1. שכפל את הפרויקט
git clone https://github.com/your-username/remindly.git
cd remindly

# 2. צור קבצי .env
cd backend && cp .env.example .env
cd ../web-app && cp .env.example .env
cd ..
```

### שלב 2: עדכן משתני סביבה (1 דקה)

ערוך `backend/.env`:
```env
DB_PASSWORD=your_secure_password
JWT_SECRET=your_super_secret_key_min_32_chars
```

ערוך `web-app/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### שלב 3: הפעל (2 דקות)

```bash
# הפעל את כל השירותים
docker-compose up -d

# בדוק שהכל עובד
docker-compose ps
curl http://localhost:3001/health
```

**✅ סיימת!** האפליקציה רצה על:
- Backend: http://localhost:3001
- Web App: http://localhost:3000

---

## 📋 פקודות שימושיות

```bash
# צפה בלוגים
docker-compose logs -f

# עצור את השירותים
docker-compose down

# הפעל מחדש
docker-compose restart

# בדוק סטטוס
docker-compose ps
```

---

## 🌐 פריסה לשרת (VPS)

### על שרת Ubuntu/Debian:

```bash
# 1. התקן Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. התקן Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. שכפל והפעל
git clone https://github.com/your-username/remindly.git
cd remindly
# ... המשך כמו בשלבים למעלה
```

---

## 🔧 פתרון בעיות מהיר

**Backend לא עובד?**
```bash
docker-compose logs backend
```

**מסד נתונים לא מתחבר?**
```bash
# בדוק שה-DB רץ
docker-compose ps postgres

# בדוק את ה-password ב-.env
cat backend/.env | grep DB_PASSWORD
```

**Ports תפוסים?**
```bash
# שנה את ה-ports ב-docker-compose.yml
# או עצור את השירותים שתפוסים את הפורטים
```

---

## 📖 למד עוד

לקבלת מידע מפורט, ראה [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**בהצלחה! 🎉**

