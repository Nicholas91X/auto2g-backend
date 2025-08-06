# ---- Base Stage ----
FROM node:18-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS dependencies
COPY package*.json ./
RUN npm install

# ---- Build Stage ----
FROM dependencies AS build
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Production Stage ----
FROM base AS production
WORKDIR /app
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

VOLUME /app/uploads

CMD ["node", "dist/main.js"]