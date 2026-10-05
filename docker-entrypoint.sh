#!/bin/sh
set -e

echo "=========================================="
echo " Starting SmartNeb Unified Healthcare App "
echo "=========================================="

cd /app/backend

# 1. Apply database migrations
echo "==> [1/4] Applying database migrations..."
python manage.py migrate --noinput

# 2. Seed initial demo data (Alex Mercer, Dr. Vance, Elena Rostova, Devices, Telemetry, Regimens)
echo "==> [2/4] Verifying and seeding demo healthcare data..."
python manage.py seed_data

# 3. Collect static files for Django Admin & REST Framework
echo "==> [3/4] Collecting static assets..."
python manage.py collectstatic --noinput

# 4. Start Gunicorn WSGI server for Django REST Framework
echo "==> [4/4] Starting Gunicorn WSGI daemon on 127.0.0.1:8000..."
gunicorn config.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers ${GUNICORN_WORKERS:-3} \
    --threads ${GUNICORN_THREADS:-2} \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - &

GUNICORN_PID=$!

# Trap signals for graceful container termination
trap "echo 'Stopping services...'; kill -TERM $GUNICORN_PID; nginx -s quit; exit 0" SIGINT SIGTERM

echo "==> Starting Nginx frontend proxy on ports 80 and 3000..."
echo "==> App ready: http://localhost:80 or http://localhost:3000"

# Execute Nginx in foreground
nginx -g "daemon off;"
