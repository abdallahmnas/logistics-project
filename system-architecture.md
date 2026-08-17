# Logicore RMB Logistics - System Architecture & Design

## 1. System Overview

The Logicore RMB Logistics platform is a comprehensive, end-to-end logistics and financial management system designed to facilitate international shipping, primarily between China (CN) and Nigeria (NG), though scalable globally. The system bridges the gap between complex warehouse operations, international freight forwarding, and customer-facing shipment tracking and financial services.

It operates on a dual-portal model:

- **Admin Portal**: For internal staff, warehouse operators, and super admins to manage shipments, financials, staff permissions, and customer support.
- **Customer Portal**: For end-users to track shipments, fund wallets, request currency exchanges, and communicate with support.

---

## 2. Frontend Overview

### The Admin Portal

The administrative backbone of the platform, built to handle high-volume logistics and financial operations. Key modules include:

- **Warehouse Operations**:
  - _Facilities_: Management of global hubs (e.g., Guangzhou, Lagos).
  - _Packages (Inbound)_: Scanning and logging individual customer packages as they arrive at origin warehouses.
  - _Consolidations_: Grouping multiple inbound packages belonging to a single customer into consolidated shipments to save costs.
  - _Master Batches_: Grouping multiple customer consolidations into massive freight batches (Air/Sea) for international transit.
- **Operations & Financials**:
  - _Procurements (Buy For Me)_: Managing customer requests to purchase goods on their behalf.
  - _Exchange_: Managing currency exchange requests (e.g., NGN to CNY) for customers paying overseas suppliers.
  - _Local Dispatch_: Last-mile delivery management once goods arrive at the destination country.
- **Management & Settings**:
  - _Customers & Staff_: CRM for customers and a robust Staff Member directory.
  - _Permissions_: Highly granular Role-Based Access Control (RBAC). Admin roles (Super Admin, Warehouse NG, Warehouse CN, Finance) dictate module visibility.
  - _Settings_: Real-time configuration of Exchange Rates, Shipping Rates (Global Thresholds & Regional Zones), and Notification Preferences.
  - _Support Tickets_: A centralized helpdesk for agents to resolve customer issues, featuring internal notes and chat logs.

### The Customer Portal

A self-service dashboard focused on transparency and ease of use for the end customer.

- **Shipments**:
  - Customers can view inbound packages, request consolidations, and track the real-time status of their cargo.
  - Access to Warehouse Addresses (e.g., China address with their unique Customer ID for suppliers).
- **Financial Services (Wallet & Exchange)**:
  - A digital wallet to hold balances in multiple currencies (e.g., NGN, CNY).
  - Ability to fund the wallet, request currency exchanges, and view transaction history.
- **Procurement (Buy For Me)**:
  - Submitting links to products they want the platform to buy on their behalf.
- **Support Tickets**:
  - A ticketing system to report issues, attach files, and communicate directly with the support team.

---

## 3. Backend Architecture Design

To support this frontend, the backend will be structured as a **Monolith** using Node.js, Express, and TypeScript, leveraging Sequelize (PostgreSQL) for relational data mapping.

### 3.1 Tech Stack Summary

- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (via Sequelize ORM)
- **Caching & State**: Redis (Permissions, Session tracking)
- **Message Broker / Queues**: BullMQ (Powered by Redis) for async background tasks.
- **Authentication**: JSON Web Tokens (JWT)
- **PDF Generation**: (Invoice, Manifests, Waybills) lightweight
- **Notifications**: Nodemailer (Email), WhatsApp API integration (e.g., Twilio or Meta Graph API).

### 3.2 Monorepo Structure

The project will be housed in a single repository combining the React frontend and the Express backend. They will share a single `package.json` at the root for dependency management (using Workspaces) and run concurrently during development, but compile into a unified build folder for production.

```text
/hamza-rmb
├── /frontend           # React (Vite) Application
│   ├── /src
│   └── package.json
├── /backend            # Node.js Express Application
│   ├── /src
│   │   ├── /controllers
│   │   ├── /models     # Sequelize Models
│   │   ├── /routes
│   │   ├── /services   # Business logic (BullMQ workers, PDF gen)
│   │   └── /middlewares
│   ├── tsconfig.json
│   └── package.json
├── package.json        # Root package.json (concurrently running dev servers)
└── build/              # Unified output folder for production
```

_In production, the Express server will serve the static React files from the `build/` folder, while prefixing its own API routes (e.g., `/api/v1/...`)._

### 3.3 Core Backend Flows & Services

#### A. Authentication & Permission Management (JWT + Redis)

- **Flow**: User logs in -> Backend verifies hash -> Generates JWT containing User ID and Role ID -> Frontend stores JWT in HttpOnly cookies or memory.
- **Redis Caching**: Permission matrices (which role can access which module) are complex and queried on every request. When a `Permission Group` is updated in the Admin panel, the backend updates Postgres and flushes the cached role in Redis. Subsequent API calls read permissions from the high-speed Redis cache via a centralized `authorize(module, action)` middleware to prevent database bottlenecks.

#### B. Asynchronous Queuing Services (BullMQ)

Heavy or third-party dependent tasks will not block the Express event loop. They are offloaded to BullMQ workers:

- **Notification Queue**: Whenever a shipment status changes or a wallet is funded, an event is pushed to the queue. The worker checks the global `Notification Preferences` (Email vs WhatsApp, Instant vs Digest) and dispatches via Nodemailer or the WhatsApp API accordingly.
- **Sync Queue**: Scheduled cron jobs (via BullMQ repeatable jobs) to fetch live exchange rates from external APIs every 15 minutes and update the global platform rates.

#### C. Document Generation

- **Flow**: An Admin requests a "Master Batch Manifest" or a customer downloads an "Invoice".
- **Execution**: A dedicated Express route triggers a service that compiles HTML (using a templating engine like Handlebars or EJS) injecting Postgres data. A headless Chromium instance (a lightweight alternative preferred) converts the HTML to a PDF buffer, which is streamed back to the client or saved to cloud storage (AWS S3) and linked.

#### D. The Financial Engine

- **Wallets**: Modeled with strictly ACID-compliant transactions in Postgres. We will use Sequelize Transactions with `SERIALIZABLE` or `READ COMMITTED` isolation levels to prevent race conditions during concurrent wallet deductions.
- **Exchange Ledger**: Tracks all currency swaps, storing the exact exchange rate used at the specific millisecond the transaction occurred, ensuring historical accuracy regardless of live rate fluctuations.

#### E. Staff & Customer Management

- **Staff Management**: Linked to `Roles`. A staff member belongs to a department and has a `role_id`. When adding a staff member, an invite token is generated and sent via BullMQ/Nodemailer to their email.
- **Customer Management**: Linked to `Wallets`. Every new customer automatically provisions a default multi-currency wallet ledger upon registration.

### 3.4 Data Modeling (High Level)

- **Users**: (id, email, password_hash, role_id, type: ENUM('admin', 'customer'))
- **Roles & Permissions**: (id, name, permissions_json)
- **Packages**: (id, tracking_number, customer_id, warehouse_id, status, weight, dimensions)
- **Consolidations**: (id, customer_id, tracking_number, status, total_weight)
- **MasterBatches**: (id, batch_number, transit_method, origin_hub, destination_hub, status)
- **Wallets**: (id, customer_id, currency, balance)
- **Transactions**: (id, wallet_id, type: ENUM('credit', 'debit'), amount, reference)
- **Tickets**: (id, customer_id, subject, status, category)
- **TicketMessages**: (id, ticket_id, sender_id, message, is_internal)
