# Gearzo — React Native + Node.js Developer Handoff

> **Purpose:** This document is for the developer implementing the Gearzo customer app from the supplied `Gearzo_App_UI_12_Screens.html` mockup. The attached HTML is labelled “25 screens” and the specification below covers all 25 screens.  
> **Frontend:** React Native + TypeScript.  
> **Backend:** Node.js + TypeScript REST API.  
> **Database:** PostgreSQL.  
> **Architecture:** Start with a modular monolith, not microservices.  
> **Important:** The mockup is the source for screen appearance. Requirements marked “recommended” or “confirm” are implementation guidance, not proof that the business rule has already been approved.

## Developer instructions — read before coding

1. Read this complete document and inspect the original HTML mockup before implementation. Use the 25 numbered screens as the acceptance reference.
2. Implement the screen layouts and user interactions, not just static screenshots. Every visible button, selector, input, card, tab, and bottom-navigation item must work or be explicitly disabled with a reason.
3. Keep the React Native UI separate from API/network logic, domain types, and reusable components.
4. The app must not treat mock values as live business data. Prices, taxes, warranty periods, durations, coupons, ETA, product availability, subscription benefits, mechanic identity, and payment status must come from configuration/API or be clearly marked as test fixtures.
5. The backend is authoritative for prices, discounts, tax calculations, booking state transitions, mechanic assignment, payment verification, and refunds. Never trust totals or payment-success flags supplied by the mobile app.
6. Use loading, empty, error, offline, retry, and unavailable states. Do not leave the user on a blank screen if an API fails.
7. Do not store secrets in the mobile app. Keep payment provider secrets, SMS keys, maps secrets intended for server use, and database credentials on the backend.
8. Preserve the Gearzo mockup’s visual direction: white/light-grey surfaces, deep green and bright green accents, rounded cards, clean typography, and accessible touch targets. Use the supplied original brand assets where available; do not redraw the logo.
9. Do not invent product policies to fill gaps. Record unanswered items in the “Decisions required” section and use a clearly labelled temporary configuration only if the product owner approves.
10. Deliver code, environment-variable example, database migrations/seeds, API documentation, automated tests, and setup/run instructions.

## 1. Recommended technology choices

| Area | Recommended implementation |
|---|---|
| Mobile app | React Native with TypeScript |
| Navigation | React Navigation (native stack + bottom tabs) |
| Server state | TanStack Query or equivalent; define cache invalidation after mutations |
| Local UI state | React hooks; use a small state store only if shared state warrants it |
| Forms/validation | React Hook Form + Zod, or one consistent equivalent |
| API client | Typed `fetch` wrapper or Axios, with timeout, auth handling, and normalized errors |
| Backend | Node.js + TypeScript, using NestJS or Express/Fastify consistently |
| API style | REST, versioned under `/api/v1` |
| Database | PostgreSQL with migrations |
| ORM/query layer | Prisma or Drizzle; choose one and commit to it |
| Background jobs | Redis + BullMQ or equivalent only when required for matching, notifications, and expiry jobs |
| File storage | S3-compatible object storage for inspection photos, invoices, and service records |
| Authentication | Short-lived access token + secure refresh/session strategy; use secure device storage on mobile |
| API documentation | OpenAPI/Swagger generated from the backend contracts |
| Testing | Jest/Vitest for unit tests, API integration tests, React Native component tests, and end-to-end tests |
| Delivery | Environment-based configuration, CI checks, linting, formatting, and repeatable deployment |

The exact library choices may be adjusted to match the developer’s existing project, but keep TypeScript types and API contracts consistent across app and server.

## 2. Suggested repository layout

A monorepo is recommended so shared API types and validation schemas can be versioned together.

```text
gearzo/
├── apps/
│   ├── customer-mobile/
│   │   ├── src/
│   │   │   ├── app/                 # app entry, providers, navigation
│   │   │   ├── navigation/          # root stack, tabs, route params
│   │   │   ├── screens/             # screen-level composition
│   │   │   ├── components/          # buttons, cards, fields, sheets
│   │   │   ├── features/
│   │   │   │   ├── vehicles/
│   │   │   │   ├── catalogue/
│   │   │   │   ├── cart/
│   │   │   │   ├── booking/
│   │   │   │   ├── payments/
│   │   │   │   ├── tracking/
│   │   │   │   ├── subscriptions/
│   │   │   │   └── profile/
│   │   │   ├── api/                 # typed API client + endpoint functions
│   │   │   ├── hooks/
│   │   │   ├── theme/               # colours, spacing, typography
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── __tests__/
│   │   └── package.json
│   ├── api/
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── config/
│   │   │   ├── common/              # auth, errors, logging, validation
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── customers/
│   │   │   │   ├── vehicles/
│   │   │   │   ├── catalogue/
│   │   │   │   ├── cart-quotes/
│   │   │   │   ├── availability/
│   │   │   │   ├── bookings/
│   │   │   │   ├── matching/
│   │   │   │   ├── partners/
│   │   │   │   ├── payments/
│   │   │   │   ├── coupons/
│   │   │   │   ├── subscriptions/
│   │   │   │   ├── reviews/
│   │   │   │   ├── notifications/
│   │   │   │   └── admin/
│   │   │   ├── jobs/
│   │   │   └── server.ts
│   │   ├── prisma/ or migrations/
│   │   ├── tests/
│   │   └── package.json
│   └── admin-web/                   # optional later phase; not a substitute for ops tools
├── packages/
│   ├── contracts/                   # shared DTOs/schemas/enums
│   └── config/                      # shared lint/TypeScript config
├── .env.example
├── README.md
└── package.json
```

If separate repositories are required, retain the same logical boundaries and publish/share the API contract rather than copying types manually.

## 3. React Native implementation standards

### App foundation
- Build the root navigation and design tokens before screen-by-screen implementation.
- Use safe-area handling, keyboard avoidance, scrollable content, and responsive sizing for different Android/iOS screen sizes.
- Do not hard-code the 300 × 640 HTML mockup dimensions; reproduce the design proportionally on real devices.
- Reuse `PrimaryButton`, `SecondaryButton`, `TextField`, `VehicleCard`, `ServiceCard`, `PriceRow`, `StatusBadge`, `BottomTabBar`, `BottomSheet`, `EmptyState`, `ErrorState`, and `LoadingState`.
- Use consistent spacing, typography, border radii, elevation, and green/neutral colours based on the mockup.
- Accessibility: readable contrast, labels for icons, screen-reader labels, sensible focus order, and touch targets ideally at least 44–48 dp.
- Prevent duplicate submissions by disabling action buttons while requests are pending.
- Keep forms and sheets keyboard-safe. Support Android hardware back and iOS gestures without losing saved cart/booking data unexpectedly.

### State ownership
- **Server-owned state:** vehicles persisted to account, catalogue, service prices, slots, quote, booking, payment status, mechanic status, subscriptions, reviews.
- **Local UI state:** open sheet, selected tab, form draft, transient filters, animation state.
- Persist a cart draft only if product owner approves and ensure it is revalidated by the server before checkout.
- After booking/payment changes, invalidate/refetch relevant queries so Home, My Bookings, and tracking cannot show stale status.
- Use a single source of truth for booking status; do not maintain separate conflicting status values in multiple screens.

### Navigation proposal
- Bottom tabs visible in the mockup: **Home**, **Bookings**, **Plans**, **Profile**.
- Stack screens/modals: Add Vehicle; Mechanic/Service category; Service Details; Product/Add-on sheets; Checkout; Select Slot; Payment Method; Payment Result; Finding Mechanic; Assigned/On-the-way/Arrived; Service in Progress; Completion/Rating.
- Pass stable IDs in route params (`vehicleId`, `serviceId`, `bookingId`), not entire mutable objects.
- When opening a booking from My Bookings, route according to its current backend state.
- Handle app restart/deep link into a booking safely after authentication.

### API client behaviour
- Use a single configured API base URL by environment.
- Add request correlation IDs where practical; normalize server errors to a consistent client shape.
- Handle `401` refresh/logout, `403`, validation `400/422`, conflict `409`, rate-limit `429`, server `5xx`, timeout, and offline errors.
- Use request cancellation for search/navigation where appropriate.
- Avoid retrying non-idempotent payment/booking requests blindly. Use idempotency keys for create booking and payment initiation.

## 4. Node.js backend standards

