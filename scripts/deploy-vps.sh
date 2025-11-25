#!/bin/bash

# Remindly VPS Deployment Script (ללא Docker)
# Usage: ./deploy-vps.sh
# 
# דרישות:
# - שרת VPS עם Ubuntu/Debian
# - Cloud Panel מותקן
# - גישה root/sudo

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🚀 Remindly VPS Deployment Script${NC}"
echo -e "${YELLOW}================================${NC}"

# Variables
PROJECT_DIR="/var/www/remindly"
WEB_DIR="/var/www/remindly-web"
DOMAIN=""
DB_NAME="remindly_db"
DB_USER="remindly_user"
DB_PASSWORD=""

# Functions
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        echo -e "${RED}❌ Please run as root or with sudo${NC}"
        exit 1
    fi
}

install_dependencies() {
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    
    # Update system
    apt update
    apt upgrade -y
    
    # Install Node.js 18
    if ! command -v node &> /dev/null; then
        echo -e "${YELLOW}Installing Node.js...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    # Install PostgreSQL
    if ! command -v psql &> /dev/null; then
        echo -e "${YELLOW}Installing PostgreSQL...${NC}"
        apt install postgresql postgresql-contrib -y
        systemctl start postgresql
        systemctl enable postgresql
    fi
    
    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        echo -e "${YELLOW}Installing Nginx...${NC}"
        apt install nginx -y
        systemctl start nginx
        systemctl enable nginx
    fi
    
    # Install PM2
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}Installing PM2...${NC}"
        npm install -g pm2
    fi
    
    # Install build tools
    apt install build-essential -y
    
    echo -e "${GREEN}✅ Dependencies installed${NC}"
}

setup_database() {
    echo -e "${YELLOW}🗄️  Setting up database...${NC}"
    
    if [ -z "$DB_PASSWORD" ]; then
        read -sp "Enter database password: " DB_PASSWORD
        echo
    fi
    
    # Create database and user
    sudo -u postgres psql <<EOF
CREATE DATABASE ${DB_NAME};
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
ALTER ROLE ${DB_USER} SET client_encoding TO 'utf8';
ALTER ROLE ${DB_USER} SET default_transaction_isolation TO 'read committed';
ALTER ROLE ${DB_USER} SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
\q
EOF
    
    echo -e "${GREEN}✅ Database setup completed${NC}"
}

setup_backend() {
    echo -e "${YELLOW}⚙️  Setting up backend...${NC}"
    
    # Create project directory
    mkdir -p ${PROJECT_DIR}
    cd ${PROJECT_DIR}
    
    # If git repo exists, pull. Otherwise, assume files are uploaded
    if [ -d ".git" ]; then
        git pull
    fi
    
    cd backend
    
    # Install dependencies
    npm install --production
    
    # Create .env if doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo -e "${YELLOW}⚠️  Please edit backend/.env with your configuration${NC}"
        fi
    fi
    
    # Create uploads directory
    mkdir -p uploads/voice uploads/media
    chmod -R 755 uploads
    
    # Start with PM2
    pm2 start server.js --name remindly-backend || pm2 restart remindly-backend
    pm2 save
    
    echo -e "${GREEN}✅ Backend setup completed${NC}"
}

setup_webapp() {
    echo -e "${YELLOW}🌐 Setting up web app...${NC}"
    
    cd ${PROJECT_DIR}/web-app
    
    # Install dependencies
    npm install
    
    # Create .env if doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            # Update API URL
            if [ ! -z "$DOMAIN" ]; then
                sed -i "s|VITE_API_URL=.*|VITE_API_URL=https://${DOMAIN}/api|g" .env
            fi
        fi
    fi
    
    # Build
    npm run build
    
    # Copy to web directory
    mkdir -p ${WEB_DIR}
    cp -r dist/* ${WEB_DIR}/
    
    # Copy logo if exists
    if [ -f "public/LogoRemindly.png" ]; then
        cp public/LogoRemindly.png ${WEB_DIR}/
    fi
    
    # Set permissions
    chown -R www-data:www-data ${WEB_DIR}
    chmod -R 755 ${WEB_DIR}
    
    echo -e "${GREEN}✅ Web app setup completed${NC}"
}

setup_nginx() {
    echo -e "${YELLOW}🔧 Setting up Nginx...${NC}"
    
    if [ -z "$DOMAIN" ]; then
        read -p "Enter your domain name: " DOMAIN
    fi
    
    # Copy nginx config
    if [ -f "${PROJECT_DIR}/nginx/remindly.conf" ]; then
        cp ${PROJECT_DIR}/nginx/remindly.conf /etc/nginx/sites-available/remindly
    else
        # Create basic config
        cat > /etc/nginx/sites-available/remindly <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    root ${WEB_DIR};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    fi
    
    # Replace domain in config
    sed -i "s/your-domain.com/${DOMAIN}/g" /etc/nginx/sites-available/remindly
    sed -i "s|/var/www/remindly-web|${WEB_DIR}|g" /etc/nginx/sites-available/remindly
    
    # Enable site
    ln -sf /etc/nginx/sites-available/remindly /etc/nginx/sites-enabled/
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload
    nginx -t
    systemctl reload nginx
    
    echo -e "${GREEN}✅ Nginx setup completed${NC}"
}

setup_ssl() {
    echo -e "${YELLOW}🔒 Setting up SSL...${NC}"
    
    read -p "Do you want to install SSL certificate? (y/n): " install_ssl
    
    if [ "$install_ssl" = "y" ]; then
        # Install Certbot
        apt install certbot python3-certbot-nginx -y
        
        # Get certificate
        certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} || true
        
        echo -e "${GREEN}✅ SSL setup completed${NC}"
    else
        echo -e "${YELLOW}⚠️  SSL setup skipped${NC}"
    fi
}

setup_pm2_startup() {
    echo -e "${YELLOW}🔄 Setting up PM2 startup...${NC}"
    
    # Generate startup script
    pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER || true
    
    echo -e "${GREEN}✅ PM2 startup configured${NC}"
}

# Main
main() {
    check_root
    
    echo -e "${BLUE}Starting deployment...${NC}"
    echo
    
    install_dependencies
    setup_database
    setup_backend
    setup_webapp
    setup_nginx
    setup_ssl
    setup_pm2_startup
    
    echo
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Edit ${PROJECT_DIR}/backend/.env with your configuration"
    echo -e "2. Edit ${PROJECT_DIR}/web-app/.env with your API URL"
    echo -e "3. Restart backend: ${BLUE}pm2 restart remindly-backend${NC}"
    echo -e "4. Check logs: ${BLUE}pm2 logs remindly-backend${NC}"
    echo -e "5. Visit: ${BLUE}http://${DOMAIN}${NC}"
    echo
}

# Run
main

