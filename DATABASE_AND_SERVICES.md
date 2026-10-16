# 🗄️ GearZo Database & Services Reference Guide

This document contains everything needed to connect to, inspect, query, and manage the GearZo PostgreSQL database and all running microservices.

---

## 1. Database Connection Parameters

Use these details to connect using **DBeaver**, **TablePlus**, **pgAdmin**, **VS Code PostgreSQL Extension**, or terminal CLI:

| Parameter | Value | Notes |
| :--- | :--- | :--- |
| **Host** | `localhost` or `127.0.0.1` | Local Docker host |
| **Port** | `5433` | Host port mapped to container port 5432 |
| **Database** | `gearzo` | Default application database |
| **User** | `postgres` | Superuser |
| **Password** | `gearzo_dev_2024` | Local dev password |
| **Schema** | `public` | Default Prisma schema |
| **SSL Mode** | `disable` | Not required for local connection |

### Connection Strings
- **Prisma / Standard URL:**
  ```text
  postgresql://postgres:gearzo_dev_2024@localhost:5433/gearzo?schema=public
  ```
- **psql CLI command:**
  ```powershell
  docker exec -it gearzo-db psql -U postgres -d gearzo
  ```

---

## 2. Visual Database Inspection (GUI)

### Option A: Prisma Studio (Zero-Config Web UI)
Run from the root directory (`d:\gearZoApp`):
```powershell
pnpm db:studio
```
Open **[http://localhost:5555](http://localhost:5555)** in your browser. This provides an interactive table editor for all 40+ Prisma models.

### Option B: Third-Party GUI (DBeaver / TablePlus)
1. Create a new **PostgreSQL** connection.
2. Fill in:
   - **Host:** `localhost`
   - **Port:** `5433`
   - **Database:** `gearzo`
   - **Username:** `postgres`
   - **Password:** `gearzo_dev_2024`
3. Click **Test Connection** → **Finish**.

---

## 3. Quick PowerShell Verification Commands

You can run these directly from PowerShell in `d:\gearZoApp` without entering the container:

### Check Database Container Status
```powershell
docker ps --filter "name=gearzo-db"
```

### Start Database Container (if stopped)
```powershell
docker start gearzo-db
```

### View Live Table Row Counts
```powershell
docker exec -i gearzo-db psql -U postgres -d gearzo -c "SELECT 'customers' as tbl, count(*) FROM customers UNION ALL SELECT 'customer_vehicles', count(*) FROM customer_vehicles UNION ALL SELECT 'bookings', count(*) FROM bookings UNION ALL SELECT 'mechanics', count(*) FROM mechanics UNION ALL SELECT 'services', count(*) FROM services UNION ALL SELECT 'jurisdictions', count(*) FROM jurisdictions;"
```

### Inspect Customers (Names, Phones, Emails, Profile State)
```powershell
docker exec -i gearzo-db psql -U postgres -d gearzo -c "SELECT id, phone, name, email, \"profileState\", status FROM customers;"
```

### Inspect Customer Vehicles
```powershell
docker exec -i gearzo-db psql -U postgres -d gearzo -c "SELECT id, \"customerId\", \"registrationNumber\", \"fuelType\", \"isDefault\" FROM customer_vehicles;"
```

### Inspect Bookings & Statuses
```powershell
docker exec -i gearzo-db psql -U postgres -d gearzo -c "SELECT id, code, \"customerId\", status, \"paymentStatus\", \"estimatedTotalPaise\", \"createdAt\" FROM bookings ORDER BY \"createdAt\" DESC LIMIT 10;"
```

### Inspect Mechanics & Onboarding Status
```powershell
docker exec -i gearzo-db psql -U postgres -d gearzo -c "SELECT id, phone, name, \"registrationType\", status FROM mechanics;"
```

---

## 4. Services & Ports Map

| Service Name | Port | Web URL / Endpoint | Health Check Command |
| :--- | :---: | :--- | :--- |
| **PostgreSQL (PostGIS)** | `5433` | `localhost:5433` | `docker exec -i gearzo-db pg_isready -U postgres` |
| **Customer API** | `4001` | `http://localhost:4001/v1` | `curl.exe -s -I http://localhost:4001/v1/customer/app-config` |
| **Customer Web App** | `8081` | `http://localhost:8081` | `curl.exe -s -I http://localhost:8081` |
| **Mechanic API** | `4002` | `http://localhost:4002/v1` | `curl.exe -s -I http://localhost:4002/v1` |
| **Mechanic Web App** | `8082` | `http://localhost:8082` | `curl.exe -s -I http://localhost:8082` |
| **Admin API** | `4003` | `http://localhost:4003/v1` | `curl.exe -s -I http://localhost:4003/v1` |

---

## 5. How to Start Services Individually

Run each command in a separate terminal from `d:\gearZoApp`:

```powershell
# 1. Customer API
pnpm --filter customer-api dev

# 2. Customer Web App
pnpm --filter customer web

# 3. Mechanic API
pnpm --filter mechanic-api dev

# 4. Mechanic Web App (Specified port 8082 avoids collision with customer web)
pnpm --filter mechanic web -- --port 8082
```

---

## 6. Database Migrations & Seeding Commands

```powershell
# Push Prisma schema modifications to Postgres without losing data
pnpm db:push

# Run seed script (Creates Super Admin, Jurisdictions, Brands, Models, Services)
pnpm --filter @gearzo/db exec prisma db seed

# Open Prisma Studio GUI
pnpm db:studio
```

---

## 7. Test Credentials & Demo Accounts

### Customer Web Portal ([http://localhost:8081](http://localhost:8081))
- **Phone:** Any 10-digit mobile number (e.g., `9876543210`)
- **OTP:** `123456` *(Mock OTP mode is active in local dev)*

### Mechanic Partner Portal ([http://localhost:8082](http://localhost:8082))
- **Phone:** Any 10-digit partner mobile number (e.g., `9876543211`)
- **OTP:** `123456` *(Mock OTP mode is active in local dev)*

### Super Admin (Admin API & Portal)
- **Email:** `superadmin@gearzo.in`
- **Password:** `Admin@123456`

