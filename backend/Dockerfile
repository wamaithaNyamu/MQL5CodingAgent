# Use stable Node.js LTS version
FROM node:20

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libvips-dev \
    build-essential \
    python3 \
    python3-pip \
    python3-dev \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
# Copy source files into the image
COPY . .
# Install dependencies
RUN npm i 