# syntax=docker/dockerfile:1.6

# ------------------ deps ------------------
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-constants/package.json ./packages/shared-constants/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ------------------ build ------------------
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app

COPY --from=deps /app /app
COPY apps/backend ./apps/backend
COPY packages ./packages

RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build
RUN pnpm --filter backend deploy --prod /tmp/runtime

# ------------------ runtime ------------------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /tmp/runtime /app
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/prisma ./prisma

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -q -O - http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
