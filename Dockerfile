FROM oven/bun:alpine

WORKDIR /app

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

RUN bun install
EXPOSE 3000

CMD ["bun", "run", "start"]