### Module boundaries
- **Auth/customers:** identity, sessions, profile, consent.
- **Vehicles:** customer-owned vehicle records and validation.
- **Catalogue:** vehicle type, services, packages, repairs, add-ons, products, durations, eligibility.
- **Quote/cart:** authoritative item pricing, discounts, tax, fees, quote expiry.
- **Availability:** service area, date/slot capacity, partner availability.
- **Bookings:** booking creation, cancellation, rescheduling, state transitions.
- **Matching:** partner eligibility, service capability, service radius, acceptance timeout and re-dispatch.
- **Partners:** partner/mechanic profiles, service status updates, inspection evidence, OTP verification.
- **Payments:** payment initiation, provider callbacks/webhooks, reconciliation, refunds.
- **After-service:** completion, invoice, review, service history, warranty claim.
- **Subscriptions:** plan catalogue, eligibility, purchase, renewal/expiry if supported.
- **Notifications:** SMS/push/email templates and delivery logs.
- **Admin/operations:** manual reassignment, cancellations, refund review, disputes, catalogue management, audit trail.

### Backend rules
- Validate every request at the boundary. Reject unknown/invalid fields where appropriate.
- Apply authentication and role-based authorization on every protected endpoint.
- Calculate all amounts on the server using integer paise (or a decimal-safe money type); never use floating-point arithmetic for money.
- Persist booking and payment changes transactionally where possible.
- Verify payment provider signatures on server-side webhooks. A mobile “success” callback alone is not proof of payment.
- Use idempotency keys and unique provider references to prevent duplicate bookings/charges.
- Make booking status transitions explicit and reject invalid transitions.
- Log operational actions and status transitions without logging passwords, OTPs, access tokens, payment secrets, or unnecessary personal data.
- Use rate limits for OTP/authentication, coupon checks, booking creation, and payment endpoints.
- Store images/documents in object storage and persist object keys/metadata in PostgreSQL; avoid large binary blobs in ordinary relational rows.
- Add database constraints/indexes for ownership, unique provider IDs, booking references, and common query paths.
- Never return internal partner/customer information to the wrong role.

## 5. Shared API contract conventions

Base path: `/api/v1`

Successful response convention (one consistent shape throughout the project):

```json
{
  "data": {},
  "meta": {
    "requestId": "server-generated-request-id"
  }
}
```

Error response convention:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the submitted details.",
    "details": [],
    "requestId": "server-generated-request-id"
  }
}
```

Paginated list convention:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "requestId": "server-generated-request-id"
  }
}
```

Use ISO 8601 timestamps in UTC in API responses and store them consistently. Render dates/times in the user's local timezone. Slot endpoints must return the timezone explicitly (for example, `Asia/Kolkata`) and indicate whether the slot is still bookable.

### Core endpoint proposal

These are proposed API capabilities, not existing live endpoints. Final paths may change, but all required capabilities must be covered.

| Capability | Method and endpoint | Purpose |
|---|---|---|
| Current customer | `GET /me` | Get profile and account state |
| Update profile | `PATCH /me` | Update editable profile fields |
| List vehicles | `GET /vehicles` | List the customer's vehicles |
| Create vehicle | `POST /vehicles` | Save vehicle details |
| Update/delete vehicle | `PATCH/DELETE /vehicles/:vehicleId` | Maintain vehicle records subject to booking constraints |
| Home data | `GET /home` | Return service categories, banners and eligible vehicle context |
| Service catalogue | `GET /catalogue?vehicleType=...` | Return service packages and repair categories |
| Service details | `GET /services/:serviceId` | Return description, price rules, duration and eligibility |
| Products/add-ons | `GET /products?serviceId=...` | Return compatible add-ons and required products |
| Quote | `POST /quotes` | Calculate authoritative itemized quote |
| Validate coupon | `POST /coupons/validate` | Validate coupon against quote and eligibility |
| Available slots | `GET /availability?date=...&vehicleType=...` | Return available bookable slots |
| Create booking | `POST /bookings` | Create booking from quote, vehicle and slot |
| Booking list | `GET /bookings?status=...` | My Bookings list |
| Booking detail | `GET /bookings/:bookingId` | Current status and timeline |
| Cancel booking | `POST /bookings/:bookingId/cancel` | Apply cancellation policy |
| Reschedule booking | `POST /bookings/:bookingId/reschedule` | Apply rescheduling rules |
| Start payment | `POST /bookings/:bookingId/payment-intent` | Initiate payment with provider |
| Payment status | `GET /payments/:paymentId` | Fetch server-verified payment state |
| Payment webhook | `POST /webhooks/payments/:provider` | Verify provider event and update payment |
| Mechanic tracking | `GET /bookings/:bookingId/tracking` | Assignment, ETA, status and permitted location |
| Arrival OTP verify | `POST /bookings/:bookingId/arrival/verify` | Verify arrival/vehicle handover OTP |
| Inspection proposal | `POST /bookings/:bookingId/inspection` | Record inspection and additional-work estimate |
| Approve/reject extra work | `POST /bookings/:bookingId/inspection-decision` | Explicit customer consent |
| Complete service | Partner-only endpoint | Mark completion and attach evidence/invoice |
| Submit review | `POST /bookings/:bookingId/review` | Rating and feedback |
| Subscription plans | `GET /subscription-plans` | List plan terms |
| Subscription purchase | `POST /subscriptions` | Purchase only after approved payment flow |
| Notifications | `GET /notifications` | Optional in-app notification history |

Authentication endpoints, partner APIs, admin APIs, upload-signing endpoints and health/readiness endpoints must also be defined in the OpenAPI spec.

## 6. Suggested core data entities

Use UUIDs or another consistent non-guessable identifier strategy. The following is a conceptual model; the developer must turn it into migrations and document any deviations.

- `users`: id, phone/email, display name, role/account status, timestamps.
- `auth_sessions` or provider-linked identity records: session/refresh metadata; store credentials safely.
- `customer_profiles`: user id, contact and preferences.
- `vehicles`: id, customer id, vehicle type, make, model, variant, registration number if required, year, fuel type, odometer if collected, active flag.
- `service_categories`: id, title, vehicle type, display order, active flag.
- `services`: id, category id, name, description, base price, duration, eligibility, active flag.
- `service_packages`: package composition, price rule, vehicle/service compatibility.
- `products`: id, name, SKU, price, discount rule, inventory/availability if managed.
- `service_product_rules`: service/product relationship, required vs optional, compatibility, customer-supplied policy.
- `quotes`: id, customer id, vehicle id, currency, subtotal, discounts, tax, fees, total, expiry, status.
- `quote_items`: quote id, service/product reference, quantity, unit price, discount/tax snapshots, line total.
- `coupons`: code, validity window, usage limits, eligibility, discount type/value/cap.
- `slots` or availability rules: service area, partner capacity, start/end, timezone, booking limit.
- `bookings`: id, human-readable booking reference, customer, vehicle, quote snapshot, slot, address, service mode, status, timestamps.
- `booking_items`: immutable service/product/price snapshot for that booking.
- `booking_events`: from/to status, actor, timestamp, reason and safe metadata.
- `partners` and `partner_services`: partner/garage identity, coverage, skills, status, service area.
- `booking_assignments`: booking, partner, offered/accepted/rejected/expired status and timestamps.
- `payments`: booking, provider, provider reference, amount, status, idempotency key.
- `refunds`: payment, amount, reason, provider reference, status.
- `inspection_reports` and `additional_work_requests`: evidence, recommended work, quoted amount, customer decision and timestamps.
- `vehicle_handover_records`: condition photos, OTP verification event, custody party, time, notes.
- `invoices`: booking, item/tax breakdown, invoice number, file key, issue time.
- `reviews`: booking, customer, rating, comment, moderation state.
- `warranty_policies` and `warranty_claims`: eligible service/part, duration, exclusions, claim status.
- `subscription_plans` and `subscriptions`: terms/version, price, benefits, validity and payment state.
- `notifications`: user, channel, template, delivery status, provider reference.
- `audit_logs`: actor, action, target, timestamp, safe metadata.

### Critical data rules
- Store booking-time price/service/tax snapshots so catalogue changes do not rewrite past invoices.
- Use foreign keys and transaction boundaries. Do not delete a vehicle or user record in a way that breaks historical bookings.
- Avoid storing raw card/bank credentials. Use the payment provider’s tokenized flow.
- Define retention and deletion rules for registration numbers, addresses, photos, and documents before production.
- Model “service completed” separately from “payment captured” and “warranty active”; these are not interchangeable states.

## 7. Booking and payment flow — implement as a state machine

A suggested booking state flow is:

