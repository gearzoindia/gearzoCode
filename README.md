# GearZo — Mechanic in Minutes

> **On-demand vehicle service marketplace** connecting customers with verified mechanics for doorstep servicing, pickup-drop, garage visits, and emergency towing.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK_52-000020?logo=expo)](https://expo.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+PostGIS-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.3-EF4444?logo=turborepo)](https://turbo.build/)

---

## Table of Contents

- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Running the Apps](#running-the-apps)
- [Database](#database)
- [Environment Variables](#environment-variables)
- [API Conventions](#api-conventions)
- [Authentication Flow](#authentication-flow)
- [Booking Lifecycle](#booking-lifecycle)
- [Admin Hierarchy & RBAC](#admin-hierarchy--rbac)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Roadmap](#project-roadmap)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPS                              │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Customer App│  │ Mechanic App │  │  Admin App   │          │
│  │  (Expo/RN)   │  │  (Expo/RN)   │  │  (Expo/RN)   │          │
│  │  iOS+And+Web │  │  Android+Web │  │  iOS+And+Web │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND APIs                              │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ customer-api │  │ mechanic-api │  │  admin-api   │          │
│  │  NestJS:4001 │  │  NestJS:4002 │  │  NestJS:4003 │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────┬────────┴────────┬────────┘                   │
│                  ▼                 ▼                             │
│  ┌─────────────────────────────────────────────────┐            │
│  │            SHARED PACKAGES                       │            │
│  │  db · auth · domain · providers · schemas        │            │
│  │  nest-common · utils · ui · api-client · config  │            │
│  └───────────────────┬─────────────────────────────┘            │
│                      │                                          │
└──────────────────────┼──────────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌────────────┐ ┌─────────┐ ┌──────────┐
   │ PostgreSQL │ │  Redis  │ │ Pusher / │
   │ 16+PostGIS │ │(Upstash)│ │   Ably   │
   └────────────┘ └─────────┘ └──────────┘
```

### Key Rules

- Each app talks **only** to its own API — never cross-call.
- APIs **never call each other** over HTTP. They share data through the database and shared logic in `packages/domain`.
- Business rules (booking state machine, pricing, jurisdiction scope) live **once** in `packages/domain`.
- Database schema lives **only** in `packages/db` (single Prisma schema).

---

## Repository Structure

```
gearzo/
├── apps/
│   ├── customer/                 # Expo — Customer App (iOS, Android, Web)
│   │   ├── app/
│   │   │   ├── (auth)/           # welcome, phone, otp, register
│   │   │   └── (app)/
│   │   │       ├── (tabs)/       # Home, Bookings, Subscription, Profile
│   │   │       ├── booking/      # checkout, payment, tracking, invoice
│   │   │       ├── services/     # catalogue, detail
│   │   │       ├── vehicles/     # add wizard, detail
│   │   │       ├── addresses/    # saved addresses
│   │   │       └── profile/      # edit, settings, rewards, help
│   │   ├── app.config.ts
│   │   └── package.json
│   │
│   ├── mechanic/                 # Expo — Mechanic App (Android, Web)
│   │   ├── app/
│   │   │   ├── (auth)/           # welcome, phone, otp
│   │   │   ├── (onboarding)/     # type, profile, skills, location, kyc, bank
│   │   │   └── (app)/
│   │   │       ├── (tabs)/       # Home, Jobs, Earnings, Profile
│   │   │       ├── job-request/  # incoming offer ring + countdown
│   │   │       └── job/          # navigate, start OTP, work, complete
│   │   └── package.json
│   │
│   ├── admin/                    # Expo — Admin App (iOS, Android, Web)
│   │   ├── app/
│   │   │   ├── (auth)/           # login, otp, totp, invite, password reset
│   │   │   └── (app)/
│   │   │       ├── dashboard     # Live metrics + KPI widgets
│   │   │       ├── bookings/     # List, detail, reassign
│   │   │       ├── mechanics/    # List, KYC queue, document review
│   │   │       ├── customers/    # Search, block/unblock
│   │   │       ├── disputes/     # Thread, resolve, escalate
│   │   │       ├── finance/      # Refunds, payouts, ledger
│   │   │       ├── approvals/    # Maker-checker inbox
│   │   │       ├── admins/       # Invite, manage
│   │   │       ├── reports/      # Aggregated reports + exports
│   │   │       ├── broadcasts/   # Push notifications
│   │   │       ├── super/        # 🔒 SUPER_ADMIN only
│   │   │       │   ├── jurisdictions   # Division → Area polygon editor
│   │   │       │   ├── catalogue       # Service categories & items
│   │   │       │   ├── pricing         # Service × Vehicle × Area matrix
│   │   │       │   ├── commission      # Platform commission rules
│   │   │       │   ├── fees            # Visit, platform, cancellation fees
│   │   │       │   ├── settings        # Security limits, booking rules
│   │   │       │   ├── feature-flags   # Runtime feature toggles
│   │   │       │   └── ...more
│   │   │       └── profile/      # Sessions, 2FA security
│   │   └── package.json
│   │
│   ├── customer-api/             # NestJS — Customer Backend (:4001)
│   │   ├── src/modules/          # auth, profile, vehicles, services,
│   │   │                         # bookings, payments, wallet,
│   │   │                         # subscriptions, addresses, home
│   │   ├── api/index.ts          # Vercel serverless entry
│   │   └── Dockerfile
│   │
│   ├── mechanic-api/             # NestJS — Mechanic Backend (:4002)
│   │   ├── src/modules/          # auth, profile, onboarding, presence,
│   │   │                         # offers, jobs, earnings
│   │   ├── api/index.ts
│   │   └── Dockerfile
│   │
│   └── admin-api/                # NestJS — Admin Backend (:4003)
│       ├── src/modules/          # auth (MFA), dashboard, bookings,
│       │                         # mechanics, customers, disputes,
│       │                         # finance, approvals, admins, reports,
│       │                         # broadcasts, areas, audit, super/
│       ├── api/index.ts
│       └── Dockerfile
│
├── packages/
│   ├── db/                       # Prisma schema (40+ tables), migrations
│   ├── auth/                     # JWT, OTP, sessions, guards, limits, permissions
│   ├── domain/                   # Booking state machine, pricing, jurisdiction scope
│   ├── providers/                # Storage, realtime, push, payments (interface + impl)
│   ├── schemas/                  # Shared Zod schemas + inferred TS types
│   ├── nest-common/              # NestJS filters, interceptors, pipes, errors
│   ├── utils/                    # Phone, money, date, crypto helpers
│   ├── ui/                       # Shared React Native components (NativeWind)
│   ├── api-client/               # Typed axios + TanStack Query hooks + Zustand auth
│   └── config/                   # ESLint, tsconfig, Tailwind presets
│
├── turbo.json                    # Turborepo pipeline config
├── pnpm-workspace.yaml           # pnpm workspace definition
├── package.json                  # Root scripts
├── tsconfig.json                 # Root TypeScript config (strict)
└── .prettierrc                   # Code formatting
```

---

## Tech Stack

### Frontend (all 3 apps)

| Concern          | Choice                                                      |
|------------------|-------------------------------------------------------------|
| Framework        | **React Native + Expo SDK 52**, TypeScript (strict)         |
| Routing          | **Expo Router** (file-based)                                |
| Server state     | **TanStack Query v5**                                       |
| Client state     | **Zustand v5**                                              |
| Forms            | **React Hook Form + Zod** (schemas from `packages/schemas`) |
| Styling          | **NativeWind v2** (Tailwind for RN)                         |
| Maps             | `react-native-maps` + Google Maps JS API                    |
| Push             | `expo-notifications` (FCM / APNs)                           |
| Secure storage   | `expo-secure-store` (native), `httpOnly` cookies (web)      |

### Backend (all 3 APIs)

| Concern          | Choice                                             |
|------------------|----------------------------------------------------|
| Runtime          | **Node.js 20 LTS+**                               |
| Framework        | **NestJS** (modular, DI, guards for RBAC)          |
| ORM              | **Prisma** (single schema in `packages/db`)        |
| Auth             | JWT access + rotating refresh tokens               |
| Rate limiting    | `@nestjs/throttler` + Upstash Redis                |
| File storage     | **Cloudinary** or **AWS S3** (signed URLs)         |
| Real-time        | **Pusher / Ably** (swappable via provider pattern) |
| Payments         | **Razorpay** (mock in dev, real in production)     |
| Logging          | **pino** (structured JSON, no PII)                 |

### Database

| Concern     | Choice                                       |
|-------------|----------------------------------------------|
| Database    | **PostgreSQL 16** + **PostGIS**              |
| Hosting     | **Neon** (serverless, Vercel integration)    |
| Migrations  | **Prisma Migrate**                           |

---

## Prerequisites

- **Node.js** ≥ 20.x
- **pnpm** ≥ 9.x (`npm install -g pnpm`)
- **Docker** (for local PostgreSQL, optional if using Neon)
- **Expo CLI** (`npx expo`)
- **Android Studio** / **Xcode** (for native builds)

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-org/gearzo.git
cd gearzo
pnpm install
```

### 2. Set Up Environment Variables

Copy `.env.example` in each app and fill in your values:

```bash
# Backend APIs
cp apps/customer-api/.env.example apps/customer-api/.env
cp apps/mechanic-api/.env.example apps/mechanic-api/.env
cp apps/admin-api/.env.example apps/admin-api/.env

# Frontend apps
cp apps/customer/.env.example apps/customer/.env
cp apps/mechanic/.env.example apps/mechanic/.env
cp apps/admin/.env.example apps/admin/.env
```

### 3. Set Up Database

```bash
# Option A: Local PostgreSQL with Docker
docker run --name gearzo-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=gearzo \
  -p 5432:5432 -d postgis/postgis:16-3.4

# Option B: Use Neon (update DATABASE_URL in .env files)
```

### 4. Generate Prisma Client & Run Migrations

```bash
pnpm db:generate        # Generate Prisma client
pnpm db:migrate:dev     # Run migrations (creates all 40+ tables)
```

### 5. Seed Super Admin (one-time)

```bash
pnpm --filter admin-api seed:super-admin
```

---

## Running the Apps

### Backend APIs (all 3 concurrently)

```bash
pnpm dev                         # Starts all 3 APIs via Turborepo

# Or individually:
pnpm dev:customer-api            # http://localhost:4001/v1
pnpm dev:mechanic-api            # http://localhost:4002/v1
pnpm dev:admin-api               # http://localhost:4003/v1
```

### Frontend Apps

```bash
pnpm dev:customer                # Customer app (Expo dev server)
pnpm dev:mechanic                # Mechanic app (Expo dev server)
pnpm dev:admin                   # Admin app (Expo dev server)
```

> **Note:** Use **Expo development builds**, not Expo Go (maps, background location, payments need native config).

### Web Builds

```bash
# Export for web (hosted on Vercel)
npx expo export -p web --output-dir dist
```

### Prisma Studio (Database GUI)

```bash
pnpm db:studio                   # Opens at http://localhost:5555
```

---

## Database

### Schema Overview (40+ tables)

The complete schema is in [`packages/db/prisma/schema.prisma`](packages/db/prisma/schema.prisma).

```
AUTH           │ customers, mechanics, admins, otp_requests,
               │ sessions, refresh_tokens, auth_events, system_settings
───────────────┤
CUSTOMER       │ cities, vehicle_brands, vehicle_models, customer_vehicles,
               │ customer_addresses, service_categories, services, package_items,
               │ service_prices, booking_quotes, bookings, booking_slot_holds,
               │ booking_checklist_items, booking_items, booking_events,
               │ payments, refunds, reviews, review_tags, coupons,
               │ coupon_redemptions, subscription_plans, customer_subscriptions,
               │ customer_subscription_usage, booking_issues,
               │ customer_wallet_ledger, payment_policies
───────────────┤
MECHANIC       │ mechanic_profiles, mechanic_vehicle_types, mechanic_services,
               │ mechanic_equipment, mechanic_documents, mechanic_bank_accounts,
               │ mechanic_availability, mechanic_leaves, mechanic_presence,
               │ job_offers, booking_photos, mechanic_ledger, payouts,
               │ customer_ratings, mechanic_background_declarations,
               │ tow_vehicles, incentive_rules
───────────────┤
ADMIN          │ jurisdictions, admin_permission_overrides, admin_invites,
               │ approval_requests, disputes, dispute_messages, payout_runs,
               │ commission_rules, fee_rules, feature_flags, app_versions,
               │ legal_documents, broadcasts, report_exports, audit_logs,
               │ push_tokens
```

### Key Design Decisions

- **Money** is stored in **paise (integer)** — never floating point
- **Phone numbers** in **E.164** format (`+91XXXXXXXXXX`)
- **Timestamps** in **UTC ISO-8601** (displayed in IST on clients)
- **IDs** are **UUIDs** (never sequential integers)
- **Soft deletes** where data must be retained (vehicles, accounts)
- **PostGIS** for geo queries (nearest mechanic, serviceability check)

---

## Environment Variables

### Backend APIs (per API `.env`)

```bash
NODE_ENV=development
PORT=4001                           # 4001 | 4002 | 4003
APP_AUDIENCE=customer               # customer | mechanic | admin
DATABASE_URL=postgresql://...       # Neon pooled URL
DIRECT_URL=postgresql://...         # Neon direct URL (migrations only)
JWT_ACCESS_SECRET=                  # ⚠️ UNIQUE per API — never reuse
CORS_ORIGINS=http://localhost:3000
REDIS_URL=                          # Upstash Redis
OTP_PROVIDER=mock                   # mock | msg91
MOCK_OTP_CODE=123456
OTP_PEPPER=                         # ≥16 chars for OTP hashing
STORAGE_PROVIDER=cloudinary         # cloudinary | s3
REALTIME_PROVIDER=pusher            # pusher | ably
PAYMENT_PROVIDER=mock               # mock | razorpay (customer-api)
SENTRY_DSN=
```

### Frontend Apps (per app `.env`)

```bash
EXPO_PUBLIC_API_URL=http://localhost:4001/v1
EXPO_PUBLIC_GOOGLE_MAPS_KEY=
EXPO_PUBLIC_SENTRY_DSN=
```

> ⚠️ `EXPO_PUBLIC_*` vars are public — **never put secrets here**.

---

## API Conventions

### Base URLs

| API          | Local                        | Production                        |
|--------------|------------------------------|-----------------------------------|
| Customer     | `http://localhost:4001/v1`   | `https://api.gearzo.in/v1`       |
| Mechanic     | `http://localhost:4002/v1`   | `https://mechanic-api.gearzo.in/v1` |
| Admin        | `http://localhost:4003/v1`   | `https://admin-api.gearzo.in/v1` |

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 120, "totalPages": 6 }
}
```

**Error:**
```json
{
  "success": false,
  "error": { "code": "OTP_INVALID_OR_EXPIRED", "message": "Invalid or expired OTP" }
}
```

### Standard Error Codes

| HTTP | Code                      | When                                        |
|------|---------------------------|---------------------------------------------|
| 400  | `VALIDATION_ERROR`        | Bad input                                   |
| 401  | `OTP_INVALID_OR_EXPIRED`  | Wrong/expired/consumed OTP                  |
| 401  | `TOKEN_EXPIRED`           | Access token expired → client refreshes     |
| 401  | `SESSION_REVOKED`         | Refresh token revoked → re-login            |
| 403  | `ACCOUNT_BLOCKED`         | Account suspended/blocked                   |
| 403  | `WRONG_APP`               | Token `aud` doesn't match this API          |
| 429  | `TOO_MANY_REQUESTS`       | Rate limit hit                              |

---

## Authentication Flow

### Customer & Mechanic (OTP Login)

```
Phone → POST /auth/otp/send → OTP sent (mock: 123456)
  → POST /auth/otp/verify → { accessToken, refreshToken, isNewUser }
  → (if new) Optional profile → POST /me/profile or /me/profile/skip
```

### Admin (Multi-Factor)

```
Email+Password → POST /auth/login → { challengeId, next: "OTP" }
  → POST /auth/otp/verify → { challengeId, next: "TOTP" }  (if required)
  → POST /auth/2fa/verify → { accessToken, refreshToken, user }
```

### Token Lifecycle

| Token   | Format        | Lifetime  | Storage (native)    | Storage (web)    |
|---------|---------------|-----------|---------------------|------------------|
| Access  | JWT           | 10–15 min | `expo-secure-store` | Memory only      |
| Refresh | Opaque 256-bit| Sliding   | `expo-secure-store` | `httpOnly` cookie|

---

## Booking Lifecycle

```
REQUESTED → ACCEPTED → EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED
     ↘ CANCELLED (by customer / mechanic / admin)      ↘ DISPUTED
```

The state machine is defined in [`packages/domain/src/booking/booking-state-machine.ts`](packages/domain/src/booking/booking-state-machine.ts) and used by all 3 APIs.

### Smart Dispatch (customer never picks a mechanic)

```
Wave 1:  Top 3 mechanics by score     → 30s timeout
Wave 2:  Next 5, radius +3km          → 30s timeout
Wave 3:  All eligible, max radius     → 60s timeout
Timeout: NO_MECHANIC_FOUND            → retry / schedule / cancel
```

Scoring: ETA (40%) · Rating (20%) · Reliability (15%) · Fairness (15%) · Specialization (10%)

---

## Admin Hierarchy & RBAC

```
SUPER_ADMIN                → entire platform + system config
└── DIVISIONAL_ADMIN       → one Division
    └── SUB_DIVISIONAL_ADMIN → one Sub-Division
        └── AREA_ADMIN       → one Area
```

- Every query is **scoped** to the admin's jurisdiction subtree via `JurisdictionScopeGuard`
- Permissions are code-defined in [`packages/auth/src/permissions.ts`](packages/auth/src/permissions.ts)
- **Maker-checker** on all money actions (refunds, payouts, adjustments)
- Every admin write action → `audit_logs` (append-only, 3-year retention)

---

## Testing

```bash
pnpm test                        # Run all tests (Turborepo)
pnpm --filter customer-api test  # Test specific API
pnpm lint                        # Lint all packages
pnpm typecheck                   # Type-check all packages
```

### Test Strategy

| Layer    | Tool                            | Focus                              |
|----------|---------------------------------|------------------------------------|
| Backend  | Jest + Supertest                | Auth, OTP, bookings, RBAC, scope   |
| Frontend | Jest + RN Testing Library       | Critical component flows           |
| E2E      | Maestro (mobile) + Playwright  | Login → booking → rating flow      |
| Security | Auth tests                      | Cross-API token rejection, lockout |

---

## Deployment

### Vercel (Current — Phase 1–2)

Each API and web app is a separate Vercel project:

| Subdomain                 | Points to            |
|---------------------------|----------------------|
| `api.gearzo.in`           | customer-api         |
| `mechanic-api.gearzo.in`  | mechanic-api         |
| `admin-api.gearzo.in`     | admin-api            |
| `customer.gearzo.in`      | Customer web         |
| `mechanic.gearzo.in`      | Mechanic web         |
| `admin.gearzo.in`         | Admin web            |

### Docker (Phase 3 — GCP/AWS)

Each API has a `Dockerfile` for containerized deployment:

```bash
docker build -t gearzo-customer-api -f apps/customer-api/Dockerfile .
docker build -t gearzo-mechanic-api -f apps/mechanic-api/Dockerfile .
docker build -t gearzo-admin-api -f apps/admin-api/Dockerfile .
```

### Mobile Releases

```bash
# Build with EAS
eas build --platform ios --profile production
eas build --platform android --profile production

# OTA updates
eas update --branch production
```

---

## Project Roadmap

| Phase       | Scope                                                                         |
|-------------|-------------------------------------------------------------------------------|
| **1 – MVP** | Mock OTP login, skippable profile, booking flow, mechanic onboarding & jobs, admin approvals with role hierarchy, push notifications |
| **2**       | Real OTP (MSG91), Razorpay payments & payouts, live tracking, ratings, subscription purchase, rewards |
| **3**       | Migrate APIs to GCP Cloud Run / AWS ECS, admin VPN, Redis queues, analytics dashboards, multi-language |

---

## Team Ownership

| Team               | Owns                                                |
|--------------------|-----------------------------------------------------|
| Customer team      | `apps/customer`, `apps/customer-api`                |
| Mechanic team      | `apps/mechanic`, `apps/mechanic-api`                |
| Admin team         | `apps/admin`, `apps/admin-api`                      |
| Core / tech lead   | `packages/db`, `packages/auth`, `packages/domain`   |
| Shared (2+ reviews)| All other `packages/*`                              |

---

## License

Proprietary — GearZo © 2026. All rights reserved.

