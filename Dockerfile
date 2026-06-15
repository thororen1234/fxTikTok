FROM oven/bun:1-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY tsconfig.json ./
COPY src ./src

USER bun
EXPOSE 3000 8787

CMD ["bun", "run", "src/index.ts"]