`DRAFT → QUOTED → SLOT_SELECTED → BOOKING_PENDING_PAYMENT → CONFIRMED → FINDING_PARTNER → PARTNER_ASSIGNED → PARTNER_EN_ROUTE → PARTNER_ARRIVED → VEHICLE_RECEIVED/WORK_STARTED → INSPECTION_PENDING (if needed) → WORK_IN_PROGRESS → SERVICE_COMPLETED → CLOSED`

Terminal/exception states should include `PAYMENT_FAILED`, `CANCELLED`, `NO_PARTNER_AVAILABLE`, `EXPIRED`, `REFUND_PENDING`, `REFUNDED`, and `DISPUTED` as applicable. Do not force every booking through every state; transitions depend on the service mode and approved business rules.

Implementation requirements:
- Define allowed transitions in one backend domain/service layer.
- Record each transition in `booking_events`.
- Use a transaction or safe conditional update to avoid two actors advancing the same booking simultaneously.
- When no partner accepts within the configured window, re-dispatch according to approved policy, then offer a safe fallback (wait, choose another slot, or cancel/refund).
- The customer app should render the state returned by the backend, not infer status from elapsed time.
- For payment failure, let the backend/provider confirm whether a payment is failed, pending, or successful before retrying. Avoid double charges.
- Use idempotency keys for booking/payment initiation and verify provider webhooks.
- Reconcile provider payment state periodically if webhooks are delayed or missed.

## 8. Screen implementation map (all 25 screens)

| # | Screen from mockup | React Native feature/component | Main backend dependency |
|---:|---|---|---|
| 1 | Home | Home screen, vehicle selector, service-category cards, search/promo | `GET /home`, `GET /vehicles` |
| 2 | Add vehicle | Validated vehicle form | `POST /vehicles` |
| 3 | 2-Wheeler — Book a Mechanic | Vehicle-type discovery and repair/service category selection | `GET /catalogue` |
| 4 | 2-Wheeler — Service Packages | Package cards, price/duration/eligibility | `GET /catalogue` |
| 5 | 2-Wheeler — Specific Repair | Repair list, selection and quote/cart handoff | `GET /catalogue`, `GET /services/:id` |
| 6 | 4-Wheeler — Packages | Four-wheeler package discovery | `GET /catalogue` |
| 7 | Service details | Description, included work, price/duration, add-to-booking | `GET /services/:id` |
| 8 | Add-on products sheet | Add/remove optional compatible products | `GET /products` |
| 9 | Product required sheet | Explain mandatory product requirement and customer decision | Product rules/quote API |
| 10 | Checkout | Vehicle/service/cart summary and proceed action | `POST /quotes` |
| 11 | Select slot | Date and time-slot picker | `GET /availability` |
| 12 | Checkout — items and billing | Itemized total, coupon, tax/fees and confirmation | `POST /quotes`, coupon validation |
| 13 | Select payment method | Payment method selection and payment initiation | `POST /payment-intent` |
| 14 | Payment failed | Failure explanation, safe retry/change method | Payment status API |
| 15 | Payment success | Server-verified success and booking reference | Payment + booking detail API |
| 16 | Finding your mechanic | Matching progress, cancel/help policy | Booking detail/tracking |
| 17 | Mechanic assigned | Partner profile and assignment status | Booking detail/tracking |
| 18 | Mechanic on the way | Status/ETA and permitted tracking | Tracking API |
| 19 | Mechanic arrived (OTP) | OTP entry and handover verification | Arrival OTP API |
| 20 | Service in progress | Current work status and inspection/additional-work decisions | Booking/inspection APIs |
| 21 | Service completed and rating | Completion summary, invoice, review | Booking detail, invoice, review API |
| 22 | My Bookings (with orders) | Upcoming/past booking list and status-based actions | `GET /bookings` |
| 23 | My Bookings (empty) | Empty state and browse-services CTA | `GET /bookings` |
| 24 | Subscription plans | Plan comparison and terms | `GET /subscription-plans` |
| 25 | Profile | Profile details, vehicles/settings/help/legal/logout | `GET /me`, `GET /vehicles` |

Each screen's detailed visible content, interactions, notes, and acceptance considerations are documented in the full specification following this handoff.

## 9. Screen-specific behaviours that must not be missed

- **Screen 1:** Vehicle selection must affect compatible services; search and category cards must navigate correctly.
- **Screens 2–6:** Preserve the distinction between two-wheeler and four-wheeler service catalogues. Do not display incompatible packages.
- **Screens 7–9:** Clearly distinguish optional add-ons from required products. Explain whether a customer may provide their own parts; do not silently force a purchase.
- **Screens 10–12:** Quote must be recalculated by the server after cart/coupon/slot changes. Keep a clear itemized breakdown.
- **Screen 13:** Selecting a payment method is not payment success.
- **Screens 14–15:** Use verified payment state; support delayed provider response and safe retry.
- **Screens 16–20:** Tracking screens must be driven by server booking states. Do not show a fake live map or invented ETA if location/ETA integration is not implemented.
- **Screen 19:** OTP is sensitive; rate-limit attempts, expire it, do not log it, and record only verification outcome.
- **Screen 20:** If inspection identifies extra work, pause and request explicit customer approval before charging or doing the extra work.
- **Screen 21:** Make invoice, service history, rating and applicable warranty/support accessible.
- **Screens 22–23:** Include loading/error states and filter/actions based on booking state, not only static examples.
- **Screen 24:** Subscription terms, savings, service limits, renewal and refund terms must be approved and displayed clearly before purchase.
- **Screen 25:** Restrict profile/account actions to the authenticated user and provide logout/account support paths.

## 10. Product rules requiring explicit owner confirmation

The source mockup does not resolve every business rule. Do not guess. Obtain decisions for:
1. Is the displayed ₹299 mechanic booking amount a booking fee, inspection fee, visit fee, or service price? Is it refundable/adjustable?
2. Are listed prices inclusive or exclusive of GST/tax, and what tax treatment applies to each service/product?
3. Screen 12 shows visible line items of ₹299 + ₹299 + ₹199 = ₹797, while the GST row displays ₹121.58 and the total remains ₹797. Resolve this before implementing billing.
4. The mockup contains different warranty labels (including 7 days, 10 days and 4 years). Map each duration to a specific service/part and approved terms. Do not present them as one general warranty.
5. Which products are mandatory, optional, compatible, stocked, or customer-supplied?
6. Which payment methods and payment provider are supported? Is payment collected before service, after service, or split by booking type?
7. Which service modes are supported at launch: mechanic at customer location, garage visit, pickup/drop, towing, or a subset?
8. How are partner radius, acceptance timeout, re-dispatch, partner payout and cancellation handled?
9. What are cancellation, rescheduling, no-show, refund, coupon and subscription rules?
10. What is the actual definition of “service completed,” and when can a booking be rated/closed?
11. What exact profile fields, contact options, permissions, consent, and account deletion flow are required?
12. Which map, SMS/OTP, push-notification, analytics, payment and vehicle-verification providers are selected?

## 11. Security, privacy and production readiness

- Enforce authorization on the backend; hiding a button in the app is not access control.
- Store session tokens in platform-secure storage, not plain AsyncStorage.
- Use TLS/HTTPS, secure environment variables and managed secrets.
- Do not commit `.env`, private keys, provider secrets, production data, or authentication state to Git.
- Validate file upload type, size, authorization and signed URL expiry.
- Rate-limit authentication, OTP, booking, coupon, and payment actions.
- Use server-side payment verification and webhook signature validation.
- Keep audit trails for booking changes, inspection approval, payment/refund, and admin overrides.
- Request location permission only when needed and explain why. Do not claim live tracking unless a location integration is working and consented to.
- Add error monitoring, backend logs, health/readiness checks, backups, database migration strategy and rollback guidance.
- Prepare privacy policy, terms, cancellation/refund terms, warranty terms, consent and data-retention rules before release.

## 12. Required test scenarios

### Core customer flow
1. New customer opens Home with no saved vehicle.
2. Add a two-wheeler; return to Home and verify selection.
3. Browse two-wheeler packages and specific repairs.
4. Open service details, add optional product, and handle a required product.
5. Create quote and verify subtotal, discount, taxes, fees and total.
6. Apply valid, invalid, expired and ineligible coupons.
7. Select a slot; attempt booking after slot capacity has been consumed.
8. Initiate payment; test success, failure, pending and delayed webhook.
9. Verify duplicate taps/retries do not create duplicate bookings or charges.
10. Confirm booking, find/assign partner, display current state and ETA only when available.
11. Enter correct, incorrect, expired and rate-limited arrival OTP.
12. Submit inspection proposal; approve and reject extra work; ensure no unapproved extra charge.
13. Complete service, display invoice, submit rating once, and view history.
14. Open My Bookings with data, without data, with API error, and after app restart.
15. Review subscription terms and test purchase only if subscriptions are enabled.
16. Update profile and verify account ownership.

