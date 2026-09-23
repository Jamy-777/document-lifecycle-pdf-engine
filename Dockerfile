FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

ENV HOST=0.0.0.0
ENV PORT=3000
ENV DB_FILE_NAME=/app/data/local.db

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["sh", "./docker-entrypoint.sh"]
