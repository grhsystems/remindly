# 🚀 מדריך פריסה (Deployment Guide) - Remindly

מדריך מקיף לפריסת אפליקציית Remindly לסביבות שונות.

---

## 📋 תוכן עניינים

1. [פריסה מקומית עם Docker Compose](#1-פריסה-מקומית-עם-docker-compose)
2. [פריסה לשרת VPS/Cloud](#2-פריסה-לשרת-vpscloud)
3. [פריסה ל-Kubernetes](#3-פריסה-ל-kubernetes)
4. [פריסה ל-Cloud Providers](#4-פריסה-ל-cloud-providers)
5. [פריסה אוטומטית עם CI/CD](#5-פריסה-אוטומטית-עם-cicd)
6. [בדיקות לאחר פריסה](#6-בדיקות-לאחר-פריסה)
7. [טיפול בבעיות נפוצות](#7-טיפול-בבעיות-נפוצות)

---

## 1. פריסה מקומית עם Docker Compose

### דרישות מוקדמות
- Docker Desktop (Windows/Mac) או Docker Engine (Linux)
- Docker Compose

### שלבים

#### שלב 1: הכנת קבצי סביבה

```bash
# העתק את קבצי ה-.env.example
cd backend
cp .env.example .env

cd ../web-app
cp .env.example .env
```

#### שלב 2: עדכון משתני סביבה

ערוך את `backend/.env`:
```env
NODE_ENV=production
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=remindly
DB_USER=remindly_user
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
# ... שאר המשתנים
```

ערוך את `web-app/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

#### שלב 3: הפעלת הפריסה

```bash
# מהתיקייה הראשית של הפרויקט
docker-compose up -d
```

#### שלב 4: בדיקה

```bash
# בדוק שהכל רץ
docker-compose ps

# בדוק את הלוגים
docker-compose logs -f

# בדוק את ה-health checks
curl http://localhost:3001/health
curl http://localhost:3000
```

#### שלב 5: עצירת הפריסה

```bash
docker-compose down

# עם מחיקת volumes (זה ימחק את הנתונים!)
docker-compose down -v
```

---

## 2. פריסה לשרת VPS/Cloud

### אפשרות A: Docker Compose על VPS

#### דרישות
- שרת VPS (DigitalOcean, Linode, AWS EC2, etc.)
- Ubuntu 20.04+ או Debian 11+
- גישה root/SSH

#### שלבים

```bash
# 1. התחבר לשרת
ssh user@your-server-ip

# 2. התקן Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. התקן Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. שכפל את הפרויקט
git clone https://github.com/your-username/remindly.git
cd remindly

# 5. הגדר את משתני הסביבה
cd backend && cp .env.example .env && nano .env
cd ../web-app && cp .env.example .env && nano .env

# 6. הפעל את הפריסה
cd ..
docker-compose up -d

# 7. הגדר Firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw enable
```

### אפשרות B: פריסה ידנית (ללא Docker)

#### Backend

```bash
# 1. התקן Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. התקן PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 3. צור מסד נתונים
sudo -u postgres psql
CREATE DATABASE remindly;
CREATE USER remindly_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE remindly TO remindly_user;
\q

# 4. שכפל והתקן
git clone https://github.com/your-username/remindly.git
cd remindly/backend
npm install --production

# 5. הגדר .env
cp .env.example .env
nano .env

# 6. הפעל עם PM2
sudo npm install -g pm2
pm2 start server.js --name remindly-backend
pm2 save
pm2 startup
```

#### Web App

```bash
# 1. שכפל והתקן
cd ../web-app
npm install
npm run build

# 2. הפעל עם Nginx
sudo apt-get install nginx
sudo cp nginx.conf /etc/nginx/sites-available/remindly
sudo ln -s /etc/nginx/sites-available/remindly /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 3. פריסה ל-Kubernetes

### דרישות
- Kubernetes cluster (GKE, EKS, AKS, או Minikube)
- kubectl מותקן
- Docker images ב-registry (Docker Hub, GCR, ECR)

### שלבים

#### שלב 1: בניית והעלאת Images

```bash
# בנה את ה-images
docker build -t your-registry/remindly-backend:latest ./backend
docker build -t your-registry/remindly-web-app:latest ./web-app

# העלה ל-registry
docker push your-registry/remindly-backend:latest
docker push your-registry/remindly-web-app:latest
```

#### שלב 2: יצירת Secrets

```bash
# צור secret למסד נתונים
kubectl create secret generic remindly-db-secret \
  --from-literal=username=remindly_user \
  --from-literal=password=your_password

# צור secret ל-JWT
kubectl create secret generic remindly-jwt-secret \
  --from-literal=secret=your_jwt_secret

# צור secret ל-API keys (אופציונלי)
kubectl create secret generic remindly-api-keys \
  --from-literal=openai-key=your_openai_key \
  --from-literal=twilio-sid=your_twilio_sid \
  --from-literal=twilio-token=your_twilio_token
```

#### שלב 3: פריסה

```bash
# השתמש בסקריפט הקיים
chmod +x scripts/deploy.sh
./scripts/deploy.sh production v1.0.0

# או פריסה ידנית
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/web-app-deployment.yaml
```

#### שלב 4: בדיקה

```bash
# בדוק את ה-pods
kubectl get pods -n remindly-production

# בדוק את ה-services
kubectl get services -n remindly-production

# בדוק את ה-logs
kubectl logs -f deployment/remindly-backend -n remindly-production
```

---

## 4. פריסה ל-Cloud Providers

### A. Heroku

#### Backend

```bash
# 1. התקן Heroku CLI
# 2. התחבר
heroku login

# 3. צור אפליקציה
cd backend
heroku create remindly-backend

# 4. הוסף PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# 5. הגדר משתני סביבה
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set OPENAI_API_KEY=your_key

# 6. פרוס
git push heroku main
```

#### Web App

```bash
# השתמש ב-Heroku Buildpack עבור static sites
cd web-app
heroku create remindly-web-app
heroku buildpacks:set heroku/nodejs
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static

# פרוס
git push heroku main
```

### B. Vercel (Web App בלבד)

```bash
# 1. התקן Vercel CLI
npm i -g vercel

# 2. פרוס
cd web-app
vercel

# 3. הגדר משתני סביבה
vercel env add VITE_API_URL
```

### C. Railway

```bash
# 1. התקן Railway CLI
npm i -g @railway/cli

# 2. התחבר
railway login

# 3. צור פרויקט
railway init

# 4. פרוס
railway up
```

### D. Render

1. היכנס ל-https://render.com
2. צור New Web Service
3. חבר את ה-GitHub repository
4. הגדר:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. הוסף משתני סביבה
6. לחץ Deploy

### E. AWS (Elastic Beanstalk)

```bash
# 1. התקן EB CLI
pip install awsebcli

# 2. אתחל
eb init

# 3. צור סביבה
eb create remindly-env

# 4. פרוס
eb deploy
```

### F. Google Cloud Platform (Cloud Run)

```bash
# 1. בנה image
gcloud builds submit --tag gcr.io/PROJECT_ID/remindly-backend ./backend

# 2. פרוס
gcloud run deploy remindly-backend \
  --image gcr.io/PROJECT_ID/remindly-backend \
  --platform managed \
  --region us-central1
```

---

## 5. פריסה אוטומטית עם CI/CD

### GitHub Actions (כבר מוגדר!)

הקובץ `.github/workflows/ci-cd.yml` כבר מוגדר. כדי להפעיל:

#### שלב 1: הגדר Secrets ב-GitHub

1. לך ל-Repository → Settings → Secrets and variables → Actions
2. הוסף את ה-Secrets הבאים:
   - `OPENAI_API_KEY`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `SENDGRID_API_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `JWT_SECRET`
   - `DB_PASSWORD`

#### שלב 2: עדכן את ה-workflow

ערוך את `.github/workflows/ci-cd.yml` והוסף את פקודות הפריסה:

```yaml
# Deploy to Production
deploy-production:
  needs: [build-and-push]
  runs-on: ubuntu-latest
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  
  steps:
  - uses: actions/checkout@v4
  
  - name: Deploy to Production
    run: |
      # הוסף כאן את פקודות הפריסה שלך
      # לדוגמה: kubectl, docker-compose, ssh, etc.
```

#### שלב 3: Push ל-main branch

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

---

## 6. בדיקות לאחר פריסה

### בדיקות בסיסיות

```bash
# 1. בדוק health endpoints
curl http://your-domain.com/api/health
curl http://your-domain.com/health

# 2. בדוק את ה-API
curl -X POST http://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. בדוק את ה-Web App
curl http://your-domain.com

# 4. בדוק את ה-Database
# התחבר למסד הנתונים ובדוק שיש טבלאות
```

### בדיקות מתקדמות

```bash
# 1. בדוק logs
docker-compose logs -f backend
docker-compose logs -f web-app

# 2. בדוק metrics (אם יש Prometheus)
curl http://your-domain.com:9090

# 3. בדוק performance
# השתמש ב-tools כמו Apache Bench או k6
ab -n 1000 -c 10 http://your-domain.com/api/health
```

---

## 7. טיפול בבעיות נפוצות

### בעיה: Backend לא מתחבר למסד נתונים

**פתרון:**
```bash
# בדוק שה-DB רץ
docker-compose ps postgres

# בדוק את ה-connection string
docker-compose exec backend env | grep DB_

# בדוק את ה-logs
docker-compose logs postgres
```

### בעיה: Web App לא מתחבר ל-Backend

**פתרון:**
```bash
# בדוק את VITE_API_URL
cat web-app/.env | grep VITE_API_URL

# בדוק CORS ב-backend
# ודא ש-FRONTEND_URL נכון ב-backend/.env
```

### בעיה: Images לא נבנים

**פתרון:**
```bash
# נקה את ה-cache
docker-compose build --no-cache

# בדוק את ה-Dockerfiles
docker build -t test ./backend
```

### בעיה: Ports תפוסים

**פתרון:**
```bash
# מצא מה תופס את הפורט
sudo lsof -i :3001
sudo lsof -i :3000

# שנה את ה-ports ב-docker-compose.yml
```

### בעיה: SSL/HTTPS לא עובד

**פתרון:**
```bash
# השתמש ב-Let's Encrypt
sudo apt-get install certbot
sudo certbot --nginx -d your-domain.com

# או השתמש ב-Cloudflare (חינמי)
```

---

## 📝 Checklist לפני פריסה

- [ ] כל משתני הסביבה מוגדרים
- [ ] מסד הנתונים מוכן
- [ ] API keys תקינים
- [ ] SSL/HTTPS מוגדר
- [ ] Firewall מוגדר נכון
- [ ] Backups מוגדרים
- [ ] Monitoring מוגדר
- [ ] Logs נשמרים
- [ ] Health checks עובדים
- [ ] Documentation מעודכן

---

## 🔒 אבטחה

### לפני פריסה לפרודקשן:

1. **שנה את כל הסיסמאות והמפתחות**
2. **השתמש ב-HTTPS בלבד**
3. **הגדר Rate Limiting**
4. **השתמש ב-Secrets Management** (AWS Secrets Manager, HashiCorp Vault)
5. **הגדר Firewall Rules**
6. **הפעל Security Scanning** (Snyk, Trivy)
7. **הגדר Backups אוטומטיים**
8. **השתמש ב-Environment Variables** ולא hardcode

---

## 📞 תמיכה

אם נתקלת בבעיות:
1. בדוק את ה-logs
2. בדוק את ה-documentation
3. פתח issue ב-GitHub
4. צור קשר עם הצוות

---

**בהצלחה עם הפריסה! 🚀**