### Reliability and security
- API timeout/offline recovery, app background/foreground, force close/reopen, expired session and re-authentication.
- Wrong-user booking/vehicle access attempts must return authorization errors.
- Tampered amount/discount/booking status from the client must be ignored or rejected.
- Payment webhook replay and duplicate booking requests must be idempotent.
- Race condition: customer cancellation versus partner acceptance; two partner acceptances; slot contention.
- Accessibility, Android back button, keyboard overlap, small screens, slow network and large text.
- Test supported Android/iOS versions and real devices, not only a simulator.

## 13. Delivery plan and developer outputs

### Phase 0 — Foundation
- Confirm open product decisions.
- Set up repo, TypeScript, lint/format, environment files and CI.
- Implement theme, reusable UI components, navigation, API client, auth/session handling.
- Produce an OpenAPI draft and initial database ERD.

### Phase 1 — Catalogue and vehicle setup
- Screens 1–7 and vehicle/catalogue APIs.
- Implement fixture data only behind a development seed/configuration boundary.
- Add component and API integration tests.

### Phase 2 — Cart, quote, slot and payment
- Screens 8–15, quote calculation, coupon validation, availability and payment provider integration.
- Add idempotency, payment reconciliation, and billing tests before enabling real payments.

### Phase 3 — Booking lifecycle
- Screens 16–23, backend state machine, partner matching/status APIs, OTP, inspection approval, invoice and reviews.
- Use test partner accounts and test notifications before production.

### Phase 4 — Plans, profile and release hardening
- Screens 24–25, subscription purchase only if business rules/provider are approved.
- Security review, analytics, monitoring, privacy/legal content, device testing and staged release.

### Required handover package
- Source code and Git repository access.
- README with exact install, environment setup, run, build and deploy steps.
- `.env.example` with names only and no secrets.
- Database schema/ERD, migrations, seed data and rollback instructions.
- OpenAPI/Swagger documentation and example requests/responses.
- Automated test suite and test execution report.
- List of third-party accounts/keys needed, with ownership and setup instructions (never send secrets through source code).
- Known issues, assumptions, unfinished screens, and product decisions still pending.
- Android/iOS build and release instructions, if both platforms are in scope.

## 14. Definition of done

A screen is complete only when:
- It matches the supplied mockup closely and adapts to real device dimensions.
- All visible controls work and have loading/disabled/error states.
- API data is typed, validated and rendered safely.
- Empty, offline, retry and failure states are implemented where relevant.
- Navigation and Android/iOS back behaviour are correct.
- Money/status decisions are server-authoritative.
- Accessibility and responsive behaviour have been checked.
- Tests cover the main path and important failure paths.
- The developer has documented any deviation from the mockup or this specification.

---

# Full screen-by-screen source review

The remainder of this document is the detailed screen-by-screen specification prepared from the supplied 25-screen HTML mockup. It includes screen-specific visible content, interaction notes, required end-to-end additions, data/API capability checklist, testing, delivery phases and source-specific cautions. Keep it attached to the implementation ticket and refer to it during code review.

---

## 1. Product objective

Gearzo is a vehicle-service marketplace. The customer app should let a customer:

1. Select or add a vehicle.
2. Find a compatible service or repair.
3. Understand what is included and how the price is calculated.
4. Select a service mode, address and appointment slot.
5. Confirm a booking and choose an available payment method.
6. Follow partner assignment and service progress.
7. Review and approve any additional work before it begins.
8. Receive the final invoice, service record and applicable warranty information.
9. Request support, report a problem and book again.

The 25-screen mockup covers the customer-facing path from Home through Profile, including catalogue, cart/checkout, payment, partner assignment, service status, booking history and subscriptions. The product must also include backend and partner/admin workflows; customer UI alone is not enough to operate the marketplace.

## 2. Design and implementation principles

- Retain the current green/white visual direction as the starting point.
- Use consistent typography, spacing, card styles, button hierarchy, icons and navigation.
- Use one clear primary action per screen.
- Keep price, service status, warranty and payment information legible.
- Avoid forcing customers to re-enter data already supplied.
- Preserve booking state when users navigate back or recover from errors.
- Treat loading, empty, unavailable, success, failure and retry states as part of the design.
- Never show a confirmed partner, live ETA, available slot, payment success, warranty or discount unless supported by backend data.
- Avoid hard-coded personal data. The sample “Palam”, phone/email, address, vehicle and registration number must be replaced with the signed-in user's data.
- Localise currency as INR and dates/times for the user's locale. The backend should store timestamps consistently and return a clear local display time.
- Use accessible labels, sufficient contrast, meaningful error messages and comfortable touch targets (approximately 44–48 dp for important actions).

## 3. Roles and system components

### Customer app
Vehicle management, service discovery, booking, checkout, payment, tracking, invoice, service history, subscription management, ratings and support.

### Partner/mechanic app or portal
Partner onboarding and verification, supported vehicle/service types, service area, availability, booking accept/reject, navigation/contact, arrival verification, inspection evidence, estimates, parts/labour, service progress, completion evidence and payout visibility.

### Admin/operations portal
Customer/partner management, catalogue and price configuration, serviceability, partner assignment, booking exceptions, cancellations, refunds, complaints, warranty cases, coupons/subscriptions, audit logs and reporting.

### Backend services
Authentication, customer/vehicle profiles, service catalogue, pricing and tax calculation, availability, booking state machine, partner matching, notifications, payments/refunds, invoices, warranty rules, support cases, subscriptions and audit events.

---

## 4. Navigation and information architecture

### Bottom navigation shown in the mockup
- **Home**
- **Booking**
- **Subscription**
- **Profile**

Define the destination and state restoration for each tab. “Booking” should open booking history/current booking rather than an ambiguous action. The active tab must reflect the current section. Hide or adapt bottom navigation only where a focused checkout/payment flow requires it.

### Suggested core navigation
- Home → Vehicle → Service category → Service details → Cart/Checkout
- Checkout → Service mode/address → Slot → Price summary → Payment/booking confirmation
- Booking confirmation → Finding partner → Partner assigned → En route/arrived → Inspection/approval → In progress → Completed → Invoice/rating
- Home/Profile → My Vehicles
- Booking history → Booking detail → Invoice / Support / Warranty / Rebook
- Subscription → Plan details → Eligibility and terms → Purchase/payment → My subscription

---

## 5. Screen-by-screen requirements

## Screen 1 — Home

**Visible in mockup**
- Greeting and location.
- Search field: “Search service, repair or mechanic…”
- Selected vehicle card, including model and registration identifier.
- First-booking offer (“₹150 OFF”).
- 2-wheeler, 4-wheeler, Washing & Detailing, Shop Now categories.
- “Coming Soon” labels for categories.
- Gearzo care+ promotional card.
- Bottom navigation.

**Development requirements**
- Greeting, address and selected vehicle must come from customer profile/state.
- Vehicle card must support changing the active vehicle and opening vehicle details.
- Search should search supported services, repairs and catalogue items; include no-results and retry states.
- Categories must reflect actual launch availability and location serviceability. Do not route users into unavailable services.
- Promotions must be configured by the backend, with eligibility, validity and terms.
- Keep the primary booking action visually prominent; secondary promotions should not dominate the screen.
- If location permission is denied, allow manual address/pincode selection.
- Analytics: home view, search submitted, category selected, vehicle changed, promotion opened, booking started.

**Acceptance criteria**
- Returning users see their active vehicle or a clear add/select-vehicle state.
- Unavailable categories are clearly labelled and cannot be accidentally booked.
- Search and category actions lead to relevant results, not placeholder pages.

## Screen 2 — Add vehicle

**Visible in mockup**
- A screen labelled “Add vehicle”; the supplied HTML embeds this screen as an image, so its internal form fields are not available as extractable text.

**Development requirements**
- Support vehicle type (2-wheeler/4-wheeler) and the minimum data required to identify service compatibility.
- Suggested fields: registration number (optional where permitted), make, model, year, fuel/variant where relevant, and nickname (optional).
- If registration lookup is integrated, show the returned details and allow correction; handle unavailable/incorrect lookup results.
- Validate required fields inline. Explain why a field is needed.
- Prevent duplicate vehicles where a reliable matching key exists, but allow the user to resolve legitimate shared/family vehicle cases.
- Allow edit, remove and set-as-default actions.
- Do not imply insurance or PUC validity has been verified unless the integration and verification result support it.

