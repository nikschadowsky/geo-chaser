# Stage 1: Build
FROM node:20-slim AS builder

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /src
COPY package*.json ./
RUN npm install

COPY . .
# Wichtig für dein PostGIS/Prisma Setup
RUN npx prisma generate
RUN npm run build

# Stage 2: Run
FROM node:20-slim

WORKDIR /app
# Nur die gebauten Dateien und die nötigsten Server-Dateien kopieren
COPY --from=builder /src/.output ./.output

COPY --from=builder /src/prisma ./prisma
COPY --from=builder /src/package*.json ./
COPY --from=builder /src/seeding ./seeding

COPY --from=builder /src/node_modules ./node_modules

COPY --from=builder /src/prisma.config.ts ./

# Standardmäßig nutzt Nuxt Port 3000
ENV PORT=3000
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]