# Multi-stage build untuk optimasi ukuran image
# Stage 1: Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci 
COPY . .
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine
# Copy built files dari builder stage - PERBAIKI INI
# COPY --from=builder /app/dist /usr/share/nginx/html
# atau jika build folder bernama 'build':
COPY --from=builder /app/docs /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]