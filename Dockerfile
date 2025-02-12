FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn install --immutable

FROM node:20-alpine AS runner
WORKDIR /app

# 비루트 사용자 설정
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 환경 변수 설정
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 애플리케이션 파일 복사
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.pnp.* ./
COPY --from=deps /app/.yarnrc.yml ./
COPY . .

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"


CMD ["yarn", "start"]
