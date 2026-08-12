# Logicore / Hamza RMB Logistics & RMB Exchange Platform

A full-stack, enterprise-grade China-to-Nigeria freight logistics, local delivery dispatch, currency exchange (RMB/NGN), and procurement platform.

---

## 🌟 Key Features

### 1. 🚚 Freight Logistics & Warehouse Operations
- **Pre-Alert Tracking**: Customers pre-alert incoming Chinese supplier shipments with tracking numbers.
- **China & Nigeria Hub Scanning**: Warehouse staff scan packages to register weights (kg), volume (CBM), and package dimensions.
- **Consolidation Engine**: Merge multiple packages into single cost-effective consolidated freight shipments.
- **Master Bill & Batching**: Group consolidated shipments into Air Express or Sea Freight master batches with real-time ETA tracking.
- **Public Package Tracking**: Unauthenticated public tracking endpoint (`GET /api/v1/shipments/tracking/:trackingId`) for end-users.

### 2. 💱 RMB Trading & Financial Engine
- **Live Rate Management**: Configure active buy/sell and platform exchange rates (NGN/CNY).
- **Payment Verification**: Upload payment receipts directly to Cloudinary (`uploadToCloudinary`).
- **Escrow & Fund Release**: Two-step admin approval flow (`verify-naira` -> `release-rmb`).
- **Wallet Engine**: Automatic NGN wallet initialization upon registration, tracking credits/debits and transaction history.

### 3. 🛍️ Procurement ("Buy For Me")
- Customer product link submission with custom specs, sizes, and color variations.
- Multi-currency admin quoting engine (RMB product cost + RMB service fee -> NGN conversion).
- Automated status progression (`submitted` -> `quoted` -> `approved` -> `purchased` -> `shipped` -> `delivered`).

### 4. 🚖 Local Delivery Dispatch
- Vehicle-specific fare calculation engine (Motorbike, Sedan, Box Truck).
- Driver assignment with automated 4-digit verification PIN generation for secure customer delivery handoff.

### 5. 🎧 Support Ticket System
- Customer support ticket creation with category and priority levels.
- Full multi-message reply thread between customers and support agents.

### 6. 🔐 Authentication & Security
- Role-Based Access Control (RBAC): `super_admin`, `admin`, `warehouse_cn`, `warehouse_ng`, `procurement`, `finance`, `driver`, `customer`.
- 6-digit OTP verification upon registration (printed to terminal & sent via SMTP).
- Password reset token workflow (`forgot-password` & `reset-password`).
- Profile photo upload integrated with Cloudinary.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Redux Toolkit, Ant Design, TailwindCSS
- **Backend**: Node.js, Express, TypeScript, Sequelize ORM, PostgreSQL 15, Redis 7
- **Media & Email**: Cloudinary SDK, Nodemailer (Gmail / SMTP)
- **Containerization & Testing**: Docker, Docker Compose, Vitest, Supertest

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js >= 18.x
- Docker & Docker Compose
- PostgreSQL & Redis (if running locally without Docker)

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start Database Services (PostgreSQL & Redis)
```bash
docker compose up -d
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Seed Database
Synchronize PostgreSQL tables and seed sample users, wallets, packages, batches, exchange requests, local deliveries, and support tickets:
```bash
npm run seed
```

### 6. Run Development Server
Launches both Vite frontend (`http://localhost:5173`) and Express backend (`http://localhost:5000`):
```bash
npm run dev
```

---

## 🧪 Testing & Verification

Run the full automated Vitest test suite:
```bash
npx vitest run
```
*Output: 7/7 test suites passed, 19/19 tests passed.*

Check TypeScript compilation:
```bash
npx tsc --noEmit
```

---

## 📦 Production Deployment

### Option A: Node.js / PM2 Single Instance Deployment
1. Build frontend static bundle:
   ```bash
   npm run build
   ```
2. Set environment to production:
   ```bash
   export NODE_ENV=production
   export PORT=5000
   ```
3. Start server (serves API and static `/dist` frontend fallback):
   ```bash
   npx tsx server/src/index.ts
   ```

### Option B: Docker Containerized Deployment
Build and run the production image:
```bash
docker build -t logicore-logistics:latest .
docker run -d -p 5000:5000 --env-file .env logicore-logistics:latest
```

---

## 🔑 Default Seed Credentials for Testing

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@hamzarmb.com` | `password123` |
| **Customer** | `adebayo@example.com` | `password123` |
| **Customer** | `chiamaka@example.com` | `password123` |
