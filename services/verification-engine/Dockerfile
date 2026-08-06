FROM python:3.12-slim

WORKDIR /app
COPY services/verification-engine/requirements.txt .
COPY services/verification-engine/requirements-ml.txt .
RUN pip install --no-cache-dir -r requirements-ml.txt
COPY services/verification-engine/app ./app
COPY artifacts /artifacts

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
