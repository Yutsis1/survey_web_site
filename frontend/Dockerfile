FROM node:22-trixie-slim AS deps

# layer for packages
WORKDIR /app
COPY package.json package-lock.json ./
# Install ALL deps (incl dev) for building
RUN npm ci

# --- builder ---
FROM node:22-trixie-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Add this line to accept build arg
ARG NEXT_PUBLIC_API_URL
RUN echo "NEXT_PUBLIC_API_URL is $NEXT_PUBLIC_API_URL"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build (Tailwind/PostCSS available here)
RUN npm run build

# --- runner ---
FROM node:22-trixie-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Install only production deps for runtime
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
# Bring in built assets
COPY --from=build /app/.next ./.next
# COPY --from=build /app/public ./public
# COPY --from=build /app/next.config.* ./    
# COPY --from=build /app/package.json ./     
# Expose and run
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]