# ==============================================================================
# Multi-stage Production Dockerfile for SmartNeb
# 
# Stage 1: Builds the React / Vite Single Page Application (Node.js 20 Alpine)
# Stage 2: Packages Django REST Framework, Gunicorn WSGI & Nginx (Python 3.12 Slim)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Frontend Build
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Install dependencies using deterministic lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source code and configuration files
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY src/ ./src/

# Compile static distribution bundle to /app/dist
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Python Runtime with Nginx & Gunicorn
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS runner

# Set non-interactive environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    DJANGO_SETTINGS_MODULE=config.settings \
    PORT=80

WORKDIR /app

# Install Nginx, curl (for healthchecks), and PostgreSQL client libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    curl \
    netcat-traditional \
    libpq5 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application
COPY backend/ ./backend/

# Copy compiled frontend SPA from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Configure Nginx site
COPY nginx.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Copy and prepare entrypoint script (normalizing line endings for Windows hosts)
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN sed -i 's/\r$//' ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh

# Expose web ports:
#   80   -> Standard HTTP production port
#   3000 -> Development parity port
EXPOSE 80 3000

# Container health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Launch entrypoint (runs migrations, seeds demo accounts, starts Gunicorn & Nginx)
ENTRYPOINT ["./docker-entrypoint.sh"]
