#!/bin/bash
# EarnVault Deployment Script for VPS (Hostinger / Ubuntu)
# Run this script on your VPS after cloning from GitHub

set -e

echo "🚀 EarnVault Deployment Script"
echo "==============================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root: sudo bash deploy.sh${NC}"
  exit 1
fi

PROJECT_DIR="/var/www/earnvault"

# Step 1: Install Node.js 20.x if not installed
echo -e "${YELLOW}Step 1: Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 20.x..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo -e "${GREEN}Node.js $(node -v) installed${NC}"

# Step 2: Install Bun if not installed
echo -e "${YELLOW}Step 2: Checking Bun...${NC}"
if ! command -v bun &> /dev/null; then
  echo "Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi
echo -e "${GREEN}Bun installed${NC}"

# Step 3: Install PM2 if not installed
echo -e "${YELLOW}Step 3: Checking PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
fi
echo -e "${GREEN}PM2 installed${NC}"

# Step 4: Install Nginx if not installed
echo -e "${YELLOW}Step 4: Checking Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
  echo "Installing Nginx..."
  apt-get update
  apt-get install -y nginx
fi
echo -e "${GREEN}Nginx installed${NC}"

# Step 5: Clone or update project
echo -e "${YELLOW}Step 5: Setting up project...${NC}"
if [ -d "$PROJECT_DIR" ]; then
  echo "Updating existing project..."
  cd "$PROJECT_DIR"
  git pull origin main
else
  echo "Cloning project..."
  mkdir -p /var/www
  cd /var/www
  # Replace with your GitHub repo URL
  git clone https://github.com/YOUR_USERNAME/earnvault.git earnvault
  cd "$PROJECT_DIR"
fi

# Step 6: Install dependencies
echo -e "${YELLOW}Step 6: Installing dependencies...${NC}"
bun install

# Step 7: Setup environment
echo -e "${YELLOW}Step 7: Setting up environment...${NC}"
if [ ! -f ".env" ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo -e "${RED}⚠️  IMPORTANT: Edit .env file with your production values!${NC}"
  echo -e "${RED}   Run: nano $PROJECT_DIR/.env${NC}"
  echo -e "${RED}   Especially change JWT_SECRET!${NC}"
  read -p "Press Enter after editing .env file..."
fi

# Step 8: Setup database
echo -e "${YELLOW}Step 8: Setting up database...${NC}"
mkdir -p db
bunx prisma generate
bunx prisma db push

# Step 9: Build the project
echo -e "${YELLOW}Step 9: Building project...${NC}"
bun run build

# Step 10: Setup PM2
echo -e "${YELLOW}Step 10: Setting up PM2...${NC}"
pm2 delete earnvault 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Step 11: Setup Nginx
echo -e "${YELLOW}Step 11: Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/earnvault << 'NGINX'
server {
    listen 80;
    server_name oryndelux.com www.oryndelux.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    client_max_body_size 20M;
}
NGINX

ln -sf /etc/nginx/sites-available/earnvault /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Step 12: Setup SSL with Certbot
echo -e "${YELLOW}Step 12: SSL Setup (optional)...${NC}"
if command -v certbot &> /dev/null; then
  echo "Certbot found. Setting up SSL..."
  certbot --nginx -d oryndelux.com -d www.oryndelux.com --non-interactive --agree-tos --redirect
  echo -e "${GREEN}SSL configured!${NC}"
else
  echo -e "${YELLOW}Certbot not installed. Install it for SSL:${NC}"
  echo "  apt install certbot python3-certbot-nginx"
  echo "  certbot --nginx -d oryndelux.com -d www.oryndelux.com"
fi

echo ""
echo -e "${GREEN}==============================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}==============================${NC}"
echo ""
echo "Your site should be live at: https://oryndelux.com"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check app status"
echo "  pm2 logs earnvault  - View logs"
echo "  pm2 restart earnvault - Restart app"
echo "  pm2 stop earnvault  - Stop app"
