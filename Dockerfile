FROM node:18-alpine

WORKDIR /app

# Install root tooling (concurrently) and app dependencies
COPY package*.json ./
COPY online-coding-interview-platform/server/package*.json online-coding-interview-platform/server/
COPY online-coding-interview-platform/client/package*.json online-coding-interview-platform/client/

RUN npm ci \
  && npm ci --prefix online-coding-interview-platform/server \
  && npm ci --prefix online-coding-interview-platform/client

# Copy application source
COPY online-coding-interview-platform online-coding-interview-platform

ENV PORT=3000 \
    CLIENT_ORIGIN=http://localhost:5173

EXPOSE 3000 5173

CMD ["npm", "run", "dev"]
