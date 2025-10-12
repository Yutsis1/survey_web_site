FROM node:22-bookworm-slim AS deps

# layer for packages
WORKDIR /app
COPY package.json package-lock.json ./
# Install ALL deps (incl dev) for building
RUN npm ci

# --- builder ---
FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build (Tailwind/PostCSS available here)
# No need for NEXT_PUBLIC_API_URL anymore since we use server-side proxy
RUN npm run build

# --- runner ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Accept API_URL as runtime environment variable
ENV API_URL=${API_URL:-http://backend:8000}

# Install only production deps for runtime
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Bring in built assets
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

# Copy configuration files
COPY next.config.* ./
COPY package.json ./

# Expose and run
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]