**Acceptance criteria**
- User can add a vehicle manually if lookup is unavailable.
- Vehicle data is persisted and appears on Home/Checkout.
- Validation errors preserve entered values.

## Screen 3 — 2-Wheeler: Book a Mechanic

**Visible in mockup**
- Selected 2-wheeler.
- Tabs/categories: Book a Mechanic, Service Packages, Specific Repair.
- “Book A Mechanic” (30 mins, ₹299, 7 Day Guarantee).
- “Check My Vehicle” (60 mins, ₹299).
- “Mechanic Consultation (Via Call)” (15 mins, ₹99).
- View Details actions.

**Development requirements**
- Catalogue entries must be data-driven, vehicle-compatible and available only in supported service areas.
- For “Book a Mechanic”, explain what ₹299 buys (for example, visit/inspection/defined labour) and whether it is credited against later repairs. This rule must be decided and displayed before checkout.
- Explain “Check My Vehicle” scope and deliverable; do not leave the service name ambiguous.
- Explain consultation format, duration, limits and whether it includes a physical visit.
- Show inclusions, exclusions, estimated duration, pricing type and applicable warranty.
- Replace ambiguous “Buy Now” wording for service bookings with “View details”, “Choose service” or “Book service” as appropriate.
- “View Details” must open Screen 7 or a corresponding service detail route.

## Screen 4 — 2-Wheeler: Service Packages

**Visible in mockup**
- General Service (120 mins, ₹349, 10 Day Warranty).
- General Service (With Engine Oil) (120 mins, ₹699, 10 Day Warranty).
- Comprehensive Service (Engine Oil & Air Filter included in visible truncated label; 180 mins, ₹899).
- Recommendation/offer/trending badges are used.

**Development requirements**
- Define every package's inclusions and exclusions, labour, consumables, parts, engine oil grade/quantity where relevant, estimated duration and warranty.
- A “recommended”, “offer” or “trending” badge must be supported by a genuine rule and not be decorative misinformation.
- Clearly distinguish “parts included” from “parts charged separately”.
- Vehicle model/variant compatibility must be checked before allowing add-to-cart.
- Explain that estimates can change after inspection only under the stated approval policy.

## Screen 5 — 2-Wheeler: Specific Repair

**Visible in mockup**
- Repair examples include Chain Lubrication (30 mins, ₹199, 7 Day Warranty), Headlight Bulb Replacement (30 mins, ₹49, 7 Day Warranty), Battery Replacement (30 mins, ₹199 shown for service; product handled in a separate sheet).
- Book a Mechanic / Service Packages / Specific Repair categories.

**Development requirements**
- Distinguish labour/inspection price from part price and total replacement price.
- For diagnosis-dependent repairs, mark the amount as “starting at” or “inspection required” instead of guaranteeing an unverified final price.
- Validate the selected part against the vehicle model.
- Show whether a customer-supplied part is accepted and how that affects warranty.
- Ensure warranty is attached to the exact repair/part and is not inferred from a generic category label.

## Screen 6 — 4-Wheeler: Packages

**Visible in mockup**
- Screen title is “4-Wheeler · Packages”; the screen itself is embedded as an image.

**Development requirements**
- Use the same package information architecture as Screen 4, with car-specific package data.
- Confirm compatibility by make/model/year/variant/fuel where needed.
- Show inclusions, exclusions, parts, labour, duration, price type and warranty.
- Do not reuse two-wheeler products or prices by default.
- Include vehicle-specific consumables/quantities only when supported by catalogue data.

## Screen 7 — Service details

**Visible in mockup**
- Screen title is “Service details”; the screen itself is embedded as an image.

**Development requirements**
- Provide a complete pre-booking detail view:
  - Service name and compatible vehicle.
  - What is included and excluded.
  - Labour/parts breakdown or clear price rule.
  - Estimated duration.
  - Whether inspection is needed.
  - Warranty terms and exclusions.
  - Service mode availability.
  - Cancellation/rescheduling terms.
  - “Choose service” / “Add to booking” action.
- Show the same service and price data used in the cart and checkout.
- If final cost is diagnosis-dependent, explain how the customer approves a revised estimate.

## Screen 8 — Add-on products sheet

**Visible in mockup**
- Bottom sheet for “Book A Mechanic” (30 mins, ₹299).
- Related Products: Brake Fluid DOT 4 (₹100 with ₹200 crossed out / 50% OFF), Engine Oil 4T 20W-40 (₹785), Bike Battery 8Ah (₹2,391).
- Add to Cart actions.
- Cart summary with service/parts/issues counts, price and Checkout/Remove controls.

**Development requirements**
- Recommend only products compatible with the selected vehicle and service.
- Explain whether each item is optional, recommended or required.
- Validate discount reference price and campaign eligibility server-side.
- Show product details: compatibility, quantity, unit, price, availability and applicable warranty.
- Cart totals and counts must update immediately and consistently.
- Prevent accidental duplicate additions and provide quantity/edit/remove controls.
- Do not show unrelated products in the same recommendation list.
- Bottom sheet must be dismissible and preserve the existing cart.

## Screen 9 — Product required sheet

**Visible in mockup**
- Battery Replacement service (30 mins, ₹199).
- Message: “Products must be added.”
- Bike Battery 2 Wheeler (8Ah), ₹2,391, Add action.
- “I have my product” option.
- Cart summary.

**Development requirements**
- Decide and document which services require Gearzo-supplied parts and which allow customer-supplied parts.
- If customer-supplied parts are allowed, validate compatibility and explain warranty limitations before proceeding.
- If not allowed, remove or disable the option and explain why.
- Clarify whether ₹199 is labour only and whether the battery price is additional.
- Recalculate the cart total when the product is added or removed.
- Never let “I have my product” bypass required safety/compatibility checks.

## Screen 10 — Checkout

**Visible in mockup**
- Selected vehicle: Pulsar 220F with registration identifier.
- Booking address and Change action.
- Service type: Doorstep or Pickup-Drop.
- Instant / Schedule options.
- “Fastest Available Mechanic” and estimated arrival of 30–45 minutes.
- Item in order and Pay After Service / Pay Now choices.

**Development requirements**
- Verify serviceability before allowing confirmation.
- Service modes must be operationally distinct:
  - Doorstep: confirm the selected work can be done at the address.
  - Garage service, if supported: show garage and drop-off instructions.
  - Pickup & Drop: show pickup/drop addresses, custody process and relevant terms.
- Only show a live ETA if returned by the matching/dispatch system; otherwise label it as an estimate.
- Explain whether the booking is confirmed before or after payment.
- Display service address, slot, vehicle, selected service and current price summary.
- Require customer acceptance of applicable terms/policies.
- Protect against duplicate taps and duplicate bookings using idempotency.
- Do not request payment twice if the server has already recorded success.

## Screen 11 — Select slot

**Visible in mockup**
- Date picker with Today/Tomorrow and following dates.
- Morning/Afternoon/Evening segments.
- Available slots (example: 9 AM, 10 AM, 11 AM, 12 PM).
- Preference/instruction text area and Save action.

**Development requirements**
- Slots must come from backend availability for the service, location, partner capacity and selected mode.
- Do not hard-code sample dates or times.
- Display unavailable/loading/error states and refresh availability when date/service/address changes.
- Reserve a slot only under an explicit booking policy; show when a slot is held and when the hold expires if applicable.
- Validate instruction length and do not allow instructions to override safety or service limitations.
- Preserve selected date/slot when navigating back where still available.
- Prevent selection of a slot that becomes unavailable during checkout; offer alternatives.

## Screen 12 — Checkout: Items and billing

**Visible in mockup**
- Three entries: Book A Mechanic ₹299, Check My Vehicle ₹299, Battery Replacement ₹199.
- Coupon action.
- Billing Details: “3 x Product” ₹797.00, “Includes GST (18%)” ₹121.58, Total Amount ₹797.00.
- Pay After Service / Pay Now.

**Important source observation**
- The displayed line items add to ₹797 (₹299 + ₹299 + ₹199), but the GST presentation is ambiguous: it shows ₹121.58 as GST while the total remains ₹797. The product must define whether listed prices are tax-inclusive or tax-exclusive and calculate the display consistently.

