# Stage 1: Build
FROM node:20-slim AS builder

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

# Standardmäßig nutzt Nuxt Port 3000
ENV PORT=3000
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]