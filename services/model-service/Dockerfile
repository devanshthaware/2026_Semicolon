FROM python:3.12-slim

WORKDIR /app
COPY services/model-service/requirements.txt .
COPY services/model-service/requirements-ml.txt .
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements-ml.txt
COPY services/model-service/app ./app
COPY artifacts /artifacts

EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
