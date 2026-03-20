# Deployment Guide — Concept Corner

## Production Deployment

### 1. MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/cloud](https://www.mongodb.com/cloud)
2. Create a database user with read/write permissions
3. Whitelist your server IP (or use 0.0.0.0/0 for all IPs)
4. Copy the connection string: `mongodb+srv://user:pass@cluster.mongodb.net/concept-corner`

### 2. Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Create upload presets for courses and avatars

### 3. bKash Production Credentials

1. Register as a merchant at [bKash Developer Portal](https://developer.bka.sh)
2. Complete KYC verification
3. Obtain production credentials:
   - App Key
   - App Secret
   - Merchant Username/Password
4. Update `BKASH_BASE_URL` to `https://tokenized.pay.bka.sh/v1.2.0-beta`

### 4. Email Service (SendGrid)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key with Mail Send permissions
3. Verify your sender email domain
4. Update SMTP settings in `.env`

---

## Deployment Options

### Option A: Railway (Recommended for beginners)

**Backend:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up
```

Set environment variables in Railway dashboard.

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm install -g vercel

cd frontend
vercel

# Follow prompts
# Set NEXT_PUBLIC_API_URL to your Railway backend URL
```

---

### Option B: VPS with Docker

```bash
# On your server (Ubuntu 22.04)
sudo apt update
sudo apt install docker.io docker-compose git -y

# Clone repository
git clone https://github.com/tandraferdous/concept-corner.git
cd concept-corner

# Set up environment files
cp backend/.env.example backend/.env
nano backend/.env   # Fill in production credentials

cp frontend/.env.example frontend/.env.local
nano frontend/.env.local   # Set NEXT_PUBLIC_API_URL

# Build and start
docker-compose -f docker-compose.yml up -d --build

# View logs
docker-compose logs -f
```

---

### Option C: Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/concept-corner

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**SSL Certificate (Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Environment Variables Checklist

### Backend (Production)
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI` — MongoDB Atlas URI
- [ ] `JWT_SECRET` — 64-char random string
- [ ] `JWT_REFRESH_SECRET` — 64-char random string
- [ ] `FRONTEND_URL` — Your production frontend URL
- [ ] `BKASH_BASE_URL` — Production bKash URL
- [ ] `BKASH_APP_KEY` — Production bKash key
- [ ] `BKASH_APP_SECRET` — Production bKash secret
- [ ] `BKASH_USERNAME` — Production username
- [ ] `BKASH_PASSWORD` — Production password
- [ ] `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` — Email credentials
- [ ] `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`

### Frontend (Production)
- [ ] `NEXT_PUBLIC_API_URL` — Production API URL
- [ ] `NEXT_PUBLIC_APP_URL` — Production frontend URL

---

## Security Hardening

```bash
# Generate strong JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Firewall setup
sudo ufw allow 22   # SSH
sudo ufw allow 80   # HTTP
sudo ufw allow 443  # HTTPS
sudo ufw enable

# Block direct access to backend and MongoDB
sudo ufw deny 5000
sudo ufw deny 27017
```

---

## Monitoring

### PM2 Process Manager (without Docker)
```bash
npm install -g pm2

# Start backend
cd backend && npm run build
pm2 start dist/server.js --name concept-corner-api

# Start frontend
cd frontend && npm run build
pm2 start npm --name concept-corner-web -- start

# Auto-restart on reboot
pm2 startup
pm2 save
```

---

## Database Backups

```bash
# Manual backup
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)

# Automated daily backup (crontab)
0 2 * * * mongodump --uri="mongodb+srv://..." --out=/backups/$(date +\%Y\%m\%d) && find /backups -mtime +30 -delete
```
