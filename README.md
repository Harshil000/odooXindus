# CoreInventory

A modern multi-warehouse inventory management platform for teams that need real-time stock visibility, controlled warehouse ownership, and operational traceability.

CoreInventory combines:
- A React + Vite frontend for fast, clean operations UI
- A Node.js + Express backend with PostgreSQL
- OTP-based password recovery over SMTP
- JWT-based authentication and role-aware access patterns

## Project Highlights

- Multi-warehouse inventory operations
- Warehouse assignment per user (user-specific warehouse visibility)
- Product, category, stock, receipt, delivery, transfer, and adjustment workflows
- Validation-first backend service layer (business rules + DB constraints)
- OTP-based forgot-password flow using SMTP email delivery
- Session verification with auto-logout on invalid/expired token
- Profile update API with backend validation and secure password hashing

## Tech Stack

### Frontend
- React 18
- Vite 5
- Zustand
- React Router v6
- Axios
- Tailwind CSS
- Lucide React icons

### Backend
- Node.js
- Express 5
- PostgreSQL (pg)
- JWT (jsonwebtoken)
- bcryptjs
- Nodemailer
- CORS + Cookie Parser

## Monorepo Structure

- Backend: Express API server, business logic, PostgreSQL access
- coreinventory: React frontend app

## Feature Overview

### Authentication & Session
- User registration and login
- JWT token issuance
- Session verification endpoint
- Protected endpoints with middleware
- Auto-logout behavior on unauthorized session

### OTP Password Recovery (SMTP)
- Forgot password request sends OTP to email
- OTP verification endpoint
- Password reset endpoint with OTP
- OTP expiry handling (time-bound)

### Warehouse Ownership Model
- User-to-warehouse mapping via user_warehouses
- Warehouses fetched per authenticated user
- User sees only assigned warehouses
- Product/stock visibility scoped by owned warehouses

### Inventory Modules
- Categories CRUD (create, list, delete with checks)
- Products CRUD (including safe delete with linked transaction cleanup)
- Stock tracking per warehouse
- Receipts (incoming)
- Deliveries (outgoing with stock checks)
- Transfers (internal movement with source stock checks)
- Adjustments (count corrections)
- History/dashboard data consumption from operations

## API Inventory

Total API endpoints currently used: 32

### Auth APIs (7)
1. POST /api/auth/register
2. POST /api/auth/login
3. POST /api/auth/forget-password
4. POST /api/auth/verify-otp
5. POST /api/auth/reset-password
6. GET /api/auth/me
7. PUT /api/auth/me

### Inventory APIs (25)
1. POST /api/inventory/warehouses
2. GET /api/inventory/warehouses
3. DELETE /api/inventory/warehouses/:id
4. POST /api/inventory/assign-warehouse
5. GET /api/inventory/user-warehouses
6. POST /api/inventory/categories
7. GET /api/inventory/categories
8. DELETE /api/inventory/categories/:id
9. POST /api/inventory/products
10. GET /api/inventory/products
11. GET /api/inventory/products/sku/:sku
12. DELETE /api/inventory/products/:id
13. POST /api/inventory/stock
14. GET /api/inventory/stock
15. POST /api/inventory/receipts
16. GET /api/inventory/receipts
17. PUT /api/inventory/receipts/:id/validate
18. POST /api/inventory/deliveries
19. GET /api/inventory/deliveries
20. PUT /api/inventory/deliveries/:id/validate
21. POST /api/inventory/transfers
22. GET /api/inventory/transfers
23. PUT /api/inventory/transfers/:id/validate
24. POST /api/inventory/adjustments
25. GET /api/inventory/adjustments

## Data & Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens are signed server-side and validated in middleware
- Protected APIs reject invalid/expired tokens
- Profile update validates name, email format, role, and password policy
- Inventory business rules prevent invalid stock movements

## Quick Start

## 1) Backend setup

From project root:

- cd Backend
- npm install

Create a .env file inside Backend with:

- PGHOST=localhost
- PGPORT=5432
- PGUSER=postgres
- PGPASSWORD=your_password
- PGDATABASE=odoo
- JWT_SECRET_KEY=your_jwt_secret
- FRONTEND_URL=http://localhost:5173
- SMTP_HOST=smtp.gmail.com
- SMTP_PORT=587
- SMTP_SECURE=false
- SMTP_USER=your_email
- SMTP_PASS=your_app_password
- MAIL_FROM=your_email

Run backend:

- npm run dev

Server default:
- http://localhost:3000

## 2) Frontend setup

From project root:

- cd coreinventory
- npm install
- npm run dev

Frontend default:
- http://localhost:5173

## 3) API base path

Frontend calls backend through:
- /api

Configured routes:
- /api/auth/*
- /api/inventory/*

## Environment Variables

### Required for backend
- PGHOST
- PGPORT
- PGUSER
- PGPASSWORD
- PGDATABASE
- JWT_SECRET_KEY

### Required for OTP/SMTP
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASS
- MAIL_FROM

### Optional
- FRONTEND_URL

## Scripts

### Backend
- npm run dev: start API server with nodemon

### Frontend
- npm run dev: run Vite dev server
- npm run build: production build
- npm run preview: preview production build

## Recommended Next Improvements

- Apply auth middleware to all inventory endpoints for full API hardening
- Add pagination/search on list APIs
- Add refresh token flow for longer sessions
- Add audit trail for profile/security changes
- Add unit and integration tests (service and repository layers)
- Add CI pipeline for lint, build, and test gates

## License

This project is currently private/internal. Add your preferred license before public release.
