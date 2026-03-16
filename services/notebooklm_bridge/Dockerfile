FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-8080} --workers ${GUNICORN_WORKERS:-1} --worker-class ${GUNICORN_WORKER_CLASS:-sync} --threads ${GUNICORN_THREADS:-2} --timeout ${GUNICORN_TIMEOUT:-110} --graceful-timeout ${GUNICORN_GRACEFUL_TIMEOUT:-20} --keep-alive ${GUNICORN_KEEP_ALIVE:-5} --max-requests ${GUNICORN_MAX_REQUESTS:-200} --max-requests-jitter ${GUNICORN_MAX_REQUESTS_JITTER:-20} app:app"]
