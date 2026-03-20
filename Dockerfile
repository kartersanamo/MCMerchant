FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Use Corepack to provide pnpm matching the lockfile workflow.
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/emails ./emails
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

CMD ["pnpm", "start"]