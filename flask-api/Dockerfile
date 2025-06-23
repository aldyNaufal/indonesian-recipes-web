# ===================================================================
# Flask API Dockerfile (./flask-api/Dockerfile)
# ===================================================================
FROM python:3.9-slim

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy source code
COPY . .

# Environment variables akan diambil dari .env via docker-compose
EXPOSE 5000

CMD ["python", "app.py"]