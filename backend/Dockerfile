FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Environment variables akan diambil dari .env via docker-compose
EXPOSE 3000

CMD ["npm", "start"]