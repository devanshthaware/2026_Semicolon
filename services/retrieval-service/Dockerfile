FROM python:3.12-slim

WORKDIR /app
COPY services/retrieval-service/requirements.txt .
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt
COPY services/retrieval-service/app ./app
COPY data /data

EXPOSE 8002
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
