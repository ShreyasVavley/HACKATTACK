# Workforce Intelligence Platform (WorkforceIQ)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Claymorphic%20Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20SQLAlchemy-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Docker](https://img.shields.io/badge/Deployment-Docker%20Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)

**Workforce Intelligence Platform** (Codename: **WorkforceIQ**) is an enterprise-grade intelligent platform designed for Project Managers, Resource Allocation Managers, and HR Operations Leads. It automates talent-to-project matching with custom mathematical heuristics, monitors real-time workload distributions, detects burnout and bench imbalances, performs what-if capacity simulations, and offers a conversational AI Copilot.

---

## 🎨 UI Aesthetic & Design Philosophy

WorkforceIQ is designed with a tactile **3D Claymorphic** aesthetic using a strict three-color palette:
- **Ivory (`#FAF8F5`)**: Organic background surfaces, clay cards, and tactile inputs.
- **Charcoal Black (`#16171B`)**: Crisp typography, high-contrast borders, headers, and navigation anchors.
- **Scarlet Red (`#DC2626`)**: Primary CTAs, active badges, match percentages, burnout warnings, and interactive accents.

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
│   │   ├── analytics/page.tsx       # Searchable directory with live filters and CSV export
│   │   ├── simulation/page.tsx      # What-If Capacity & Burnout Simulation engine
│   │   ├── copilot/page.tsx         # Natural Language AI Talent & Squad Copilot
│   │   ├── layout.tsx               # Root layout with claymorphic wrappers
│   │   └── globals.css              # Custom claymorphism shadow and card utility classes
│   ├── components/
│   │   ├── Navigation.tsx           # Global navigation bar with quick "+ Add Entity" modal trigger
│   │   └── CreateEntityModal.tsx    # Interactive CRUD modal for judges to add custom employees & projects
│   ├── lib/
│   │   └── api.ts                   # Dynamic API URL resolver (supporting local, Docker, and cloud proxies)
│   ├── package.json                 # Next.js 14, React 18, Tailwind CSS, Lucide icons, Canvas Confetti
│   ├── Dockerfile                   # Multi-stage production frontend Dockerfile
│   └── tailwind.config.js           # Ivory, Charcoal, and Scarlet custom clay palette
├── docker-compose.yml       # One-command full-stack container orchestration
└── README.md
```

---

## ⚡ Core Modules & Features

### 1. Smart Team Formation Engine (Scenario A) — `/team-formation`
- **Algorithmic Matching Engine**: Calculates a composite match score:
  $$\text{Match Score} = \left(\frac{\text{skills\_matched}}{\text{skills\_required}} \times 50\right) + (\text{experience} \times 25) + (\text{availability} \times 25)$$
- **Custom Squad Size Slider**: Dynamically form teams from 2 to 8 specialists.
- **Dynamic DB Assignment**:
  - Clicking **"Deploy Squad to Project"** or individual **"+ Assign"** buttons sends a `POST` request to SQLite.
  - Automatically increments weekly workload hours, transitions employee status (`Available` $\rightarrow$ `Partially Allocated` $\rightarrow$ `Busy`), and immediately updates the system-wide utilization heatmap.

### 2. Workload Balancing & Bench Analytics (Scenario B) — `/workload-balancing`
- **Live Utilization Metrics**: Visual progress bars mapping each employee's weekly workload against their 40-hour capacity.
- **Automated Health Tagging**:
  - **Overloaded (`>85%`)**: Marked with scarlet fire tags as critical burnout risks.
  - **Bench (`<40%`)**: Marked as available bench resources ready for allocation.
- **One-Click Task Redistribution**:
  - Reallocation heuristic pairs overloaded personnel with underutilized colleagues sharing overlapping skillsets.
  - Clicking **"Execute Shift"** immediately mutates SQLite database hours and rebalances utilization.

### 3. Automated Skill-Gap Analysis & Training Advisor — `/skill-gap`
- **Competency Coverage Engine**: Compares active project skill demands against team capabilities.
- **Targeted Training Modules**: Recommends internal and external courses (AWS, DeepLearning.AI, Coursera, Linux Foundation) with direct enrollment paths.

### 4. Interactive CRUD for Judges (`+ Add Entity` Modal)
- Judges can add a **Brand-New Employee** or **Custom Project** directly on the UI at any time.
- As soon as the entity is added to SQLite, the matching engine instantly recalculates squad rosters and workload heatmaps without refreshing.

### 5. What-If Capacity & Burnout Simulation — `/simulation`
- Select any active project and drag the **Additional Demand Slider** ($+5\text{h}$ to $+80\text{h}$).
- Evaluates the impact on organizational burnout counts, shifts in average capacity, and candidate readiness without mutating the production database.

### 6. Natural Language AI Talent Copilot — `/copilot`
- Conversational chat interface for resource managers with instant one-click prompts:
  - *"Find available engineers with Python and Cloud Computing"*
  - *"Who is currently at risk of burnout (>85% workload)?"*
  - *"Show me bench specialists with under 40% workload"*
  - *"Recommend senior engineers with at least 5 years experience"*
- Renders candidate talent cards with live match percentages, skill badges, and workload metrics.

### 7. Global Workforce Directory & CSV Export — `/analytics`
- Searchable talent directory with role, status, and skill filtering.
- One-click **Export to CSV** for offline reporting.

---

## 🇮🇳 Realistic Seed Dataset

The SQLite database (`backend/workforce_iq.db`) initializes automatically on startup with authentic Indian engineering professionals across diverse disciplines:
- **Aarav Sharma** — Lead Cloud & DevOps Architect (AWS, Kubernetes, Terraform)
- **Diya Patel** — Senior Full Stack Developer (React, Next.js, Node.js)
- **Arjun Nambiar** — Principal Data & AI Engineer (Python, PyTorch, LangChain, MLOps)
- **Ananya Iyer** — Senior Backend Systems Specialist (Java, Spring Boot, Microservices)
- **Ishaan Mukherjee** — Data Analyst & BI Developer (SQL, Tableau, Data Analytics)
- *...along with Kavya Sundaram, Vihaan Reddy, Aditi Deshmukh, Rohan Verma, Pooja Kulkarni, Siddharth Rao, Meera Nair, Kabir Chawla, and Tanvi Bhattacharya.*

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

### 🐳 Running with Docker Compose

Deploy the entire stack (FastAPI backend + Next.js frontend) with a single command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API & Docs: `http://localhost:8000/docs`

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend and SQLite health status |
| `GET` | `/api/employees` | Fetch all employees with real-time workload stats |
| `POST` | `/api/employees` | Create a new employee (Interactive CRUD) |
| `GET` | `/api/projects` | Fetch all organizational projects |
| `POST` | `/api/projects` | Create a new project (Interactive CRUD) |
| `POST` | `/api/match-team` | Algorithmic scoring and squad recommendations |
| `POST` | `/api/assign-squad` | Dynamic DB allocation (updates hours & status in SQLite) |
| `GET` | `/api/workload-stats` | Global utilization metrics, burnout risks, and bench counts |
| `POST` | `/api/reallocate` | Generate workload balancing suggestions |
| `POST` | `/api/apply-shift` | Apply task shift (mutates employee hours in SQLite) |
| `GET` | `/api/skill-gaps/{project_id}` | Project competency gap analysis and course recommendations |
| `POST` | `/api/simulate-capacity` | What-If workload capacity and burnout simulation |
| `POST` | `/api/ai-copilot` | Natural language talent and squad query processor |

---

## 🧪 Deployment Readiness
- **Reverse Proxy / Single Domain Compatible**: Frontend dynamically handles `NEXT_PUBLIC_API_URL` or relative paths when routed behind Nginx/Caddy.
- **CORS Configured**: Pre-configured with permissive CORS for hackathon evaluation and staging environments.
- **Production Build Verified**: Fully compiled Next.js standalone output and uvicorn production server ready for Render, Railway, Fly.io, or Vercel.

---

## 📄 License
This project is open-source under the MIT License.
