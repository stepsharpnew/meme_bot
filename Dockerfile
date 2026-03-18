FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY shared/ ./shared/
COPY server/ ./server/

CMD ["npx", "ts-node", "server/index.ts"]
