# GearZo — Local Development & Running Guide

This document provides instructions on how to start, run, and test the GearZo platform locally.

---

## 1. Prerequisites & Database Setup

The project uses Docker for PostgreSQL with the PostGIS extension.

### Check Database Status
```powershell
docker ps --filter "name=gearzo-db"
```

### Start Database Container (if stopped)
```powershell
docker start gearzo-db
```

> **Note on Port Configuration:**
> The Docker container runs on host port **`5433`** (`localhost:5433`) to prevent collisions with any native PostgreSQL running on `5432`.
> Database connection string used across `.env` files:
> ```env
> DATABASE_URL="postgresql://postgres:gearzo_dev_2024@localhost:5433/gearzo?schema=public"
> ```

### Database Sync & Seed (Run once or after resetting)
```powershell
# Push Prisma schema to Postgres
pnpm db:push

# Seed initial data (Admin user, Jurisdictions, Vehicles, Services)
pnpm --filter @gearzo/db exec prisma db seed

# (Optional) Open Prisma Studio database GUI:
pnpm db:studio
# Accessible at http://localhost:5555
```

---

## 2. Running Backend APIs (NestJS)

Open terminal windows in `d:\gearZoApp` for the services you want to run:

### Option A: Run Specific APIs (Recommended for active development)

| Service | Port | Command | Endpoint |
|---|---|---|---|
| **Customer API** | `4001` | `pnpm --filter customer-api dev` | `http://localhost:4001/v1` |
| **Mechanic API** | `4002` | `pnpm --filter mechanic-api dev` | `http://localhost:4002/v1` |
| **Admin API** | `4003` | `pnpm --filter admin-api dev` | `http://localhost:4003/v1` |

### Option B: Run All APIs Concurrently
```powershell
pnpm dev
```

---

## 3. Running Frontend Applications (Expo / React Native)

### A. Run in Web Browser (Fastest for testing)

Open a new terminal in `d:\gearZoApp`:

#### 1. Customer App (Web)
```powershell
pnpm --filter customer web
```
- **URL:** [http://localhost:8081](http://localhost:8081)

#### 2. Mechanic App (Web)
```powershell
pnpm --filter mechanic web
```

#### 3. Admin App (Web)
```powershell
pnpm --filter admin web
```

---

### B. Run on Mobile Device (Android / iOS via Expo Go)

1. Install **Expo Go** on your physical phone:
   - [Android - Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - Apple App Store](https://apps.apple.com/app/expo-go/id982107779)
2. Ensure your phone and development PC are connected to the **same Wi-Fi network**.
3. In `d:\gearZoApp`, start Expo:
   ```powershell
   pnpm --filter customer start
   ```
4. Scan the terminal QR code:
   - **Android:** Scan using the Expo Go app.
   - **iOS:** Scan using the default Camera app.

> **Mobile API Note:** When testing on a physical phone, update `EXPO_PUBLIC_API_URL` in `apps/customer/.env` with your computer's local Wi-Fi IP address (e.g. `http://192.168.1.XX:4001/v1`), because `localhost` refers to the mobile device itself.

---

## 4. Test Credentials & Authentication

### Customer Phone Authentication
- **Phone Number:** Any 10-digit number (e.g., `9876543210`)
- **Mock OTP:** `123456`

### Super Admin Authentication
- **Portal:** Admin App (`apps/admin`)
- **Email:** `superadmin@gearzo.in`
- **Password:** `Admin@123456`

---

## 5. Troubleshooting & Common Issues

### 1. `MIME type ('application/json') is not executable` or Web PostCSS Error
If Metro crashes with a PostCSS or NativeWind error during web bundling:
- In `apps/customer/babel.config.js`, NativeWind is configured conditionally so it skips web bundling (`isWeb ? [] : ['nativewind/babel']`).

### 2. `queryString.stringify is not a function`
- Expo Router requires `query-string` version **7.x** (`^7.1.3`) for CommonJS compatibility. Do not upgrade to v8/v9 ESM.

### 3. Missing Route (404) for `/customer/*`
- Customer API controllers support both direct and prefixed routes (e.g. `/v1/home` and `/v1/customer/home`). Ensure you are targeting port `4001` with prefix `/v1`.

