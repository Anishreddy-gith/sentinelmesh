FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir
COPY . .
RUN mkdir -p checkpoints
EXPOSE 8000 8001
CMD ["python", "gnn/inference_service.py"]
