# 🚀 BillTech / BillSoft — VPS Deployment Guide

> **Document Version:** 1.0  
> **Date:** February 2026  
> **Project:** BillSoft SaaS Billing Application  
> **GitHub:** https://github.com/agbitsolutions/BillSoft.git

---

## 📋 Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Complete File & Folder Structure](#2-complete-file--folder-structure)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema Summary](#4-database-schema-summary)
5. [API Endpoints Reference](#5-api-endpoints-reference)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [VPS Prerequisites](#7-vps-prerequisites)
8. [Step-by-Step VPS Deployment](#8-step-by-step-vps-deployment)
9. [Docker Compose Production Setup](#9-docker-compose-production-setup)
10. [Nginx Reverse Proxy + SSL (HTTPS)](#10-nginx-reverse-proxy--ssl-https)
11. [Database Migration on VPS](#11-database-migration-on-vps)
12. [Port & Network Map](#12-port--network-map)
13. [Process Management & Auto-Restart](#13-process-management--auto-restart)
14. [CI/CD Pipeline (Jenkins)](#14-cicd-pipeline-jenkins)
15. [Security Checklist](#15-security-checklist)
16. [Monitoring & Logs](#16-monitoring--logs)
17. [Backup Strategy](#17-backup-strategy)
18. [Troubleshooting Common Issues](#18-troubleshooting-common-issues)
19. [Quick Reference Commands](#19-quick-reference-commands)

---

## 1. Project Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     INTERNET / USER                      │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS :443
                           ▼
            ┌──────────────────────────┐
            │   Nginx Reverse Proxy    │  (Host Machine, port 80/443)
            │   (SSL Termination)      │
            └────────┬─────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
   ┌─────────────┐      ┌──────────────────┐
   │  PUBLIC SITE │      │  BILLING SaaS App │
   │  (Landing)  │      │                  │
   │  Vite Build │      │  ┌─────────────┐ │
   │  Port 80    │      │  │  Frontend   │ │
   │  (Nginx)    │      │  │  React App  │ │
   └─────────────┘      │  │  Port 80    │ │
                        │  │  (Nginx)    │ │
                        │  └──────┬──────┘ │
                        │         │ /api/* │
                        │         ▼        │
                        │  ┌─────────────┐ │
                        │  │  Backend    │ │
                        │  │  Express.js │ │
                        │  │  Port 5001  │ │
                        │  └──────┬──────┘ │
                        │         │        │
                        │         ▼        │
                        │  ┌─────────────┐ │
                        │  │   SQLite    │ │
                        │  │  Database   │ │
                        │  │ (Prisma ORM)│ │
                        │  └─────────────┘ │
                        └──────────────────┘
```

### How Components Talk to Each Other

| From | To | Protocol | How |
|------|-----|----------|-----|
| Browser | Nginx (VPS) | HTTPS :443 | SSL/TLS |
| Nginx | Frontend Container | HTTP :80 | Docker network |
| Frontend Nginx | Backend API | HTTP :5001 | proxy_pass /api/ |
| Backend | SQLite DB | File I/O | Prisma ORM |

---

## 2. Complete File & Folder Structure

```
BillTech/                          ← ROOT PROJECT FOLDER
├── Dockerfile                      ← Builds the PUBLIC landing page (Vite)
├── Jenkinsfile                     ← CI/CD pipeline definition
├── vite.config.js                  ← Vite config (public site, port 3000 dev)
├── package.json                    ← Root scripts (dev, build, preview)
├── index.html                      ← Landing page HTML
├── main.js                         ← Landing page JS entry point
├── style.css                       ← Landing page styles
├── public/                         ← Static assets for landing page
│   ├── favicon.ico
│   ├── logo.png
│   └── ...
├── src/                            ← Landing page source (Vite)
│   └── ...
├── dist/                           ← Landing page build output (after npm run build)
├── netlify.toml                    ← Netlify config (ignore on VPS)
└── billing-saas-app/               ← MAIN SaaS APPLICATION FOLDER
    ├── .env                        ← Root-level env vars (Prisma Postgres — not used in VPS)
    ├── package.json                ← SaaS app root package
    ├── prisma/                     ← Root prisma (dev only)
    │   └── schema.prisma
    ├── backend/                    ← ⭐ BACKEND (Node.js / Express / TypeScript)
    │   ├── Dockerfile              ← Backend Docker image
    │   ├── .env                    ← Backend env (DATABASE_URL, JWT_SECRET, etc.)
    │   ├── package.json            ← Backend dependencies
    │   ├── server.js               ← Entry point (calls src/index.ts via tsx)
    │   ├── tsconfig.json           ← TypeScript config
    │   ├── prisma/                 ← ⭐ MAIN PRISMA SCHEMA & DATABASE
    │   │   ├── schema.prisma       ← All 20+ data models defined here
    │   │   └── dev.db              ← SQLite database file (MUST be backed up!)
    │   └── src/
    │       ├── index.ts            ← Express app setup, middleware, route registration
    │       ├── routes/             ← API route handlers
    │       │   ├── auth.ts         ← /api/auth (register, login, logout, profile)
    │       │   ├── bills.ts        ← /api/bills (CRUD + status)
    │       │   ├── customers.ts    ← /api/customers (CRUD)
    │       │   ├── products.ts     ← /api/products (CRUD + inventory)
    │       │   ├── suppliers.ts    ← /api/suppliers (CRUD)
    │       │   ├── expenses.ts     ← /api/expenses (CRUD)
    │       │   ├── inventory.ts    ← /api/inventory (stock alerts)
    │       │   └── admin/          ← /api/admin (tax, settings, feature-flags, roles)
    │       ├── services/           ← Business logic (23 services)
    │       ├── lib/                ← Shared utilities (prisma client, jwt, etc.)
    │       ├── middleware/         ← Express middleware (auth guard, etc.)
    │       └── cron/               ← Scheduled jobs (overdue bills, daily metrics)
    └── frontend/                   ← ⭐ FRONTEND (React / TypeScript / MUI)
        ├── Dockerfile              ← Frontend Docker image (build + nginx serve)
        ├── nginx.conf              ← Frontend nginx config (serves React + proxies /api/)
        ├── .env                    ← Frontend env (REACT_APP_API_URL, PORT, etc.)
        ├── package.json            ← Frontend dependencies (React, MUI, Recharts)
        ├── tsconfig.json           ← TypeScript config
        ├── public/                 ← Static assets (favicon, logos)
        ├── build/                  ← Production React build output
        └── src/
            ├── App.tsx             ← Main React app + routing
            ├── index.tsx           ← React entry point
            ├── pages/              ← 23 pages (Dashboard, Bills, Customers, etc.)
            ├── components/         ← 48 reusable UI components
            ├── services/           ← 21 API service files (axios calls)
            ├── contexts/           ← 7 React contexts (Auth, Theme, etc.)
            ├── hooks/              ← 7 custom React hooks
            ├── types/              ← TypeScript type definitions
            ├── utils/              ← Helper utilities
            ├── config/             ← App configuration
            └── theme/              ← MUI theme customization
```

---

## 3. Technology Stack

### Backend
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Runtime | Node.js | 20 (LTS) | JavaScript runtime |
| Framework | Express.js | v5 | HTTP server & routing |
| Language | TypeScript | ^5.3 | Type-safe backend code |
| ORM | Prisma | ^6.17 | Database access layer |
| Database | SQLite | — | Embedded file-based database |
| Auth | JWT (jsonwebtoken) | ^9 | Stateless authentication tokens |
| Password | bcryptjs | ^3 | Password hashing |
| Validation | Zod | ^4 | Request body validation |
| Scheduler | node-cron | ^3 | Cron jobs (overdue bills, metrics) |
| TypeScript Runner | tsx | ^4 | Runs TypeScript directly (no build step) |

### Frontend
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | React | ^18.2 | UI library |
| Language | TypeScript | ^5 | Type-safe frontend code |
| UI Library | MUI (Material UI) | ^7 | Component library |
| Charts | Recharts | ^3 | Analytics/dashboard charts |
| HTTP Client | Axios | ^1 | API calls to backend |
| Routing | React Router | ^6 | Client-side routing |
| Forms | React Hook Form | ^7 | Form handling & validation |
| PDF Export | jsPDF + jspdf-autotable | ^4/^5 | PDF bill generation |
| Excel Export | xlsx (SheetJS) | 0.20.3 | Excel reports |
| QR Codes | qrcode.react | ^4 | Bill QR codes |
| Print | react-to-print | ^3 | Bill printing |

### Infrastructure
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Web Server | Nginx (Alpine) | Serve static React build + API proxy |
| Containerization | Docker | Package each service |
| Orchestration | Docker Compose | Run all services together on VPS |
| CI/CD | Jenkins | Auto-build & deploy pipeline |
| Public Site | Vite | Landing page build tool |
| Container Registry | Docker Hub | Store built images |

---

## 4. Database Schema Summary

The database is **SQLite** (file: `billing-saas-app/backend/prisma/dev.db`) managed by **Prisma ORM**.

### Core Models (20+ tables)

| Model | Table | Description |
|-------|-------|-------------|
| `User` | `users` | Main user account (multi-tenant owner) |
| `Customer` | `customers` | Customers belonging to a user |
| `Product` | `products` | Products/services with inventory |
| `Bill` | `bills` | Invoices/bills with status tracking |
| `BillItem` | `bill_items` | Line items within a bill |
| `Supplier` | `suppliers` | Inventory suppliers |
| `Branch` | `branches` | Multi-branch support |
| `Expense` | `expenses` | Business expense tracking |
| `Role` | `roles` | RBAC roles (ADMIN, FINANCE, OPERATOR, READONLY) |
| `RolePermission` | `role_permissions` | Granular permissions per role |
| `UserSession` | `user_sessions` | Active session management |
| `ApiKey` | `api_keys` | API key management |
| `SecurityLog` | `security_logs` | Security audit trail |
| `PasswordHistory` | `password_history` | Password reuse prevention |
| `FeatureFlag` | `feature_flags` | Paid plan feature toggles |
| `DynamicFeatureFlag`| `dynamic_feature_flags` | Per-user/role feature control |
| `OrganizationSettings`| `organization_settings` | Global security/org settings |
| `Settings` | `settings` | App configuration key-value store |
| `SettingState` | `setting_states` | User-overridden settings |
| `Tax` | `taxes` | Tax rates management |
| `DailyMetric` | `daily_metrics` | Analytics aggregation (cron) |
| `CronJobLog` | `cron_job_logs` | Scheduled job execution tracking |
| `AuditLog` | `audit_logs` | Full data change audit log |
| `Notification` | `notifications` | In-app notifications |

### Key Enums
- **BillStatus:** `DRAFT | PENDING | PAID | OVERDUE | CANCELLED`
- **PaymentStatus:** `PAID | PARTIAL | PENDING`
- **PlanType:** `FREE | BASIC | PREMIUM | ENTERPRISE`
- **UserRole:** `ADMIN | FINANCE | OPERATOR | READONLY`
- **TaxType:** `PERCENTAGE | FIXED_AMOUNT | COMPOUND`

---

## 5. API Endpoints Reference

**Base URL (on VPS):** `https://yourdomain.com/api`

| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| POST | `/api/auth/register` | ❌ | Create new user account |
| POST | `/api/auth/login` | ❌ | Login, returns JWT token |
| POST | `/api/auth/logout` | ✅ | Invalidate session |
| GET | `/api/auth/me` | ✅ | Get current user profile |
| GET | `/api/customers` | ✅ | List all customers |
| POST | `/api/customers` | ✅ | Create customer |
| PUT | `/api/customers/:id` | ✅ | Update customer |
| DELETE | `/api/customers/:id` | ✅ | Delete customer |
| GET | `/api/products` | ✅ | List all products |
| POST | `/api/products` | ✅ | Create product |
| PUT | `/api/products/:id` | ✅ | Update product |
| DELETE | `/api/products/:id` | ✅ | Delete product |
| GET | `/api/bills` | ✅ | List all bills |
| POST | `/api/bills` | ✅ | Create new bill |
| PUT | `/api/bills/:id` | ✅ | Update bill |
| DELETE | `/api/bills/:id` | ✅ | Delete bill |
| GET | `/api/suppliers` | ✅ | List suppliers |
| POST | `/api/suppliers` | ✅ | Create supplier |
| GET | `/api/expenses` | ✅ | List expenses |
| POST | `/api/expenses` | ✅ | Create expense |
| GET | `/api/inventory` | ✅ | Inventory + stock alerts |
| GET | `/api/admin/tax` | ✅ | List tax rates |
| POST | `/api/admin/tax` | ✅ | Create tax rate |
| GET | `/api/admin/settings` | ✅ | App settings |
| POST | `/api/admin/settings` | ✅ | Update settings |
| GET | `/api/admin/feature-flags` | ✅ | Feature flags |
| GET | `/api/health` | ❌ | Backend health check |

---

## 6. Environment Variables Reference

### Backend `.env` (billing-saas-app/backend/.env)

```env
# Database — SQLite file path (relative to backend folder)
DATABASE_URL="file:prisma/dev.db"

# JWT Secret — CHANGE THIS TO A LONG RANDOM STRING ON VPS!
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Server Port — backend listens on this port
SERVER_PORT=5001

# CORS — URL of your frontend (your VPS domain)
FRONTEND_URL="https://app.yourdomain.com"

# API URL — used internally
REACT_APP_API_URL="https://app.yourdomain.com/api"

# Environment
NODE_ENV="production"
```

### Frontend `.env` (billing-saas-app/frontend/.env)

```env
# Port for local dev only (not used in Docker)
PORT=3000

# API URL — this is what React code calls
# Must be /api (relative) so Nginx proxy works
REACT_APP_API_URL=/api

# Node environment
NODE_ENV=production
```

> ⚠️ **IMPORTANT:** Never commit real secrets to `.env` files in Git.  
> On VPS, set environment variables via Docker Compose `environment:` section or a `.env.production` file that is **gitignored**.

---

## 7. VPS Prerequisites

### Minimum VPS Specs

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 GB | 2 GB |
| Storage | 20 GB | 40 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Network | 1 Gbps | 1 Gbps |

### Required Software (Install on VPS)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose v2
sudo apt install -y docker-compose-plugin

# Verify
docker --version
docker compose version

# Install Git
sudo apt install -y git

# Install Nginx (for reverse proxy on host)
sudo apt install -y nginx

# Install Certbot (for SSL / HTTPS)
sudo apt install -y certbot python3-certbot-nginx

# Install UFW Firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 8. Step-by-Step VPS Deployment

### Step 1 — SSH into Your VPS

```bash
ssh root@YOUR_VPS_IP_ADDRESS
# or with key file:
ssh -i ~/.ssh/mykey.pem ubuntu@YOUR_VPS_IP_ADDRESS
```

### Step 2 — Clone the Repository

```bash
# Create app directory
mkdir -p /opt/billsoft
cd /opt/billsoft

# Clone the project
git clone https://github.com/agbitsolutions/BillSoft.git .

# Verify files are present
ls -la
```

### Step 3 — Create Production Environment Files

```bash
# ── Backend .env ──────────────────────────────────────────
cat > /opt/billsoft/billing-saas-app/backend/.env << 'EOF'
DATABASE_URL="file:prisma/dev.db"
JWT_SECRET="CHANGE-THIS-TO-A-VERY-LONG-RANDOM-SECRET-STRING-AT-LEAST-64-CHARS"
SERVER_PORT=5001
FRONTEND_URL="https://app.yourdomain.com"
REACT_APP_API_URL="https://app.yourdomain.com/api"
NODE_ENV="production"
EOF

# ── Frontend .env ─────────────────────────────────────────
cat > /opt/billsoft/billing-saas-app/frontend/.env << 'EOF'
PORT=3000
REACT_APP_API_URL=/api
NODE_ENV=production
EOF
```

> 🔑 **Generate a strong JWT secret:**
> ```bash
> openssl rand -base64 64
> ```

### Step 4 — Create Docker Compose Production File

Create `/opt/billsoft/docker-compose.prod.yml` (see full content in Section 9).

### Step 5 — Build and Start All Containers

```bash
cd /opt/billsoft

# Build all images (this takes 5-15 minutes first time)
docker compose -f docker-compose.prod.yml build

# Start all services in background
docker compose -f docker-compose.prod.yml up -d

# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Step 6 — Run Database Migrations

```bash
# Run Prisma migrations inside the backend container
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Verify database tables were created
docker compose -f docker-compose.prod.yml exec backend npx prisma db pull
```

### Step 7 — Configure Nginx Reverse Proxy on Host

See Section 10 for the full Nginx configuration.

### Step 8 — Enable SSL with Let's Encrypt

```bash
# Replace yourdomain.com with your actual domain
sudo certbot --nginx -d yourdomain.com -d app.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 9 — Verify Everything Works

```bash
# Test backend health
curl https://app.yourdomain.com/api/health

# Test frontend (should return HTML)
curl -I https://app.yourdomain.com

# Test public landing page
curl -I https://yourdomain.com
```

---

## 9. Docker Compose Production Setup

Create this file at `/opt/billsoft/docker-compose.prod.yml`:

```yaml
version: '3.9'

services:

  # ─── BACKEND: Express.js + Prisma + SQLite ───────────────────
  backend:
    build:
      context: ./billing-saas-app/backend
      dockerfile: Dockerfile
    container_name: billsoft_backend
    restart: unless-stopped
    environment:
      - DATABASE_URL=file:prisma/dev.db
      - JWT_SECRET=${JWT_SECRET}
      - SERVER_PORT=5001
      - FRONTEND_URL=${FRONTEND_URL:-https://app.yourdomain.com}
      - NODE_ENV=production
    volumes:
      # Persist SQLite database file outside container
      - billsoft_db:/app/prisma
    ports:
      - "5001:5001"
    networks:
      - billsoft_net
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:5001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # ─── FRONTEND: React + Nginx ─────────────────────────────────
  frontend:
    build:
      context: ./billing-saas-app/frontend
      dockerfile: Dockerfile
    container_name: billsoft_frontend
    restart: unless-stopped
    environment:
      - REACT_APP_API_URL=/api
      - NODE_ENV=production
    ports:
      - "3001:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - billsoft_net

  # ─── PUBLIC LANDING PAGE: Vite + Nginx ───────────────────────
  public_site:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: billsoft_public
    restart: unless-stopped
    ports:
      - "8080:80"
    networks:
      - billsoft_net

# ─── VOLUMES ─────────────────────────────────────────────────
volumes:
  billsoft_db:
    driver: local

# ─── NETWORKS ─────────────────────────────────────────────────
networks:
  billsoft_net:
    driver: bridge
```

---

## 10. Nginx Reverse Proxy + SSL (HTTPS)

Create this host Nginx config at `/etc/nginx/sites-available/billsoft`:

```nginx
# ─── PUBLIC LANDING PAGE ── yourdomain.com ────────────────────
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ─── BILLING SaaS APP ── app.yourdomain.com ───────────────────
server {
    listen 80;
    server_name app.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Frontend React App
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

    # Direct Backend API (if needed to access directly)
    location /direct-api/ {
        proxy_pass http://localhost:5001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/billsoft /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 11. Database Migration on VPS

The backend uses **SQLite** via **Prisma ORM**. The database file is located at:
`billing-saas-app/backend/prisma/dev.db`

In Docker, this is stored in a named volume: `billsoft_db`

### First-Time Setup (Migration)

```bash
# Enter the backend container
docker compose -f docker-compose.prod.yml exec backend sh

# Inside container — generate Prisma client
npx prisma generate

# Run pending migrations
npx prisma migrate deploy

# (Optional) Seed initial data
# npx prisma db seed

# Exit container
exit
```

### After Schema Changes (When You Update schema.prisma)

```bash
# On local machine — create a new migration
npx prisma migrate dev --name describe_your_change

# Commit the migration file
git add billing-saas-app/backend/prisma/migrations/
git commit -m "Add migration: describe_your_change"
git push

# On VPS — pull changes and apply migration
cd /opt/billsoft
git pull origin main
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Backup the SQLite Database

```bash
# Backup the database volume to a file
docker run --rm \
  -v billsoft_db:/data \
  -v /opt/backups:/backup \
  alpine tar czf /backup/billsoft_db_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# List backups
ls -lh /opt/backups/
```

---

## 12. Port & Network Map

| Service | Container Port | Host Port | Accessed Via |
|---------|---------------|-----------|-------------|
| Public Landing Page (Nginx) | 80 | 8080 | `https://yourdomain.com` (via host Nginx) |
| Frontend React App (Nginx) | 80 | 3001 | `https://app.yourdomain.com` (via host Nginx) |
| Backend API (Express) | 5001 | 5001 | Internal only via Docker network + frontend proxy |
| Host Nginx HTTP | — | 80 | Redirects to HTTPS |
| Host Nginx HTTPS | — | 443 | Public internet |

### Internal Docker Network Flow

```
Browser Request: https://app.yourdomain.com/api/bills
  → Host Nginx (:443) 
  → Forward to localhost:3001
  → Frontend Nginx container
  → proxy_pass http://backend:5001/api/bills
  → Backend Express container
  → Prisma ORM
  → SQLite dev.db file (in volume)
  → Response back up the chain
```

---

## 13. Process Management & Auto-Restart

Docker Compose handles restarts via `restart: unless-stopped`.

**Enable Docker to start on system boot:**

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

**Start BillSoft automatically on VPS reboot:**

Create `/etc/systemd/system/billsoft.service`:

```ini
[Unit]
Description=BillSoft Docker Compose Application
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/billsoft
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable billsoft
sudo systemctl start billsoft
```

---

## 14. CI/CD Pipeline (Jenkins)

The project contains a `Jenkinsfile` that defines an automated deployment pipeline.

### Pipeline Stages

```
┌─────────────────┐    ┌───────────────────┐    ┌─────────────────┐    ┌───────────────────────┐
│  1. Checkout    │ →  │  2. Build Docker  │ →  │  3. Push Image  │ →  │  4. Deploy to         │
│     Code        │    │     Image         │    │  to Docker Hub  │    │     Kubernetes / VPS   │
└─────────────────┘    └───────────────────┘    └─────────────────┘    └───────────────────────┘
```

### Jenkins Setup on VPS (Optional)

```bash
# Install Jenkins
sudo apt install -y default-jdk
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo gpg --dearmor -o /usr/share/keyrings/jenkins-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.gpg] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/jenkins.list
sudo apt update && sudo apt install -y jenkins
sudo systemctl enable jenkins && sudo systemctl start jenkins

# Jenkins runs on port 8090 by default
# Access at: http://YOUR_VPS_IP:8090
```

### Required Jenkins Credentials

| Credential ID | Type | Value |
|--------------|------|-------|
| `dockerhub-creds` | Username/Password | Docker Hub login |

---

## 15. Security Checklist

Before going live, verify all of these:

- [ ] **JWT_SECRET** is changed from default — minimum 64 random characters
- [ ] **No `.env` files with secrets** are committed to Git (check `.gitignore`)
- [ ] **UFW Firewall** is enabled — only ports 22, 80, 443 open
- [ ] **SSL/HTTPS** is configured with Let's Encrypt certificates
- [ ] **Nginx security headers** are set (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] **Database file** (`dev.db`) is stored in a Docker volume (not in the container)
- [ ] **Backend port 5001** is NOT exposed to the internet (only via internal Docker network)
- [ ] **Regular automated backups** of the SQLite database are scheduled
- [ ] **Node.js version** 20 LTS is used (not older EOL versions)
- [ ] **`NODE_ENV=production`** is set in all `.env` files
- [ ] **Rate limiting** is active (the backend and Nginx both should rate-limit)
- [ ] **SSH root login** is disabled on the VPS (`PermitRootLogin no` in sshd_config)
- [ ] **SSH key authentication** is used (no password-based SSH)
- [ ] **Auto-updates** for security patches are enabled

---

## 16. Monitoring & Logs

### View Live Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Backend only
docker compose -f docker-compose.prod.yml logs -f backend

# Frontend only
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Check Container Status

```bash
docker compose -f docker-compose.prod.yml ps
docker stats  # Live CPU / Memory usage
```

### Health Check Endpoints

```bash
# Backend health
curl https://app.yourdomain.com/api/health
# Expected: {"status":"OK","message":"BillSoft API Server is running"}

# Nginx (frontend)
curl -I https://app.yourdomain.com
# Expected: HTTP/2 200
```

### Nginx Access Logs (Host)

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 17. Backup Strategy

### Database Backup (Manual)

```bash
# Backup SQLite database
docker run --rm \
  -v billsoft_db:/data \
  -v /opt/backups:/backup \
  alpine tar czf /backup/billsoft_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

### Automated Daily Backup (Cron on VPS)

```bash
# Edit cron jobs
sudo crontab -e

# Add this line to backup every day at 2:00 AM
0 2 * * * docker run --rm -v billsoft_db:/data -v /opt/backups:/backup alpine tar czf /backup/billsoft_$(date +\%Y\%m\%d).tar.gz -C /data . >> /var/log/billsoft-backup.log 2>&1

# Keep only last 30 days of backups
0 3 * * * find /opt/backups -name "billsoft_*.tar.gz" -mtime +30 -delete
```

### Restore from Backup

```bash
# Stop the backend
docker compose -f docker-compose.prod.yml stop backend

# Restore the database
docker run --rm \
  -v billsoft_db:/data \
  -v /opt/backups:/backup \
  alpine sh -c "cd /data && tar xzf /backup/billsoft_YYYYMMDD.tar.gz"

# Start the backend again
docker compose -f docker-compose.prod.yml start backend
```

---

## 18. Troubleshooting Common Issues

### ❌ Backend container keeps restarting

```bash
# Check backend logs
docker compose -f docker-compose.prod.yml logs backend --tail=50

# Common causes:
# 1. DATABASE_URL path is wrong
# 2. JWT_SECRET is missing
# 3. Port conflict
```

### ❌ Frontend shows "Cannot connect to server" or blank page

```bash
# Check if backend is healthy
curl http://localhost:5001/api/health

# Check frontend nginx config — is proxy_pass pointing to correct backend name?
docker compose -f docker-compose.prod.yml exec frontend cat /etc/nginx/conf.d/default.conf

# Make sure backend container name matches nginx.conf proxy_pass
# nginx.conf: proxy_pass http://backend:5001/api/
# docker-compose: container_name: billsoft_backend  ← this must be "backend" in the Docker network
```

### ❌ Nginx shows 502 Bad Gateway

```bash
# Check if the frontend container is running on port 3001
docker compose -f docker-compose.prod.yml ps

# Check host Nginx error log
sudo tail -20 /var/log/nginx/error.log

# Test direct connection to frontend container
curl http://localhost:3001
```

### ❌ Database / Prisma error on startup

```bash
# Enter backend container
docker compose -f docker-compose.prod.yml exec backend sh

# Check if db file exists
ls -la prisma/

# Manually run migration
npx prisma migrate deploy

# Regenerate Prisma client
npx prisma generate
```

### ❌ SSL Certificate issues

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Test Nginx config
sudo nginx -t && sudo systemctl reload nginx
```

---

## 19. Quick Reference Commands

```bash
# ── DEPLOY / UPDATE ──────────────────────────────────────────
cd /opt/billsoft
git pull origin main                                    # Pull latest code
docker compose -f docker-compose.prod.yml build         # Rebuild images
docker compose -f docker-compose.prod.yml up -d         # Start/restart services

# ── LOGS ─────────────────────────────────────────────────────
docker compose -f docker-compose.prod.yml logs -f               # All logs
docker compose -f docker-compose.prod.yml logs -f backend        # Backend only
docker compose -f docker-compose.prod.yml logs -f frontend       # Frontend only

# ── STATUS ───────────────────────────────────────────────────
docker compose -f docker-compose.prod.yml ps            # Container status
docker stats                                            # CPU/Memory live

# ── STOP / RESTART ───────────────────────────────────────────
docker compose -f docker-compose.prod.yml restart       # Restart all
docker compose -f docker-compose.prod.yml stop          # Stop all
docker compose -f docker-compose.prod.yml down          # Stop + remove containers

# ── DATABASE ─────────────────────────────────────────────────
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
docker compose -f docker-compose.prod.yml exec backend npx prisma studio  # GUI (local only)
docker compose -f docker-compose.prod.yml exec backend npx prisma generate

# ── NGINX ────────────────────────────────────────────────────
sudo nginx -t                                           # Test config
sudo systemctl reload nginx                             # Apply config without downtime
sudo systemctl status nginx                             # Check nginx status

# ── SSL ──────────────────────────────────────────────────────
sudo certbot certificates                               # List certificates
sudo certbot renew                                      # Renew certificates

# ── CLEANUP ──────────────────────────────────────────────────
docker system prune -af                                 # Remove unused images/containers
docker volume ls                                        # List volumes (DO NOT delete billsoft_db!)
```

---

## 📌 Summary: What Runs Where

| What | Where it Runs | Port | URL |
|------|--------------|------|-----|
| Public Landing Page | Docker container (Nginx) | Host: 8080 | `https://yourdomain.com` |
| React SaaS App (Frontend) | Docker container (Nginx) | Host: 3001 | `https://app.yourdomain.com` |
| Express.js API (Backend) | Docker container (Node.js) | Host: 5001 | Internal only |
| SQLite Database | Docker named volume | File | `billsoft_db` volume |
| Host Nginx (Reverse Proxy) | VPS host machine | 80 / 443 | Routes all traffic |
| Jenkins CI/CD (Optional) | VPS host machine | 8090 | `http://VPS_IP:8090` |

---

*Generated for BillSoft SaaS Project — agbitsolutions/BillSoft — February 2026*
