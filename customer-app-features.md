# Logicore RMB Logistics - Customer Mobile App Features & UI Guide

This document captures all the functionalities available to the customer on the Logicore platform. It serves as a blueprint for designing and developing the Customer Mobile App UI.

---

## 1. Onboarding & Authentication

- **Sign Up / Registration**: 
  - Users can create an account using Email/Password or Social Logins (Google/Apple).
  - Required fields: First Name, Last Name, Email, Phone Number, Password.
  - A unique `Customer ID` (e.g., `HZ-20241001`) is generated upon registration.
- **Login**:
  - Email and Password login.
  - Mobile App specific: Biometric login (FaceID / Fingerprint) support.
- **Forgot Password**:
  - Password recovery flow via Email OTP or Magic Link.
- **Verification / KYC (Optional but recommended for high-value transactors)**:
  - Flow to upload ID documents if required by platform settings.

---

## 2. Main Dashboard (Overview)

The landing screen of the mobile app (Home Tab).
- **Welcome Banner**: "Welcome back, [First Name]" with a quick glance at their unique Customer ID.
- **Wallet Glance**: Prominent display of their Wallet Balance with a quick "Fund Wallet" CTA.
- **Quick Action Grid**: 
  - Track a Shipment
  - Request Exchange
  - Buy For Me
  - Consolidate
- **Active Summary Cards**: 
  - Number of items waiting at the warehouse.
  - Number of shipments in transit.
- **Recent Activities / Tracking**: A miniaturized timeline of their most recently updated shipment or transaction.

---

## 3. Core Modules (Navigation)

Based on the web sidebar, these are the primary functional modules the customer has access to. In a mobile app, these can be placed in a bottom tab bar or a side drawer / hamburger menu.

### 3.1 My Shipments (`/customer/shipments`)
- **List View**: A list of all inbound packages and outgoing shipments. Filter by status (Pending, In Transit, Delivered).
- **Shipment Details**: Tapping a shipment shows:
  - Tracking Number and Status Timeline (Dispatched, Arrived at Hub, Delivered).
  - Package Details (Weight, CBM, Description).
  - Associated Costs.

### 3.2 Consolidation (`/customer/consolidation`)
- **Pending Items**: View all packages currently sitting in the origin warehouse.
- **New Consolidation Flow**: 
  - Select multiple items to pack together.
  - Choose shipping method (Air Freight vs Sea Freight).
  - Select Payment Method: "Pay Now (Bank Transfer/Wallet)" or "Pay on Delivery".
  - View estimated cost based on combined weight/volume.

### 3.3 Addresses (`/customer/addresses`)
- **Warehouse Addresses**: View the platform's global warehouse addresses (e.g., China Hub, UK Hub, US Hub).
- **Copy Details**: One-click copy functionality so the customer can easily paste the warehouse address (along with their unique Customer ID) to their overseas suppliers (like Taobao, 1688).

### 3.4 Buy For Me (`/customer/buy-for-me`)
- **Procurement Requests**: Customers can submit links to products they want the platform to buy on their behalf.
- **Form Fields**: Product URL, Name, Quantity, Price, Variants (Color/Size), and Upload Image.
- **Status Tracking**: Track the status of the procurement (Pending Review, Payment Required, Purchased, Arrived at Warehouse).

### 3.5 Currency Exchange (`/customer/exchange`)
- **Exchange Requests**: Swap currency (e.g., NGN to CNY to pay Chinese suppliers).
- **Live Rates**: View the current platform buy/sell rates.
- **Exchange Form**: Input amount to convert, upload proof of payment, specify receiving account details (e.g., Alipay, WeChat Pay, or Bank Account).

### 3.6 Local Delivery (`/customer/delivery`)
- **Dispatch Management**: Arrange for last-mile delivery of goods that have arrived in the destination country.
- **Form Fields**: Select package, input delivery address, choose delivery speed (Standard, Express).

---

## 4. Account & Settings

These features should be grouped under a "Profile" or "Account" tab on mobile.

### 4.1 Profile (`/customer/profile`)
- View and edit personal details (Name, Phone number).
- View their unique Customer ID (used for shipping labels).

### 4.2 Wallet (`/customer/wallet`)
- **Balance Card**: Display current balance in default currency.
- **Fund Wallet**: Options to add money (Bank Transfer, Card, etc.).
- **Transaction History**: A ledger showing all credits and debits (shipping payments, exchange deductions, refunds).

### 4.3 Support Tickets (`/customer/support`)
- **Ticket List**: View all open, pending, and resolved support tickets.
- **Open a Ticket**: A form to submit a new issue (Subject, Category, Related Shipment ID, Description).
- **Ticket Chat**: A chat-like interface to communicate with support agents and upload file attachments (Screenshots, Invoices).

### 4.4 Settings (`/customer/settings`)
- **Notification Preferences**: Toggle Push Notifications, SMS, and Email alerts for shipment updates and financial transactions.
- **Security**: Change password, enable 2FA, manage biometric login settings.

---

## 5. Mobile App UI/UX Recommendations

To ensure a seamless transition from the web portal to the mobile app:

1. **Bottom Tab Navigation**: Use a standard 4-5 tab layout for the most used features.
   - *Home* (Dashboard Overview)
   - *Shipments* (Tracking & Consolidation)
   - *Wallet* (Financials)
   - *Account* (Profile, Settings, Support)
2. **Push Notifications**: Crucial for mobile. Prompt users to enable them so they get real-time alerts when a package arrives at the warehouse or when their consolidation is ready for payment.
3. **Clipboard Interception**: When the user opens the "Buy For Me" tab, the app can check the clipboard for valid URLs (like 1688 or Taobao links) and prompt "Would you like to procure the link you copied?".
4. **Offline Caching**: Cache recent shipment statuses and wallet balances so the app loads instantly even on poor networks.
