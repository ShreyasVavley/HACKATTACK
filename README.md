# Workforce Intelligence Platform (WorkforceIQ)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Vercel Production](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel&logoColor=white)](https://frontend-three-ecru-54.vercel.app)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Enterprise%20Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20SQLAlchemy-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Docker](https://img.shields.io/badge/Deployment-Docker%20Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)

**Workforce Intelligence Platform** (Codename: **WorkforceIQ**) is an enterprise-grade resource planning, staffing, and workforce optimization platform designed for Project Managers, Operations Directors, and Resource Allocation Leads.

🌐 **Live Vercel Frontend**: [https://frontend-three-ecru-54.vercel.app](https://frontend-three-ecru-54.vercel.app)

The system is purposefully built around the three core pillars of modern workforce operations:
1. **Smart Team Formation (Scenario A)** — Multi-factor algorithmic matching balancing candidate skill overlap, experience tenure, and real-time availability with whole-squad combinatorial set coverage.
2. **Workload Balancing (Scenario B)** — Capacity monitoring, burnout threshold detection ($>85\%$), bench talent tracking ($<40\%$), and automated one-click task reallocation shifts.
3. **Skill Gap Analysis & Training** — Automated project competency gap assessment and targeted training module pathways.

---

## 🎨 Enterprise UI & Vertical Left Sidebar Architecture

The platform features an **Enterprise Vertical Left Sidebar** designed specifically for high-density HR and operations management:
- **Persistent Left Navigation**: Single-click access strictly aligned with the core problem statement:
  - **Overview Hub** (`/`)
  - **Smart Team Formation** (`/team-formation` — Scenario A)
  - **Workload Balancing** (`/workload-balancing` — Scenario B)
  - **Skill Gap & Training** (`/skill-gap`)
- **Integrated Actions & Live Engine Sync**: A dedicated `[Create New Record]` trigger and real-time WebSocket connection badge are embedded directly into the sidebar.
- **Disciplined Enterprise Palette**:
  - **Ivory (`#FAF8F5`)**: High-legibility background surfaces and structured cards.
  - **Charcoal Black (`#16171B`)**: Crisp typography, high-contrast borders, headers, and active state indicators.
  - **Scarlet Red (`#DC2626`)**: Primary CTAs, active status badges, match scores, burnout risk tags, and interactive indicators.
- **Enterprise Radii & Elevation**: Clean 8–12px container borders with subtle elevation shadows (`shadow-xs` / `shadow-sm`) replacing heavy claymorphic bubbles.

---

## 🏗️ Architecture & Project Structure

```
├── /backend
│   ├── main.py              # FastAPI app with SQLite/SQLAlchemy models, heuristics, and seed data
│   ├── requirements.txt     # Python backend dependencies (fastapi, uvicorn, sqlalchemy, pydantic)
│   ├── Dockerfile           # Backend container definition
│   └── workforce_iq.db      # SQLite database (auto-seeded with realistic Indian engineers)
├── /frontend
│   ├── app/
│   │   ├── page.tsx                 # Overview Dashboard Hub with live KPI counters and project pipeline
│   │   ├── team-formation/page.tsx  # Scenario A: Team matching with real-time algorithmic scoring
│   │   ├── workload-balancing/page.tsx # Scenario B: Utilization heatmap & one-click task reallocation
│   │   ├── skill-gap/page.tsx       # Module 3: Competency coverage and training course recommendations
│   │   ├── analytics/page.tsx       # Talent directory with mailto actions and baseline-aligned cards
│   │   ├── simulation/page.tsx      # What-If Capacity & Burnout Simulation engine with delta feedback
│   │   ├── layout.tsx               # Root layout integrating the Vertical Left Sidebar
│   │   └── globals.css              # Custom enterprise utility classes and variables
│   ├── components/
│   │   ├── SidebarNavigation.tsx    # Enterprise Vertical Left Sidebar navigation
│   │   ├── RealtimeNotificationCenter.tsx # WebSocket live-sync listener
│   │   └── CreateEntityModal.tsx    # Interactive CRUD modal to add custom employees & projects
│   ├── lib/
│   │   └── api.ts                   # Dynamic API URL resolver (supporting local, Docker, and cloud proxies)
│   ├── package.json                 # Next.js 14, React 18, Tailwind CSS, Lucide icons, Canvas Confetti
│   ├── Dockerfile                   # Multi-stage production frontend Dockerfile
│   └── tailwind.config.js           # Ivory, Charcoal, and Scarlet enterprise palette
├── docker-compose.yml       # One-command full-stack container orchestration
└── README.md
```

---

## ⚡ Core Modules & Problem Scenarios

### 1. Smart Team Formation Engine (Scenario A) — `/team-formation`
- **Algorithmic Scoring Model**:
  $$\text{Match Score} = \left(\frac{\text{Skills Matched}}{\text{Skills Required}} \times 50\right) + (\text{Experience Score} \times 25) + (\text{Availability Score} \times 25)$$
- **Whole-Squad Combinatorial Set Cover**: Rather than selecting isolated high-scorers, the engine ensures the combined squad satisfies 100% of required competencies (e.g. automatically pairing backend specialists with frontend and cloud experts to cover React, Python, and AWS).
- **Hard Burnout Filter**: Candidates with $>85\%$ capacity (e.g. 90% allocation) are disqualified from auto-selection to prevent burnout.
- **Strict Experience Threshold**: Applies a sub-linear penalty to prevent junior engineers from ranking #1 on projects requiring senior tenure.
- **Interactive Methodology Modal**: View the exact scoring formula, component weights, and mathematical derivations via the **"Scoring Methodology"** modal.
- **Hover Micro-Bars**: Interactive visual breakdown showing exact points contributed by Skills, Experience, and Availability.
- **Auto-Resolve Gaps & Inline Swapping**:
  - One-click **"Auto-swap to cover [Skill]"** quick button.
  - Direct **Swap #1**, **Swap #2**, **Swap #3** buttons in the full talent matrix table.
  - Squad card **"Remove"** and bench re-selection.
- **Deployment Lock**: Enforces that critical skill gaps must be resolved before deploying a squad.

### 2. Workload Balancing & Capacity Heatmaps (Scenario B) — `/workload-balancing`
- **Live Utilization Metrics**: Real-time progress bars mapping each specialist's weekly commitments against their 40-hour limit.
- **Automated Health Tagging**:
  - **Burnout Risk (`>85%`)**: Highlighted with warning indicators for immediate attention.
  - **Optimal (`40% – 85%`)**: Healthy balanced workload.
  - **Bench (`<40%`)**: Available capacity ready for assignment.
- **One-Click "Rebalance Hours" Action**: Next to every overallocated specialist, a quick `[Rebalance Hours]` button automatically offloads excess hours to compatible bench talent and mutates SQLite in real-time.
- **Direct Task Reallocation Heuristic**: Pairs overloaded personnel with underutilized peers sharing overlapping technical competencies.

### 3. Automated Skill-Gap Analysis & Training Advisor — `/skill-gap`
- **Competency Coverage Engine**: Compares active project technical demands against organizational talent pool capabilities.
- **Targeted Training Modules**: Curates targeted learning paths (AWS Solutions Architect, Full-Stack React, Spark/Kafka Data Lakehouse, Kubernetes SecOps) with one-click enrollment paths.

### 4. Talent Analytics & Directory — `/analytics`
- **Baseline-Aligned Talent Cards**: Fixed-height competency containers ensure all candidate cards, email triggers, and experience tags align evenly across grid columns.
- **Interactive Email Tooltips**: Clean email action buttons (`mailto:`) with hover tooltips preventing raw string truncation.
- **Search & Filters**: Instant multi-attribute filtering by name, role, skill, and allocation status.
- **One-Click CSV Export**: Instant talent data export for reporting and analysis.

### 5. What-If Capacity & Burnout Simulation — `/simulation`
- **Real-Time Delta Feedback**: Interactive sliders with live recalculation of total weekly hours added (`+[hours]h total capacity load`) and estimated financial impact (`+$[cost] / wk est. cost`).
- **Zero-Risk Modeling**: Evaluates the organizational strain and burnout shift before making any production database mutations.

### 6. Interactive CRUD (`+ Create New Record`)
- Administrators can add a **Brand-New Specialist** or **Custom Project** at any time.
- Integrated WebSocket broadcast (`workforce_iq_live_sync`) immediately triggers live recalculations across all open views without requiring a page refresh.

---

## 🇮🇳 Realistic Indian Talent Dataset

The SQLite database (`backend/workforce_iq.db`) is pre-seeded with authentic engineering profiles across multiple disciplines:
- **Aarav Sharma** — Lead Cloud & DevOps Architect (AWS, Kubernetes, Terraform)
- **Diya Patel** — Senior Full Stack Developer (React, Next.js, Node.js)
- **Arjun Nambiar** — Principal Data & AI Engineer (Python, PyTorch, LangChain, MLOps)
- **Ananya Iyer** — Senior Backend Systems Specialist (Java, Spring Boot, Microservices)
- **Ishaan Mukherjee** — Data Analyst & BI Developer (SQL, Tableau, Data Analytics)
- **Kavya Sundaram** — Cloud Infrastructure Engineer (Cloud Computing, Docker, Python, AWS)
- **Vihaan Reddy** — Full Stack Web Developer (React, TypeScript, Node.js, REST APIs)
- **Aditi Deshmukh** — Distinguished Enterprise Architect (Java, Cloud Computing, System Design)
- **Rohan Verma** — React & Mobile Frontend Developer (React, React Native, JavaScript)
- **Pooja Kulkarni** — Platform Data Pipeline Engineer (Data Analytics, Python, Kafka, Spark)
- **Siddharth Rao** — Cloud Security & SecOps Lead (Security, AWS, Linux, CI/CD)
- **Meera Nair** — Java & Cloud Backend Specialist (Java, Python, Spring Boot, Kubernetes)
- **Kabir Chawla** — Distributed Systems Engineer (Python, Docker, Kubernetes, REST APIs)
- **Tanvi Bhattacharya** — Full Stack & Next.js Engineer (React, Next.js, TypeScript, PostgreSQL)

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- *(Optional)* **Docker & Docker Compose**

---

### Local Development Setup

#### 1. Start Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

#### 2. Start Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

### ☁️ Production Deployment on Vercel
 
The Next.js 14 frontend is pre-configured for instant zero-configuration deployment to [Vercel](https://vercel.com):
 
```bash
cd frontend
vercel --prod
```
 
#### Environment Configuration on Vercel:
When deploying your production backend (e.g. Render, Railway, Fly.io, or AWS EC2), set the following environment variables in your Vercel Project Settings:
- `NEXT_PUBLIC_API_URL`: Your live backend API URL (e.g. `https://api.workforce-iq.internal` or `https://your-backend.railway.app`)
- `NEXT_PUBLIC_WS_URL`: Your live WebSocket stream (e.g. `wss://api.workforce-iq.internal/ws` or `wss://your-backend.railway.app/ws`)
 
---
 
### 🐳 Running with Docker Compose

Deploy the entire stack with a single command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API & Swagger: `http://localhost:8000/docs`

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend and SQLite health status |
| `GET` | `/api/employees` | Fetch all employees with live workload and utilization stats |
| `POST` | `/api/employees` | Create a new employee record (Interactive CRUD) |
| `GET` | `/api/projects` | Fetch all organizational pipeline projects |
| `POST` | `/api/projects` | Create a new project record (Interactive CRUD) |
| `POST` | `/api/match-team` | Algorithmic scoring and squad-level combinatorial recommendations |
| `POST` | `/api/assign-squad` | Dynamic DB allocation (updates hours & status in SQLite) |
| `GET` | `/api/workload-stats` | Global utilization metrics, burnout risks, and bench counts |
| `POST` | `/api/reallocate` | Generate workload balancing suggestions |
| `POST` | `/api/apply-shift` | Apply task shift (mutates employee hours in SQLite) |
| `GET` | `/api/skill-gaps/{project_id}` | Project competency gap analysis and course recommendations |
| `POST` | `/api/simulate-capacity` | What-If workload capacity and burnout simulation |

---

## 📄 License
This project is open-source under the MIT License.
