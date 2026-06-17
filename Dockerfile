FROM node:22-alpine

# Native deps required by tesseract.js
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies (npm workspaces)
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci

# Copy source and build React client
COPY . .
RUN npm run build

# HF Spaces requires port 7860
ENV PORT=7860
ENV NODE_ENV=production
EXPOSE 7860

CMD ["npm", "run", "start"]
