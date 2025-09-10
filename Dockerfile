ARG BUN_VERSION=1.2

FROM oven/bun:$BUN_VERSION AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

ARG NODE_ENV
ARG NEXT_PUBLIC_SITE_URL
ARG MICROCMS_SERVICE_DOMAIN
ARG MICROCMS_API_KEY

ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV MICROCMS_SERVICE_DOMAIN=${MICROCMS_SERVICE_DOMAIN}
ENV MICROCMS_API_KEY=${MICROCMS_API_KEY}

RUN bun run build

FROM oven/bun:$BUN_VERSION-distroless

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

CMD [ "server.js" ]
