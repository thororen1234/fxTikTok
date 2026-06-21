FROM oven/bun:1-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json bun.lock ./
RUN if [ -f bun.lock ]; then bun install --frozen-lockfile --production; else bun install --production; fi

COPY . .

RUN chmod +x start.sh
USER bun
EXPOSE 3000 8787

CMD ["./start.sh"]