**Development requirements**
- Backend is the source of truth for item prices, quantity, discounts, taxes, fees and payable total.
- Show separate, clearly named rows for service/labour, parts, pickup/drop or other fees, discount, tax and total.
- Explicitly label “tax included” or “tax added”; never add tax twice.
- Apply coupons only after server validation and display eligibility/discount details.
- Show payment amount and due-now/due-later amount clearly.
- All screens—cart, payment, receipt and invoice—must use the same calculation result.
- When an item is removed or an estimate changes, recalculate and require customer confirmation if the payable amount changes.
- Maintain a pricing breakdown snapshot on the booking for later audit.

## Screen 13 — Select payment method

**Visible in mockup**
- Screen title is “Select payment method”; the screen itself is embedded as an image.

**Development requirements**
- Display only enabled payment methods returned by configuration/payment provider.
- Show the amount due now and any remaining amount due after service.
- Explain Pay Now vs Pay After Service and conditions for each.
- Payment method selection must be explicit; never imply a payment was made merely because a method was selected.
- Handle pending/processing state, provider cancellation, failure and retry.
- Use a trusted payment provider; do not store raw card credentials.
- Verify payment status server-side through provider response/webhook before marking it paid.

## Screen 14 — Payment failed

**Visible in mockup**
- Screen title is “Payment failed”; the screen itself is embedded as an image.

**Development requirements**
- Use a plain-language message without exposing sensitive gateway data.
- Offer Retry and Change payment method.
- Check server/provider status before retrying; a timeout may have succeeded even if the client did not receive confirmation.
- Do not create a second booking or duplicate charge.
- Preserve the cart, slot and booking reference where valid.
- Show support/refund guidance for pending or uncertain payments.

## Screen 15 — Payment success

**Visible in mockup**
- Screen title is “Payment success”; the screen itself is embedded as an image.

**Development requirements**
- Show payment status, amount, transaction/reference ID, booking ID and timestamp.
- Provide View Booking and receipt/invoice actions where available.
- Confirm the booking status separately from payment status; payment success does not by itself guarantee a partner has accepted the job.
- Send an in-app notification and, if configured/consented, an appropriate push/SMS/email confirmation.
- If payment succeeds but booking creation fails, initiate recovery/reconciliation and show a truthful state.

## Screen 16 — Finding your mechanic

**Visible in mockup**
- Screen title is “Finding your mechanic”; the screen itself is embedded as an image.

**Development requirements**
- Show a truthful search/assignment state and booking reference.
- Matching should consider service capability, service area, availability/capacity, quality and distance.
- Show an estimated response window only if the system has a defensible estimate.
- If no partner accepts, retry/expand matching according to operations rules and offer alternatives, reschedule or cancellation/refund as appropriate.
- Do not leave the customer on an indefinite spinner.
- Notify the customer when status changes.

## Screen 17 — Mechanic assigned

**Visible in mockup**
- Screen title is “Mechanic assigned”; the screen itself is embedded as an image.

**Development requirements**
- Show partner name, verified status, relevant experience/skills where verified, rating only if grounded in real reviews, and booking/service details.
- Provide call/chat through a privacy-preserving contact mechanism where possible.
- Display estimated arrival only when available.
- Provide support and cancellation/reschedule options under policy.
- Do not expose unnecessary partner personal information.

## Screen 18 — Mechanic on the way

**Visible in mockup**
- Screen title is “Mechanic on the way”; the screen itself is embedded as an image.

**Development requirements**
- Show accepted/en-route status and the latest ETA or last update.
- Handle ETA changes and delays with transparent messaging.
- Let customer contact support and follow the cancellation policy.
- If location tracking is used, obtain appropriate permissions and show only the necessary information.
- Provide a clear fallback if tracking/ETA is unavailable.

## Screen 19 — Mechanic arrived (OTP)

**Visible in mockup**
- Screen title is “Mechanic arrived (OTP)”; the screen itself is embedded as an image.

**Development requirements**
- Generate a short-lived OTP tied to the correct booking and verify it server-side.
- Explain when to share the OTP. Do not ask for it before the partner has actually arrived.
- Rate-limit attempts and provide a secure support override process.
- Record arrival timestamp and actor.
- For pickup/drop, record vehicle handover details and condition photos before custody changes.
- OTP verification should transition the booking to the next valid state, not mark the repair complete.

## Screen 20 — Service in progress

**Visible in mockup**
- Screen title is “Service in progress”; the screen itself is embedded as an image.

**Development requirements**
- Show status and a useful progress timeline.
- Record initial inspection, condition photos and findings where relevant.
- If extra work is required, show an itemised revised estimate, reason, parts/labour and completion-time impact.
- Require explicit customer approval before paid extra work begins.
- Allow customer to decline extra work and explain what happens next.
- Maintain an audit trail of estimates, approvals, rejections, status changes and evidence.
- Never let a partner silently increase the payable amount.

## Screen 21 — Service completed and rating

**Visible in mockup**
- Screen title is “Service completed and rating”; the screen itself is embedded as an image.

**Development requirements**
- Show completed services, parts used, final price, payment state and completion timestamp.
- Provide final itemised invoice/receipt and service evidence.
- Display applicable warranty duration, coverage, exclusions and start/end dates from configured rules.
- Offer separate rating dimensions if useful (work quality, punctuality, communication); ratings must be optional and abuse-resistant.
- Provide Report a problem / Request warranty support.
- Enable rebooking without copying stale prices or slots.
- Do not mark an unpaid booking as paid simply because service is complete.

## Screen 22 — My Bookings (with orders)

**Visible in mockup**
- Screen title is “My Bookings (with orders)”; the screen itself is embedded as an image.

**Development requirements**
- Show active/upcoming and past bookings with status, service, vehicle, appointment and amount.
- Booking detail should expose tracking when active, reschedule/cancel if allowed, invoice, payment/refund status, warranty/support and rebook.
- Filters must match actual data and use consistent terminology.
- Handle pagination/loading/error/empty states.
- A subscription booking should be identifiable without confusing it with an ordinary booking.
- Do not rely on a screenshot-only view for production behaviour.

## Screen 23 — My Bookings (empty)

**Visible in mockup**
- Booking History; All, Cancelled and Subscription booking tabs.
- Empty state: “No Orders Yet” and a prompt to start with the first service.
- Bottom navigation.

**Development requirements**
- Keep the friendly empty state and add a direct Book a Service action.
- Tabs should be displayed only if their meaning is clear and each filter has a defined dataset.
- If the user has no bookings at all, avoid showing misleading category counts or empty tabs that add no value.
- Distinguish no bookings from loading failure.

## Screen 24 — Subscription plans

**Visible in mockup**
- All Vehicles / All Subscription / My Subscription filters.
- Gearzo care+: 2-wheeler, 1-year validity, 12 General Checkup FREE, starting from ₹950/year.
- Gearzo ultra care: 2-wheeler, 1-year validity, 4 General Service FREE, starting from ₹998/year.
- View Plan Details actions.

**Development requirements**
- Treat plan names, price, benefits, validity and eligibility as backend-configured content.
- Plan detail must explain included service count, what each included service covers, exclusions, vehicle limits, location availability, expiry, usage balance, transferability, renewal and cancellation/refund rules.
- Explain whether parts, consumables, visit fees or taxes are included.
- “Free” must state any conditions and must not hide compulsory charges.
- Show purchase status, remaining entitlements and expiry under My Subscription.
- Prevent double purchase where a plan is already active unless renewal/upgrade rules allow it.
- Do not promote a plan as savings unless the comparison and assumptions are defensible.

## Screen 25 — Profile

**Visible in mockup**
- User name, masked phone and email.
- Saved Address.
- Upcoming Services (marked Coming Soon).
- Your Rewards.
- Order History.
- Settings, Terms & Privacy, Help, Logout.
- Bottom navigation.

**Development requirements**
- Use authenticated profile data and allow permitted contact detail updates with verification.
- Provide Saved Vehicles and Saved Addresses management.
- If Upcoming Services or Rewards are not launched, hide them or label them honestly without broken navigation.
- Settings should cover notification preferences and relevant privacy/security choices.
- Terms & Privacy should open current published documents.
- Help should expose contact/support and case history.
- Logout should confirm only when needed and clear sensitive local session data.
- Provide account deletion/data-request route where required by policy and applicable law.

---

## 6. Required additions to complete the end-to-end product

These flows are important even though they are not clearly represented as dedicated extractable screens in the supplied mockup.

### 6.1 Inspection and additional-work approval
1. Partner records initial condition and inspection findings.
2. Partner adds recommended work, parts and labour.
3. Backend calculates revised estimate.
4. Customer sees original estimate, changes, reason and updated completion time.
5. Customer explicitly approves or declines.
6. Partner can proceed only with approved work.
7. Store an immutable record of the estimate and decision.

