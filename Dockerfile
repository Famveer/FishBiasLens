FROM python:3.12-slim

WORKDIR /app

COPY visualization/requirements.txt ./visualization/requirements.txt
RUN pip install --no-cache-dir -r visualization/requirements.txt

COPY data ./data
COPY outputs ./outputs
COPY visualization ./visualization

WORKDIR /app/visualization

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "main:app"]
