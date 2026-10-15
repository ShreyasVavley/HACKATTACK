# WorkforceIQ — AI-Powered Workforce Planning & Talent Optimization Platform

WorkforceIQ is an enterprise-grade intelligent platform designed to solve organizational talent bottlenecks by automating employee-to-project matching, monitoring workload distributions, flagging burnout and bench talent, and generating actionable training pathways.

---

## 🏗️ Architecture & Project Structure

```
├── /backend
│   ├── main.py              # FastAPI app with SQLite database, SQLAlchemy models, and matching heuristics
│   ├── requirements.txt     # Python backend dependencies (fastapi, uvicorn, sqlalchemy, pydantic)
│   └── workforce_iq.db      # Auto-seeded SQLite database with employees, projects, and training modules
├── /frontend
│   ├── app/
│   │   ├── page.tsx         # Obsidian glassmorphic dashboard UI with 3 interactive tabs
│   │   ├── layout.tsx       # Root layout and theme wrapper
│   │   └── globals.css      # Custom styling, dark palette, glassmorphism, and scrollbars
│   ├── package.json         # Next.js 14, React 18, Tailwind CSS, Lucide icons
│   ├── tailwind.config.js   # Obsidian & accent theme configuration
│   └── tsconfig.json        # TypeScript configuration
```

---

## ⚡ Key Features

### 1. Smart Team Formation Engine (Tab 1)
- **Multi-Factor Scoring Heuristic**: Blends skill set intersection (50%), relevant years of experience (25%), and availability status (25%).
- **Interactive Project & Team Selection**: Target any project, configure team sizes (2 to 5 members), and instantly receive ranked candidate rosters.
- **Readiness & Competency Warnings**: Calculates overall team readiness percentages, flags missing organizational skills, and highlights individual burnout warnings.

### 2. Workload Balancing & Bench Analytics (Tab 2)
- **Live Utilization Metrics**: Visual progress bars mapping each employee's weekly workload vs. 40h capacity.
- **Burnout vs. Bench Identification**: Flags overloaded employees (`>85%`) with alert tags and underutilized staff (`<40%`) as available bench talent.
- **Automated Task Redistribution**: AI recommendation engine suggests specific task shifts between overloaded personnel and underutilized colleagues with overlapping skill sets.

### 3. Automated Skill-Gap Analysis & Training Advisor (Tab 3)
- **Competency Coverage Engine**: Analyzes requirements against available talent pools to identify covered and missing competencies.
- **Targeted Training Modules**: Recommends verified internal and external bootcamps (AWS, Coursera, DeepLearning.AI, Pluralsight, etc.) with enrollment pathways.

---

## 🚀 Running the Application

### 1. Start Backend (FastAPI + SQLite)
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs & Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

### 2. Start Frontend (Next.js)
```bash
cd frontend
npm run dev
# Or production build:
# npm run build && npm run start
```
- Access Dashboard: `http://localhost:3000`

---

## 📡 API Endpoints

- `GET /api/employees` — Fetch all employees with real-time workload statistics.
- `GET /api/projects` — Fetch all projects and required competencies.
- `POST /api/match-team` — Compute match scores and return ranked recommendations.
- `GET /api/workload-stats` — Global workforce utilization metrics (burnout risks vs bench talent).
- `POST /api/reallocate` — Generate task shift recommendations for workload balancing.
- `GET /api/skill-gaps/{project_id}` — Detailed project skill-gap report with training courses.
