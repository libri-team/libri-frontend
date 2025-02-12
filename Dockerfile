FROM node:20-alpine

WORKDIR /app

# Corepack 설정
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    corepack prepare yarn@4.6.0 --activate

# 필수 파일들만 복사
COPY .yarn ./.yarn
COPY .next ./.next
COPY public ./public
COPY package.json ./
COPY yarn.lock ./
COPY .yarnrc.yml ./
COPY .pnp.* ./

RUN yarn install --frozen-lockfile

# 보안 설정
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

EXPOSE 3000


CMD ["yarn", "start"]
