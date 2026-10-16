# Multi-stage Docker build for GearZo Mechanic API
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Stage 1: Prune monorepo for mechanic-api
FROM base AS pruner
RUN pnpm add -g turbo@^2.3.0
COPY . .
RUN turbo prune --scope=mechanic-api --docker

# Stage 2: Install dependencies
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Stage 3: Build
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=mechanic-api...

# Stage 4: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4002

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nodejs /app/apps/mechanic-api/node_modules ./apps/mechanic-api/node_modules
COPY --from=installer --chown=nestjs:nodejs /app/apps/mechanic-api/dist ./apps/mechanic-api/dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/mechanic-api/package.json ./apps/mechanic-api/package.json

USER nestjs
EXPOSE 4002

CMD ["node", "apps/mechanic-api/dist/src/main.js"]
