FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build arguments from .env
ARG VITE_API_URL
ARG VITE_ML_API_URL
ARG VITE_FLASK_API_URL

# Set environment variables
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_ML_API_URL=${VITE_ML_API_URL}
ENV VITE_FLASK_API_URL=${VITE_FLASK_API_URL}

# Build the app
RUN npm run build

# Serve static files
FROM nginx:alpine
COPY --from=0 /app/docs /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
