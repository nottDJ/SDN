# AI-Driven Predictive Network Traffic Management & Intelligent Routing in SDN

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.18-FF6F00?logo=tensorflow)](https://tensorflow.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com/)

A full-stack, research-grade web application that demonstrates an AI-powered Software Defined Networking (SDN) system capable of:

- **Real-time network monitoring** with live traffic visualization
- **AI-powered congestion prediction** using Random Forest, XGBoost, LSTM, and GRU models
- **Automatic intelligent routing** through an SDN controller
- **Interactive topology visualization** with React Flow
- **Professional dashboard** inspired by Cisco DNA Center

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Next.js Frontend                    │
│  React Flow • Recharts • Framer Motion • Tailwind    │
└──────────────┬───────────────────┬───────────────────┘
               │ REST API          │ WebSocket
┌──────────────▼───────────────────▼───────────────────┐
│                  FastAPI Backend                       │
│  JWT Auth • RBAC • SQLAlchemy • APScheduler           │
├─────────────┬──────────────┬─────────────────────────┤
│  ML Engine  │   Routing    │    Background Tasks      │
│  RF/XGB/    │   Dijkstra   │    Traffic Collector     │
│  LSTM/GRU   │   Load-Bal   │    Prediction Scheduler  │
└──────┬──────┴──────┬───────┴──────┬──────────────────┘
       │             │              │
┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
│ PostgreSQL  │ │  Ryu    │ │  Mininet    │
│ Database    │ │ Controller│ │  + OVS      │
└─────────────┘ └─────────┘ └─────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repo-url> && cd SDN

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up --build
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
SDN/
├── frontend/          # Next.js 15 + React 19 + TypeScript
├── backend/           # FastAPI + SQLAlchemy + ML Engine
├── ryu_controller/    # Custom Ryu SDN Controller App
├── docker-compose.yml # Full-stack orchestration
└── docs/              # Documentation & diagrams
```

## 🔐 Default Credentials

Register a new account through the UI, or use the seed data:
- **Admin**: admin / admin12345
- **Operator**: operator / operator123

## 📊 Features

| Feature | Status |
|---------|--------|
| Dashboard with 12 KPI cards | ✅ |
| Interactive topology (React Flow) | ✅ |
| Live traffic charts (6 metrics) | ✅ |
| AI prediction (RF, XGBoost, LSTM, GRU) | ✅ |
| Intelligent routing engine | ✅ |
| Alert management with severity | ✅ |
| Report generation (PDF/CSV/Excel) | ✅ |
| ML model training UI | ✅ |
| Network simulation controls | ✅ |
| SDN controller management | ✅ |
| JWT authentication + RBAC | ✅ |
| WebSocket real-time updates | ✅ |
| Docker Compose deployment | ✅ |

## 🧠 ML Models

| Model | Type | Best For |
|-------|------|----------|
| Random Forest | Ensemble | Fast training, feature importance |
| XGBoost | Gradient Boosting | High accuracy, tabular data |
| LSTM | Deep Learning | Long-term temporal patterns |
| GRU | Deep Learning | Lighter LSTM alternative |

## 📝 License

This project is developed as a final-year engineering research project.