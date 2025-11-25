FROM node:20-alpine AS base
WORKDIR /app

# Dependencies needed for Prisma engines on Alpine (OpenSSL 3 and CA certs)
RUN apk add --no-cache openssl ca-certificates

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Runtime deps (OpenSSL 3 and CA certs)
RUN apk add --no-cache openssl ca-certificates

COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/dist ./dist

EXPOSE 3333
CMD ["node", "dist/server.js"]

