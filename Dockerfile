FROM oven/bun:1-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY . .
RUN if [ -f bun.lock ]; then bun install --frozen-lockfile --production; else bun install --production; fi

USER bun
EXPOSE 3000 8787

CMD ["bun", "run", "src/index.ts"]