### 6.2 Vehicle pickup/drop and custody
- Pickup and drop addresses, customer/driver contacts and scheduled window.
- Partner/driver identity and verification.
- Timestamped vehicle condition photos at pickup and return.
- Odometer/fuel/keys/accessories record where operationally appropriate.
- Handover acknowledgement.
- Clear vehicle custody, damage, accident and insurance responsibility terms agreed with partners.
- Delay, failed pickup and cancellation flows.

### 6.3 Invoice, Service Passport and warranty support
- Permanent service history per vehicle.
- Final invoice and payment status.
- Parts/work performed, service date and evidence.
- Warranty rules specific to service/part.
- Claim creation, photos, case status, support notes and resolution.
- Warranty must not be presented as universal; it depends on the applicable service/part policy.

### 6.4 Cancellations, rescheduling and refunds
- Customer cancellation and partner cancellation.
- Applicable fee and refund amount before confirmation.
- Slot release and partner notification.
- Payment reversal status and reference.
- Alternative slot/partner options where available.
- Admin escalation for exceptions.

### 6.5 Serviceability and unavailable states
- Unsupported PIN code/address.
- Service category unavailable in area.
- No partner available.
- Slot no longer available.
- Product unavailable/incompatible.
- Network error and retry.
- Payment pending/unknown.
- Booking confirmed but assignment pending.
- Service delayed, customer unavailable or partner unable to complete.

---

## 7. Booking state machine

Implement explicit server-side states. The exact state names can be adapted, but the transitions must be controlled.

```text
DRAFT
  -> CART_READY
  -> SLOT_SELECTED (if scheduled)
  -> BOOKING_REQUESTED
  -> PAYMENT_PENDING (when upfront payment applies)
  -> CONFIRMED
  -> MATCHING
  -> PARTNER_ASSIGNED
  -> PARTNER_EN_ROUTE (if applicable)
  -> PARTNER_ARRIVED
  -> INSPECTION
  -> ESTIMATE_AWAITING_CUSTOMER_APPROVAL (if additional work is proposed)
  -> SERVICE_IN_PROGRESS
  -> SERVICE_COMPLETED
  -> PAYMENT_DUE / PAYMENT_PENDING (if not already paid)
  -> PAID
  -> CLOSED
```

Alternative/exception states should include:
- `CANCELLED_BY_CUSTOMER`
- `CANCELLED_BY_PARTNER`
- `NO_PARTNER_AVAILABLE`
- `PAYMENT_FAILED`
- `PAYMENT_UNKNOWN`
- `REFUND_PENDING`
- `REFUNDED`
- `DISPUTE_OPEN`
- `WARRANTY_CASE_OPEN`

Rules:
- Validate every transition on the server.
- Do not allow client-side status changes to be authoritative.
- Store actor, timestamp, reason and relevant evidence for important transitions.
- Payment status and service status are separate dimensions.
- Do not mark a booking as confirmed just because the payment screen was opened.
- Use idempotency keys for booking creation, payment initiation and refund operations.

---

## 8. Core data model

The following is a suggested logical model, not a claim about the existing database.

| Entity | Important fields |
|---|---|
| Customer | `id`, name, verified phone/email, preferences, account status |
| Vehicle | `id`, `customer_id`, type, make, model, year, variant/fuel where relevant, registration identifier if supplied, default flag |
| Address | `id`, `customer_id`, label, address fields, PIN code, coordinates if consented/needed, serviceability result |
| ServiceCategory | `id`, name, vehicle type, active status, supported areas |
| Service | `id`, category, name, description, inclusions, exclusions, duration estimate, pricing type, warranty rule ID, active status |
| Product/Part | `id`, name, SKU, compatibility, unit, price, stock/availability, warranty rule ID |
| ServicePrice | service/part reference, base price, tax configuration, effective dates, location/vehicle constraints |
| Cart | customer, vehicle, selected services/parts, quantities, calculated quote version |
| Booking | customer, vehicle, address, service mode, slot, status, partner, price snapshot, notes |
| BookingLineItem | booking, item reference, description snapshot, quantity, unit price, tax, discount, total |
| EstimateRevision | booking, revision number, line items, reason, total, expiry, created by |
| CustomerApproval | estimate revision, decision, timestamp, customer identity/audit reference |
| Partner | identity/verification status, skills, service area, availability, quality metrics |
| Assignment | booking, partner, offered/accepted/rejected timestamps, response reason |
| InspectionEvidence | booking, type, file reference, timestamp, uploaded by |
| Payment | booking, provider reference, amount, currency, status, idempotency reference |
| Refund | payment, amount, reason, provider reference, status |
| Invoice | booking, invoice number, tax breakdown, final total, issued timestamp, document reference |
| WarrantyRule | eligible item/service, duration, coverage, exclusions, start condition |
| WarrantyCase/SupportCase | booking, category, evidence, status, owner, resolution |
| SubscriptionPlan | plan name, eligibility, benefits, price, validity, terms version |
| CustomerSubscription | customer, vehicle/plan, start/end, entitlements used/remaining, status |
| Notification | customer/partner, event type, channel, delivery status, timestamp |
| AuditEvent | actor, entity, action, previous/new state where appropriate, timestamp |

### Data integrity
- Store a snapshot of item names, descriptions, prices, tax and warranty terms at booking time so later catalogue edits do not rewrite history.
- Keep financial calculations server-side using decimal-safe arithmetic, not binary floating-point totals.
- Apply role-based access to customer, partner and admin data.
- Protect registration numbers, contact details, addresses, photos and payment references.
- Store files in private object storage with scoped, expiring access URLs where appropriate.
- Define retention and deletion policies for personal data and service evidence.

---

## 9. Pricing, tax and coupon rules

The supplied mockup has a visible reconciliation issue on Screen 12: ₹299 + ₹299 + ₹199 = ₹797, but it also shows GST of ₹121.58 while keeping the total at ₹797. The intended tax treatment is not established by the mockup and must be decided with the finance/tax owner.

Required implementation:
1. Each catalogue price defines whether it is tax-inclusive or tax-exclusive.
2. Backend computes line totals, discounts, taxable value, taxes, fees and final total.
3. UI labels tax treatment explicitly.
4. Coupon eligibility, usage limits, expiry and maximum discount are validated server-side.
5. UI receives one authoritative quote with a version/expiry.
6. If a quote expires or changes, the customer reviews the updated amount before confirming.
7. Payment, receipt, refund and invoice use the same financial ledger values.
8. Store currency as INR and use decimal-safe calculations.

Do not hard-code the sample ₹299, ₹349, ₹699, ₹899, ₹99, ₹199, ₹2,391, ₹950/year or ₹998/year values as production prices.

---

## 10. API capability checklist

Exact routes and schemas should be finalized by the engineering team. The following capabilities are required.

### Identity and profile
- Register/login/logout/session refresh.
- Get/update profile.
- Manage vehicles and addresses.
- Verify contact details.

### Discovery and catalogue
- Search services/products.
- List categories for vehicle type and service area.
- Get service/package details and compatible products.
- Check serviceability.
- Get configured offers and subscription plans.

### Cart and quote
- Create/update cart.
- Add/remove/update items.
- Validate compatibility.
- Calculate quote.
- Apply/remove coupon.
- Refresh/confirm quote.

### Availability and booking
- Get available dates/slots.
- Create booking with idempotency key.
- Retrieve booking and history.
- Cancel/reschedule.
- Get booking timeline.
- Submit instructions/preferences.

### Partner operations
- Offer/accept/reject assignment.
- Update en-route/arrival/service status.
- Upload inspection/completion evidence.
- Submit revised estimate.
- Record customer approval/decline.
- Submit work and parts used.

### Payment and finance
- Create payment intent/order.
- Verify payment status.
- Receive provider webhooks.
- Retry safely.
- Create and track refund.
- Retrieve invoice/receipt.

### After-service and subscriptions
- Rate service.
- Open support/warranty case.
- Get service history.
- Get/purchase/manage subscription.
- Check entitlements and usage.

### Notifications
- Booking/payment/assignment/status/estimate approval/refund/warranty events.
- Respect channel preferences and delivery failures.

Every API should define authentication, authorization, validation, error codes, idempotency, pagination where applicable and observability.

---

## 11. Security, privacy and reliability

