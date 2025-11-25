FROM node:20-alpine AS base

# Instalar git caso seja necessário
RUN apk add --no-cache git

WORKDIR /app

# Copiar arquivos de dependências primeiro
COPY package*.json ./
RUN npm ci --only=production=false

# Copiar arquivos de configuração necessários (um por vez para melhor cache)
COPY next.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./

# Copiar código fonte de forma explícita
COPY src/ ./src/
COPY public/ ./public/

# Build
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next

EXPOSE 3000
CMD ["npm", "run", "start"]

