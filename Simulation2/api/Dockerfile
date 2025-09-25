# backend Dockerfile
FROM python:3.11-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
RUN pip install --no-cache-dir poetry==1.8.3
COPY api/pyproject.toml api/poetry.lock* ./
RUN poetry install --no-root --only main
COPY api/app ./app
COPY agents ./agents
EXPOSE 8000
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