- Use secure authentication and short-lived access tokens with refresh/session controls appropriate to the stack.
- Enforce authorization on the server for every customer, partner and admin resource.
- Never trust price, tax, discount, payment status or booking status sent by the client.
- Use provider webhooks and server-side verification for payment.
- Rate-limit OTP, login, coupon and sensitive actions.
- Do not log passwords, OTPs, payment secrets or unnecessary personal data.
- Keep secrets and environment credentials outside the app bundle and repository.
- Validate uploaded files and restrict access to vehicle/customer photos.
- Maintain audit logs for estimates, approvals, status changes, refunds and admin actions.
- Use monitoring and alerts for failed payments, unmatched bookings, notification failures and stuck jobs.
- Define backup, recovery and incident-response procedures.

---

## 12. Analytics and product metrics

Track events with a booking ID or anonymous/session identifier as appropriate, while minimising personal data.

### Funnel
- `home_viewed`
- `vehicle_selected`
- `service_category_selected`
- `service_viewed`
- `cart_updated`
- `quote_viewed`
- `slot_selected`
- `booking_submitted`
- `payment_started`
- `payment_succeeded` / `payment_failed`
- `partner_assigned`
- `service_started`
- `estimate_approval_requested`
- `estimate_approved` / `estimate_declined`
- `service_completed`
- `invoice_viewed`
- `support_case_created`
- `booking_rated`
- `rebooking_started`

### Marketplace operations
- Partner acceptance rate and response time.
- Time to assign a partner.
- Booking completion and cancellation rates.
- On-time arrival rate.
- Additional-work approval rate.
- Payment failure and refund rates.
- Complaints/warranty cases per completed booking.
- Repeat booking and customer retention.
- Contribution margin per completed booking.

Define each metric precisely; do not use mock data or unverified ratings in investor/customer-facing dashboards.

---

## 13. Testing strategy

### UI and accessibility
- Small-screen layouts, safe areas, keyboard visibility and scroll behaviour.
- Text scaling, contrast, screen-reader labels and touch targets.
- Empty/loading/error/success/unavailable states.
- Back navigation and state preservation.
- Double taps and slow networks.

### Functional and integration
- Add/edit/remove vehicle.
- Vehicle/service/part compatibility.
- Serviceability and slot availability.
- Cart totals and tax rules.
- Coupons, discounts and expiry.
- Upfront and after-service payment flows.
- Payment provider timeout/webhook races.
- Booking idempotency and duplicate prevention.
- Assignment retries and no-partner outcomes.
- OTP expiry, invalid attempts and correct booking association.
- Estimate revision and explicit approval/decline.
- Completion evidence, invoice and warranty case.
- Cancellation, reschedule, refund and support.
- Subscription purchase, entitlement use and expiry.

### End-to-end scenarios
1. New customer → add vehicle → choose package → schedule → pay → partner accepts → complete service → invoice/rating.
2. Returning customer → saved vehicle/address → fastest available → pay after service → complete and pay.
3. Battery replacement → add compatible battery → revised total → checkout.
4. Inspection identifies extra work → customer declines → partner completes only approved work.
5. Payment times out but provider later reports success → no duplicate charge or booking.
6. No partner available → customer sees alternatives and a clear cancellation/refund path.
7. Pickup & Drop → pickup handover photos → service → return handover → issue report if condition differs.
8. Completed service → warranty claim → support case updates → resolution.
9. Subscription purchase → entitlement validation → eligible booking → entitlement balance updated.
10. Customer cancellation and partner cancellation → correct status, slot release and refund handling.

---

## 14. Suggested delivery phases

### Phase 0 — Resolve product rules
- Define service catalogue, exact inclusions/exclusions and compatibility.
- Define whether each price is fixed, starting-at, labour-only or inspection charge.
- Approve tax/discount rules.
- Approve warranty policy per service/part.
- Define Doorstep, Garage and Pickup & Drop operations.
- Define payment and cancellation/refund rules.
- Confirm partner onboarding and service-area rules.

### Phase 1 — Core marketplace launch
- Screens 1–7: discovery and service selection.
- Screens 8–12: cart, products, checkout, slot and quote.
- Screens 13–15: payment states and confirmation.
- Screens 16–22: assignment, service lifecycle, invoice and booking history.
- Screen 23: useful empty state.
- Screen 25: profile, help, privacy and account controls.
- Partner/admin minimum workflows required to fulfil bookings.

### Phase 2 — Retention and expansion
- Screen 24 subscriptions, after benefit/eligibility rules are final.
- Rewards, advanced service history, reminders and richer rebooking.
- Washing/detailing and spare parts only when operationally available.
- Advanced analytics and optimisation after reliable baseline data exists.

---

## 15. Product decisions required before implementation

Assign an owner and decision date for each item. These points are not conclusively specified by the mockup.

- [ ] Is the ₹299 “Book a Mechanic” charge a visit fee, inspection fee, labour fee or a credit against approved work?
- [ ] What exactly does “Check My Vehicle” include and deliver?
- [ ] Which services have fixed pricing vs inspection-based estimates?
- [ ] Are prices tax-inclusive or tax-exclusive?
- [ ] What is the warranty duration and scope for each service/part? The mockup contains different labels such as 7 days, 10 days and 4 years; these must be mapped to specific eligible items.
- [ ] Are customer-supplied parts accepted, and how does that affect warranty?
- [ ] Which service modes are available at launch and who carries vehicle custody?
- [ ] What is the payment policy for each booking type?
- [ ] What happens if no partner accepts, a partner cancels or the customer is unavailable?
- [ ] What are the cancellation fee, refund and rescheduling rules?
- [ ] Which subscriptions and promotional offers are actually available at launch?
- [ ] Which cities/PIN codes and vehicle categories are supported at launch?

---

## 16. Definition of done

The core customer booking journey is ready for launch only when:

- [ ] All 25 mockup screens have a documented route, purpose and action behaviour.
- [ ] Catalogue content and availability come from configured data.
- [ ] The customer sees a consistent quote from cart through invoice.
- [ ] Tax and discount calculations are verified with the finance/tax owner.
- [ ] Booking and payment states are separate, reliable and idempotent.
- [ ] Partner matching has timeout, retry and no-availability handling.
- [ ] Additional work requires recorded customer approval.
- [ ] Pickup/drop includes documented handover and custody processes if offered.
- [ ] Invoice, service record, warranty information and support are accessible after completion.
- [ ] Cancellation, refund, complaint and warranty flows are tested.
- [ ] Customer/partner/admin permissions are enforced server-side.
- [ ] Critical end-to-end scenarios pass in the target environment.
- [ ] No mock customer data, fake ratings, placeholder ETAs or unverified promises appear in production.
- [ ] Monitoring, support ownership and operational escalation are ready.

---

## Appendix A — Screen inventory from the supplied mockup

1. Home
2. Add vehicle
3. 2-Wheeler · Book a Mechanic
4. 2-Wheeler · Service Packages
5. 2-Wheeler · Specific Repair
6. 4-Wheeler · Packages
7. Service details
8. Add-on products sheet
9. Product required sheet
10. Checkout
11. Select slot
12. Checkout · items and billing
13. Select payment method
14. Payment failed
15. Payment success
16. Finding your mechanic
17. Mechanic assigned
18. Mechanic on the way
19. Mechanic arrived (OTP)
20. Service in progress
21. Service completed and rating
22. My Bookings (with orders)
23. My Bookings (empty)
24. Subscription plans
25. Profile

## Appendix B — Source-specific cautions

- The mockup is a UI reference, not a verified statement of current operational capability.
- Some screens are embedded as images, so their internal fields could not be extracted as text. Screen-specific implementation requirements for those screens are recommendations, not claims about unseen mockup details.
- Visible sample prices, durations, warranties, discounts, ETA, user information, addresses, vehicle details and subscription benefits must be confirmed before production use.
- The visible Screen 12 total/GST presentation is ambiguous and must be resolved before implementation.
- The visual mockup does not itself define API contracts, database schema, partner operations, tax treatment, security controls or legal terms. Those need explicit product and engineering decisions.


---

## Developer sign-off checklist

Before declaring the first release ready, confirm all items below with the product owner:

- [ ] All 25 screens reviewed against `Gearzo_App_UI_12_Screens.html`.
- [ ] All unresolved pricing, tax, warranty, product, payment and service-mode decisions recorded.
- [ ] API contract and database schema reviewed before frontend/backend integration.
- [ ] Booking and payment state machines reviewed, including failure and cancellation paths.
- [ ] No production secret or customer data committed to the repository.
- [ ] The README, `.env.example`, migrations, tests and deployment instructions are included.
- [ ] Any visual or functional deviations from the mockup are documented and approved.
