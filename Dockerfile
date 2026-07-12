# ── Frontend build ──────────────────────────────────────────────
FROM node:22-alpine AS frontend-build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json .oxlintrc.json ./
COPY public ./public
COPY src ./src
COPY content ./content
COPY scripts ./scripts

RUN npm run build

# ── Server build ───────────────────────────────────────────────
FROM node:22-alpine AS server-build
WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm ci

COPY server/ ./
RUN npm run build

# ── Production ─────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=3001

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=server-build /app/server/dist ./dist
COPY --from=frontend-build /app/dist /app/dist

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
