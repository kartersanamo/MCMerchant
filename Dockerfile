FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY . .
RUN ./node_modules/.bin/next build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY . .

COPY --from=builder /app/.next ./.next

EXPOSE 3000

CMD ["./node_modules/.bin/next", "start"]