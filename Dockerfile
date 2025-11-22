FROM oven/bun:latest
WORKDIR /app

COPY package*.json ./
COPY bun.lock ./
RUN bun i
COPY . .
COPY start.sh .

RUN chmod +x start.sh
CMD ["./start.sh"]
