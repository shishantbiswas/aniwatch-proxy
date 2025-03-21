FROM oven/bun:alpine

WORKDIR /app

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
# ENV CORS_ORIGIN = your lovely domain

RUN bun install
EXPOSE 3000

CMD ["bun", "run", "start"]