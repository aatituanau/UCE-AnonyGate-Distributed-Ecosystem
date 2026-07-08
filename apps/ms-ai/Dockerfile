FROM node:20-alpine AS builder

# This builder stage is just to satisfy the global standard if needed,
# but since this is Python, we don't need a node builder unless we share some assets.
# We will use Python directly for MS-07.

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if required for any python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/

EXPOSE 3007

# Run the FastAPI application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "3007"]
