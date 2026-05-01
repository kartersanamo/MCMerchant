# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
	pnpm config set store-dir /pnpm/store && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=cache,target=/app/.next/cache ./node_modules/.bin/next build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nextjs

COPY --chown=nextjs:nodejs --from=builder /app/public ./public
COPY --chown=nextjs:nodejs --from=builder /app/.next/standalone ./
COPY --chown=nextjs:nodejs --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]