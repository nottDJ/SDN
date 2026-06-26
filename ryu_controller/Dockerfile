FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 6633 8080

CMD ["ryu-manager", "sdn_controller.py", "ryu.app.ofctl_rest", "--observe-links"]
