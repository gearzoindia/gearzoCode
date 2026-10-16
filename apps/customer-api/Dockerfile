# Multi-stage Docker build for GearZo Customer API
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Stage 1: Prune monorepo for customer-api
FROM base AS pruner
RUN pnpm add -g turbo@^2.3.0
COPY . .
RUN turbo prune --scope=customer-api --docker

# Stage 2: Install dependencies
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Stage 3: Build
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=customer-api...

# Stage 4: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4001

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nodejs /app/apps/customer-api/node_modules ./apps/customer-api/node_modules
COPY --from=installer --chown=nestjs:nodejs /app/apps/customer-api/dist ./apps/customer-api/dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/customer-api/package.json ./apps/customer-api/package.json

USER nestjs
EXPOSE 4001

CMD ["node", "apps/customer-api/dist/src/main.js"]
