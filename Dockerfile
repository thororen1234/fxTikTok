FROM oven/bun:slim
WORKDIR /app

COPY package*.json bun.lock ./
RUN bun i

COPY . .
COPY start.sh .

RUN chmod +x start.sh
CMD ["./start.sh"]
