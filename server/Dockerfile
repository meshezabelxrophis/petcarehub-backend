# Multi-stage Dockerfile for Node.js + Python ML backend
FROM node:18-slim

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create symlink for python3 to python
RUN ln -s /usr/bin/python3 /usr/bin/python

# Set environment variables for Python
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy Python requirements
COPY requirements.txt ./

# Create virtual environment and install Python dependencies
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip setuptools wheel && \
    /opt/venv/bin/pip install -r requirements.txt && \
    echo "=== Verifying Python packages ===" && \
    /opt/venv/bin/pip list && \
    echo "=== Testing imports ===" && \
    /opt/venv/bin/python -c "import joblib; print('✅ joblib version:', joblib.__version__)" && \
    /opt/venv/bin/python -c "import sklearn; print('✅ sklearn version:', sklearn.__version__)" && \
    /opt/venv/bin/python -c "import pandas; print('✅ pandas version:', pandas.__version__)"

# Add virtual environment to PATH so python3 uses it
ENV PATH="/opt/venv/bin:$PATH"
ENV VIRTUAL_ENV="/opt/venv"

# Copy ML models
COPY ml_models ./ml_models

# Copy application code
COPY . .

# Expose port
EXPOSE 10000

# Start the application
CMD ["node", "index.js"]

