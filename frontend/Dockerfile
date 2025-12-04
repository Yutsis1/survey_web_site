# --- deps ---
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- builder ---
FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# guarantee public/ exists even if empty (prevents COPY failures later)
RUN mkdir -p /app/public
RUN npm run build
# Build your app
# e.g. RUN npm run build

# --- runner ---
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# install only prod deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# bring in built artifacts + static assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# minimal config files
COPY next.config.* ./
COPY package.json ./

EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]
