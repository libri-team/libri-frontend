# Dockerfile
# 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

# Corepack 설정
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    corepack prepare yarn@4.6.0 --activate

# 소스 파일 복사
COPY . .

# 빌드 시 환경변수 설정
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# 의존성 설치 및 빌드
RUN yarn install --immutable
RUN yarn build

# 프로덕션 스테이지
FROM node:20-alpine

WORKDIR /app

# Corepack 설정
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    corepack prepare yarn@4.6.0 --activate

# 빌드 결과물만 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.yarnrc.yml ./
COPY --from=builder /app/.pnp.* ./
COPY --from=builder /app/.yarn ./.yarn

# 프로덕션 의존성만 설치
RUN yarn install --immutable --production

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
