FROM node:18-alpine

WORKDIR /app

# Install root tooling (concurrently) and app dependencies
COPY package*.json ./
COPY server/package*.json server/
COPY client/package*.json client/

RUN npm ci \
  && npm ci --prefix server \
  && npm ci --prefix client

# Copy application source
COPY . .

ENV PORT=3000 \
    CLIENT_ORIGIN=http://localhost:5173

EXPOSE 3000 5173

CMD ["npm", "run", "dev"]
