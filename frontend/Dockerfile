# --- deps ---
FROM node:22-alpine AS deps

# apply OS security updates to fix known vulnerabilities
RUN apk update && apk upgrade

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- builder ---
FROM node:22-alpine AS builder

# apply OS security updates to fix known vulnerabilities
RUN apk update && apk upgrade

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
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# apply OS security updates to fix known vulnerabilities
RUN apk update && apk upgrade

# install only prod deps
ENV HUSKY=0
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
