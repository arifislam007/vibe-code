FROM node:18-bullseye-slim

WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm install --production --silent || npm install --silent

# Copy app
COPY . .

EXPOSE 3000

ENV NODE_ENV=production
CMD ["node","server.js"]
