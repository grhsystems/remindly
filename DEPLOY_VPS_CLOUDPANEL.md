# 🚀 מדריך פריסה ל-VPS עם Cloud Panel (ללא Docker)

מדריך מפורט לפריסת Remindly על שרת VPS עם Cloud Panel (CyberPanel, aaPanel, HestiaCP, etc.) ללא Docker.

---

## 📋 תוכן עניינים

1. [דרישות מוקדמות](#1-דרישות-מוקדמות)
2. [התקנת תלויות](#2-התקנת-תלויות)
3. [הגדרת מסד נתונים](#3-הגדרת-מסד-נתונים)
4. [התקנת Backend](#4-התקנת-backend)
5. [התקנת Web App](#5-התקנת-web-app)
6. [הגדרת Nginx](#6-הגדרת-nginx)
7. [הגדרת SSL](#7-הגדרת-ssl)
8. [הגדרת PM2](#8-הגדרת-pm2)
9. [בדיקות](#9-בדיקות)
10. [תחזוקה](#10-תחזוקה)

---

## 1. דרישות מוקדמות

### מה צריך:
- ✅ שרת VPS (Ubuntu 20.04+ או Debian 11+)
- ✅ Cloud Panel מותקן (CyberPanel, aaPanel, HestiaCP, etc.)
- ✅ Domain name מצביע לשרת
- ✅ גישה SSH לשרת
- ✅ גישה root או sudo

### בדיקה ראשונית:

```bash
# התחבר לשרת
ssh user@your-server-ip

# בדוק את הגרסה
lsb_release -a

# בדוק את ה-Cloud Panel
# בדרך כלל יהיה נגיש ב: https://your-server-ip:8090 או :2083
```

---

## 2. התקנת תלויות

### שלב 1: עדכון המערכת

```bash
sudo apt update
sudo apt upgrade -y
```

### שלב 2: התקנת Node.js 18+

```bash
# הוסף את NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# התקן Node.js
sudo apt-get install -y nodejs

# בדוק את ההתקנה
node --version
npm --version
```

### שלב 3: התקנת PostgreSQL

```bash
# התקן PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# הפעל את השירות
sudo systemctl start postgresql
sudo systemctl enable postgresql

# בדוק את הסטטוס
sudo systemctl status postgresql
```

### שלב 4: התקנת Nginx (אם לא מותקן)

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### שלב 5: התקנת PM2 (לניהול Backend)

```bash
sudo npm install -g pm2
```

### שלב 6: התקנת Build Tools (ל-Web App)

```bash
sudo apt install build-essential -y
```

---

## 3. הגדרת מסד נתונים

### שלב 1: צור משתמש ומסד נתונים

```bash
# התחבר ל-PostgreSQL
sudo -u postgres psql

# בתוך PostgreSQL:
CREATE DATABASE remindly_db;
CREATE USER remindly_user WITH PASSWORD 'your_secure_password_here';
ALTER ROLE remindly_user SET client_encoding TO 'utf8';
ALTER ROLE remindly_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE remindly_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE remindly_db TO remindly_user;
\q
```

### שלב 2: בדוק את החיבור

```bash
# בדוק שהמסד נתונים נוצר
sudo -u postgres psql -l | grep remindly_db
```

---

## 4. התקנת Backend

### שלב 1: שכפול הפרויקט

```bash
# צור תיקייה לפרויקט
sudo mkdir -p /var/www/remindly
sudo chown $USER:$USER /var/www/remindly

# שכפל את הפרויקט
cd /var/www/remindly
git clone https://github.com/your-username/remindly.git .

# או העלה את הקבצים דרך SFTP/FTP
```

### שלב 2: התקנת תלויות Backend

```bash
cd /var/www/remindly/backend

# התקן תלויות
npm install --production

# או אם יש dev dependencies:
npm install
```

### שלב 3: הגדרת משתני סביבה

```bash
# צור קובץ .env
cp .env.example .env
nano .env
```

ערוך את `backend/.env`:

```env
# Server Configuration
NODE_ENV=production
PORT=3001
BASE_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com

# Database Configuration
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=remindly_db
DB_USER=remindly_user
DB_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_here
JWT_EXPIRE=7d
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# OpenAI (Optional)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid (Optional)
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@your-domain.com

# Firebase (Optional)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### שלב 4: צור תיקיית uploads

```bash
mkdir -p /var/www/remindly/backend/uploads/voice
mkdir -p /var/www/remindly/backend/uploads/media
chmod -R 755 /var/www/remindly/backend/uploads
```

### שלב 5: הפעל עם PM2

```bash
cd /var/www/remindly/backend

# הפעל את ה-backend
pm2 start server.js --name remindly-backend

# שמור את ה-configuration
pm2 save

# הגדר auto-start על boot
pm2 startup
# העתק והרץ את הפקודה שהתקבלה

# בדוק את הסטטוס
pm2 status
pm2 logs remindly-backend
```

---

## 5. התקנת Web App

### שלב 1: התקנת תלויות

```bash
cd /var/www/remindly/web-app

# התקן תלויות
npm install
```

### שלב 2: הגדרת משתני סביבה

```bash
# צור קובץ .env
cp .env.example .env
nano .env
```

ערוך את `web-app/.env`:

```env
VITE_API_URL=https://api.your-domain.com/api
# או אם אותו domain:
VITE_API_URL=https://your-domain.com/api

VITE_APP_NAME=Remindly
VITE_APP_VERSION=1.0.0
```

### שלב 3: בניית האפליקציה

```bash
cd /var/www/remindly/web-app

# בנה את האפליקציה ל-production
npm run build

# התוצאה תהיה בתיקייה: dist/
```

### שלב 4: העתק את הקבצים

```bash
# צור תיקייה ל-web app
sudo mkdir -p /var/www/remindly-web
sudo chown $USER:$USER /var/www/remindly-web

# העתק את הקבצים
cp -r /var/www/remindly/web-app/dist/* /var/www/remindly-web/

# העתק גם את הלוגו
cp /var/www/remindly/web-app/public/LogoRemindly.png /var/www/remindly-web/
```

---

## 6. הגדרת Nginx

### אפשרות A: דרך Cloud Panel

1. היכנס ל-Cloud Panel
2. לך ל-Websites → Add Website
3. הוסף את ה-domain שלך
4. בחר PHP Version: None (או Static)
5. צור את האתר

### אפשרות B: הגדרה ידנית

צור קובץ Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/remindly
```

הוסף את התוכן הבא:

```nginx
# Web App Configuration
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/remindly-web;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy to backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}

# Backend API (אופציונלי - אם רוצה subdomain נפרד)
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

הפעל את ה-configuration:

```bash
# צור symbolic link
sudo ln -s /etc/nginx/sites-available/remindly /etc/nginx/sites-enabled/

# בדוק את ה-configuration
sudo nginx -t

# הפעל מחדש את Nginx
sudo systemctl restart nginx
```

---

## 7. הגדרת SSL

### דרך Cloud Panel (הכי פשוט):

1. היכנס ל-Cloud Panel
2. לך ל-SSL → Let's Encrypt
3. בחר את ה-domain
4. לחץ Install SSL

### דרך Let's Encrypt ידנית:

```bash
# התקן Certbot
sudo apt install certbot python3-certbot-nginx -y

# קבל SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# בדוק auto-renewal
sudo certbot renew --dry-run
```

לאחר התקנת SSL, עדכן את ה-Nginx config ל-HTTPS:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... שאר ההגדרות כמו קודם
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 8. הגדרת PM2

### הגדרת Auto-Start

```bash
# צור startup script
pm2 startup

# העתק והרץ את הפקודה שהתקבלה (תראה משהו כמו):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

# שמור את ה-PM2 processes
pm2 save
```

### פקודות PM2 שימושיות

```bash
# צפה ב-status
pm2 status

# צפה ב-logs
pm2 logs remindly-backend
pm2 logs remindly-backend --lines 100

# הפעל מחדש
pm2 restart remindly-backend

# עצור
pm2 stop remindly-backend

# מחק
pm2 delete remindly-backend

# Monitor
pm2 monit
```

### הגדרת PM2 Ecosystem (מומלץ)

צור קובץ `ecosystem.config.js`:

```bash
cd /var/www/remindly/backend
nano ecosystem.config.js
```

הוסף:

```javascript
module.exports = {
  apps: [{
    name: 'remindly-backend',
    script: 'server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M',
    watch: false
  }]
};
```

הפעל עם:

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## 9. בדיקות

### בדיקות בסיסיות

```bash
# 1. בדוק שה-backend רץ
curl http://localhost:3001/health

# 2. בדוק שה-web app נגיש
curl http://localhost

# 3. בדוק את ה-logs
pm2 logs remindly-backend
sudo tail -f /var/log/nginx/error.log

# 4. בדוק את ה-database
sudo -u postgres psql -d remindly_db -c "SELECT version();"
```

### בדיקות דרך הדפדפן

1. פתח: `https://your-domain.com`
2. בדוק את ה-API: `https://your-domain.com/api/health`
3. נסה ליצור משתמש חדש
4. בדוק את ה-console בדפדפן (F12)

---

## 10. תחזוקה

### עדכון האפליקציה

```bash
# 1. עצור את ה-backend
pm2 stop remindly-backend

# 2. שמור backup
cp -r /var/www/remindly /var/www/remindly-backup-$(date +%Y%m%d)

# 3. עדכן את הקוד
cd /var/www/remindly
git pull origin main
# או העלה קבצים חדשים דרך SFTP

# 4. עדכן תלויות
cd backend
npm install --production

# 5. בנה מחדש את ה-web app
cd ../web-app
npm install
npm run build
cp -r dist/* /var/www/remindly-web/

# 6. הפעל מחדש
pm2 restart remindly-backend
```

### Backup מסד נתונים

```bash
# צור backup script
nano /usr/local/bin/backup-remindly-db.sh
```

הוסף:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/remindly"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump remindly_db > $BACKUP_DIR/remindly_db_$DATE.sql
# שמור רק 7 ימים
find $BACKUP_DIR -name "remindly_db_*.sql" -mtime +7 -delete
```

הפוך ל-executable:

```bash
sudo chmod +x /usr/local/bin/backup-remindly-db.sh
```

הוסף ל-crontab:

```bash
sudo crontab -e
# הוסף:
0 2 * * * /usr/local/bin/backup-remindly-db.sh
```

### ניטור

```bash
# צפה ב-resource usage
pm2 monit

# צפה ב-Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# צפה ב-system resources
htop
df -h
free -h
```

---

## 🔧 פתרון בעיות

### Backend לא עובד

```bash
# בדוק את ה-logs
pm2 logs remindly-backend

# בדוק את ה-port
sudo netstat -tlnp | grep 3001

# בדוק את ה-.env
cat /var/www/remindly/backend/.env
```

### Web App לא נטען

```bash
# בדוק את ה-permissions
ls -la /var/www/remindly-web

# בדוק את ה-Nginx config
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Database connection error

```bash
# בדוק שה-PostgreSQL רץ
sudo systemctl status postgresql

# בדוק את ה-credentials
sudo -u postgres psql -d remindly_db -U remindly_user

# בדוק את ה-pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

---

## 📝 Checklist סופי

- [ ] Node.js 18+ מותקן
- [ ] PostgreSQL מותקן ומסודר
- [ ] Backend רץ עם PM2
- [ ] Web App בנוי ומוגש דרך Nginx
- [ ] SSL מוגדר
- [ ] Domain מצביע לשרת
- [ ] Firewall מוגדר (פורט 80, 443)
- [ ] Backups מוגדרים
- [ ] Monitoring מוגדר

---

## 🎉 סיימת!

האפליקציה שלך אמורה להיות זמינה ב:
- **Web App**: https://your-domain.com
- **API**: https://your-domain.com/api

**בהצלחה! 🚀**

