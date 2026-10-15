"""
WorkforceIQ - FastAPI Backend
AI-Powered Workforce Planning & Talent Optimization Platform
"""
import math
import json
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# ---------------------------------------------------------
# Database Setup (SQLite + SQLAlchemy)
# ---------------------------------------------------------
DATABASE_URL = "sqlite:///./workforce_iq.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class EmployeeModel(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)
    skills = Column(String, nullable=False)  # Comma-separated
    experience_years = Column(Float, nullable=False)
    max_hours = Column(Integer, default=40)
    current_workload_hours = Column(Integer, default=0)
    status = Column(String, default="Available")  # Available, Partially Allocated, Busy


class ProjectModel(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    required_skills = Column(String, nullable=False)  # Comma-separated
    required_experience = Column(Float, nullable=False)
    status = Column(String, default="Planning")  # Planning, Active, Completed


class TrainingModuleModel(Base):
    __tablename__ = "training_modules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    skill_name = Column(String, nullable=False)
    course_name = Column(String, nullable=False)
    provider = Column(String, nullable=False)


# ---------------------------------------------------------
# Seed Data Generation
# ---------------------------------------------------------
def seed_database(db: Session):
    if db.query(EmployeeModel).first():
        return

    sample_employees = [
        EmployeeModel(
            name="Aarav Sharma",
            email="aarav.sharma@workforceiq.internal",
            role="Principal Cloud & DevOps Architect",
            skills="Cloud Computing, Python, Kubernetes, AWS, Terraform, Docker",
            experience_years=8.5,
            max_hours=40,
            current_workload_hours=38,
            status="Busy"
        ),
        EmployeeModel(
            name="Diya Patel",
            email="diya.patel@workforceiq.internal",
            role="Senior Full Stack Engineer",
            skills="React, TypeScript, Python, Node.js, GraphQL, PostgreSQL",
            experience_years=5.0,
            max_hours=40,
            current_workload_hours=28,
            status="Partially Allocated"
        ),
        EmployeeModel(
            name="Arjun Nambiar",
            email="arjun.nambiar@workforceiq.internal",
            role="Staff ML & AI Scientist",
            skills="Python, Data Analytics, Machine Learning, PyTorch, SQL, Cloud Computing",
            experience_years=7.2,
            max_hours=40,
            current_workload_hours=36,
            status="Busy"
        ),
        EmployeeModel(
            name="Ananya Iyer",
            email="ananya.iyer@workforceiq.internal",
            role="Backend Systems Specialist",
            skills="Java, Spring Boot, Microservices, Docker, Kubernetes, SQL",
            experience_years=6.0,
            max_hours=40,
            current_workload_hours=12,
            status="Available"
        ),
        EmployeeModel(
            name="Ishaan Mukherjee",
            email="ishaan.m@workforceiq.internal",
            role="Frontend UI/UX Specialist",
            skills="React, Next.js, Tailwind CSS, TypeScript, UI/UX, Figma",
            experience_years=4.2,
            max_hours=40,
            current_workload_hours=14,
            status="Available"
        ),
        EmployeeModel(
            name="Kavya Sundaram",
            email="kavya.s@workforceiq.internal",
            role="DevOps & Site Reliability Engineer",
            skills="Cloud Computing, Docker, CI/CD, Terraform, Linux, Python",
            experience_years=5.5,
            max_hours=40,
            current_workload_hours=32,
            status="Partially Allocated"
        ),
        EmployeeModel(
            name="Vihaan Reddy",
            email="vihaan.reddy@workforceiq.internal",
            role="Junior Data Analyst",
            skills="Data Analytics, Python, Tableau, SQL, Excel, Statistics",
            experience_years=2.1,
            max_hours=40,
            current_workload_hours=10,
            status="Available"
        ),
        EmployeeModel(
            name="Aditi Deshmukh",
            email="aditi.d@workforceiq.internal",
            role="Distinguished Enterprise Architect",
            skills="Java, Cloud Computing, System Design, Microservices, Security, Python",
            experience_years=11.0,
            max_hours=40,
            current_workload_hours=39,
            status="Busy"
        ),
        EmployeeModel(
            name="Rohan Verma",
            email="rohan.verma@workforceiq.internal",
            role="React & Mobile Frontend Developer",
            skills="React, React Native, JavaScript, Tailwind CSS, REST APIs",
            experience_years=3.5,
            max_hours=40,
            current_workload_hours=8,
            status="Available"
        ),
        EmployeeModel(
            name="Pooja Kulkarni",
            email="pooja.k@workforceiq.internal",
            role="Platform Data Pipeline Engineer",
            skills="Data Analytics, Python, Apache Kafka, Spark, SQL, AWS",
            experience_years=6.8,
            max_hours=40,
            current_workload_hours=35,
            status="Busy"
        ),
        EmployeeModel(
            name="Siddharth Rao",
            email="siddharth.rao@workforceiq.internal",
            role="Cloud Security & SecOps Lead",
            skills="Security, Cloud Computing, AWS, Linux, Python, CI/CD",
            experience_years=4.8,
            max_hours=40,
            current_workload_hours=20,
            status="Partially Allocated"
        ),
        EmployeeModel(
            name="Meera Nair",
            email="meera.nair@workforceiq.internal",
            role="Java & Cloud Backend Specialist",
            skills="Java, Python, Cloud Computing, Kubernetes, Spring Boot",
            experience_years=3.8,
            max_hours=40,
            current_workload_hours=15,
            status="Available"
        ),
        EmployeeModel(
            name="Kabir Chawla",
            email="kabir.c@workforceiq.internal",
            role="AI Agents & Distributed Systems Engineer",
            skills="Python, Machine Learning, Docker, Kubernetes, REST APIs",
            experience_years=4.5,
            max_hours=40,
            current_workload_hours=14,
            status="Available"
        ),
        EmployeeModel(
            name="Tanvi Bhattacharya",
            email="tanvi.b@workforceiq.internal",
            role="Full Stack & Next.js Engineer",
            skills="React, Next.js, Node.js, TypeScript, Tailwind CSS, PostgreSQL",
            experience_years=4.0,
            max_hours=40,
            current_workload_hours=26,
            status="Partially Allocated"
        )
    ]

    sample_projects = [
        ProjectModel(
            name="NextGen Cloud Analytics Platform",
            description="Enterprise data processing lakehouse with real-time dashboard analytics and automated ML pipelines.",
            required_skills="Python, Data Analytics, Cloud Computing, React",
            required_experience=5.0,
            status="Planning"
        ),
        ProjectModel(
            name="Omnichannel Retail Microservices",
            description="High-throughput distributed commerce backend migration to containerized microservices.",
            required_skills="Java, Spring Boot, Microservices, Docker, Kubernetes",
            required_experience=4.0,
            status="Planning"
        ),
        ProjectModel(
            name="AI Talent & Workforce Portal",
            description="Internal HR optimization portal with intelligent scheduling & predictive match scores.",
            required_skills="React, Next.js, Python, Tailwind CSS, UI/UX",
            required_experience=3.5,
            status="Planning"
        ),
        ProjectModel(
            name="Global FinTech Security & Cloud Migration",
            description="Multi-region AWS cloud migration enforcing strict zero-trust network protocols and compliance.",
            required_skills="Cloud Computing, Security, Terraform, AWS, Docker",
            required_experience=6.0,
            status="Planning"
        )
    ]

    sample_training = [
        TrainingModuleModel(
            skill_name="Cloud Computing",
            course_name="AWS Solutions Architect Professional Bootcamp",
            provider="AWS Academy / Coursera"
        ),
        TrainingModuleModel(
            skill_name="Python",
            course_name="High-Performance Python & Scalable Systems",
            provider="Pluralsight"
        ),
        TrainingModuleModel(
            skill_name="React",
            course_name="Advanced Next.js Architecture & Modern React Patterns",
            provider="Frontend Masters"
        ),
        TrainingModuleModel(
            skill_name="Data Analytics",
            course_name="Big Data Analytics & Pipeline Engineering with Apache Spark",
            provider="DataCamp"
        ),
        TrainingModuleModel(
            skill_name="Java",
            course_name="Modern Java & Microservice Resilience with Spring Cloud",
            provider="Udemy Business"
        ),
        TrainingModuleModel(
            skill_name="Kubernetes",
            course_name="Certified Kubernetes Administrator (CKA) Intensive",
            provider="The Linux Foundation"
        ),
        TrainingModuleModel(
            skill_name="Machine Learning",
            course_name="Deep Learning & LLM Deployment in Production",
            provider="DeepLearning.AI"
        ),
        TrainingModuleModel(
            skill_name="Security",
            course_name="Zero-Trust Architecture & Cloud Security Essentials",
            provider="SANS Institute"
        ),
        TrainingModuleModel(
            skill_name="Docker",
            course_name="Container Mastery & Modern CI/CD Orchestration",
            provider="Docker Captains"
        ),
        TrainingModuleModel(
            skill_name="Tailwind CSS",
            course_name="Design Systems & Glassmorphism in Modern Web UI",
            provider="Egghead.io"
        )
    ]

    db.add_all(sample_employees)
    db.add_all(sample_projects)
    db.add_all(sample_training)
    db.commit()


# ---------------------------------------------------------
# Lifecycle & App Initialization
# ---------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Workforce Intelligence API",
    description="Intelligent Workforce Planning & Talent Optimization Engine",
    version="1.1.0",
    lifespan=lifespan
)

# CORS Configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------
class EmployeeCreate(BaseModel):
    name: str = Field(..., min_length=2, example="Jordan Lee")
    email: str = Field(..., example="jordan.lee@workforceiq.internal")
    role: str = Field(..., example="Full Stack Cloud Developer")
    skills: List[str] = Field(..., example=["Python", "React", "Cloud Computing"])
    experience_years: float = Field(..., ge=0.0, example=4.5)
    max_hours: Optional[int] = Field(40, ge=10, le=80)
    current_workload_hours: Optional[int] = Field(15, ge=0)


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=3, example="Autonomous Drone Fleet AI")
    description: Optional[str] = Field("", example="Edge computing and fleet coordination platform.")
    required_skills: List[str] = Field(..., min_length=1, example=["Python", "Cloud Computing", "Machine Learning"])
    required_experience: float = Field(..., ge=0.5, example=4.0)


class EmployeeOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    skills: List[str]
    experience_years: float
    max_hours: int
    current_workload_hours: int
    utilization_pct: float
    status: str

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    required_skills: List[str]
    required_experience: float
    status: str

    class Config:
        from_attributes = True


class MatchRequest(BaseModel):
    project_id: Optional[int] = None
    custom_skills: Optional[List[str]] = None
    custom_experience: Optional[float] = 3.0
    team_size: Optional[int] = 3


class CandidateMatch(BaseModel):
    employee_id: int
    name: str
    role: str
    email: str
    experience_years: float
    utilization_pct: float
    current_workload_hours: int
    available_hours: int
    status: str
    match_score: float  # Exact: (skills_matched / skills_required * 50) + (experience_score * 25) + (availability_score * 25)
    skill_match_score: float
    experience_score: float
    availability_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    all_skills: List[str]
    fit_assessment: str
    warning: Optional[str] = None


class TeamRecommendationResponse(BaseModel):
    project_id: Optional[int]
    project_name: str
    required_skills: List[str]
    required_experience: float
    team_size: int
    overall_team_readiness: float
    missing_team_competencies: List[str]
    selected_team: List[CandidateMatch]
    all_ranked_candidates: List[CandidateMatch]


class AssignSquadRequest(BaseModel):
    project_id: int
    employee_ids: List[int]
    hours_per_member: Optional[int] = 20  # Hours to assign to this project per member


class AssignSquadResponse(BaseModel):
    success: bool
    project_id: int
    project_name: str
    assigned_count: int
    updated_employees: List[EmployeeOut]
    message: str


class WorkloadStatsResponse(BaseModel):
    total_employees: int
    average_utilization: float
    overloaded_count: int
    underutilized_count: int
    optimal_count: int
    employees: List[EmployeeOut]
    overloaded_employees: List[EmployeeOut]
    underutilized_employees: List[EmployeeOut]


class ReallocationSuggestion(BaseModel):
    from_employee_id: int
    from_employee_name: str
    from_employee_role: str
    from_workload: int
    from_utilization_pct: float
    to_employee_id: int
    to_employee_name: str
    to_employee_role: str
    to_workload: int
    to_utilization_pct: float
    suggested_hours_to_shift: int
    shared_skills: List[str]
    projected_from_utilization: float
    projected_to_utilization: float
    impact_rationale: str


class SkillGapResponse(BaseModel):
    project_id: int
    project_name: str
    required_skills: List[str]
    missing_skills: List[str]
    covered_skills: List[str]
    coverage_percentage: float
    recommended_training: List[Dict[str, str]]


# ---------------------------------------------------------
# Exact Real-Time Python Algorithmic Scoring Engine
# ---------------------------------------------------------
def parse_skills(skills_str: str) -> List[str]:
    if not skills_str:
        return []
    return [s.strip() for s in skills_str.split(",") if s.strip()]


def calculate_realtime_scores(
    candidate_skills: List[str],
    required_skills: List[str],
    candidate_exp: float,
    required_exp: float,
    current_workload_hours: int,
    max_hours: int
) -> tuple[float, float, float, float, List[str], List[str]]:
    """
    Implements real-time mathematical scoring function:
    Score = (skills_matched / skills_required * 50) + (experience_score * 25) + (availability_score * 25)
    
    Returns:
    (composite_score, skill_score_out_of_50, exp_score_out_of_25, avail_score_out_of_25, matched_skills, missing_skills)
    """
    cand_skills_lower = {s.lower(): s for s in candidate_skills}
    matched_skills = []

    for req in required_skills:
        req_clean = req.strip()
        req_lower = req_clean.lower()
        if req_lower in cand_skills_lower:
            matched_skills.append(cand_skills_lower[req_lower])
        else:
            # Substring match (e.g. 'Cloud' in 'Cloud Computing' or 'React' in 'React Native')
            for c_low, c_orig in cand_skills_lower.items():
                if req_lower in c_low or c_low in req_lower:
                    matched_skills.append(c_orig)
                    break

    matched_skills = list(dict.fromkeys(matched_skills))
    missing_skills = [
        req for req in required_skills
        if not any(req.lower() == m.lower() or req.lower() in m.lower() or m.lower() in req.lower() for m in matched_skills)
    ]

    # 1. Skill Component: (skills_matched / skills_required * 50)
    if len(required_skills) > 0:
        skill_ratio = min(1.0, len(matched_skills) / len(required_skills))
    else:
        skill_ratio = 1.0
    skill_component = skill_ratio * 50.0

    # 2. Experience Component: (min(candidate_exp / required_exp, 1.0) * 25)
    exp_ratio = min(1.0, candidate_exp / max(required_exp, 0.5))
    experience_component = exp_ratio * 25.0

    # 3. Availability Component: based on live remaining capacity (out of 25)
    utilization = (current_workload_hours / max(max_hours, 1)) * 100.0
    if utilization >= 90.0:
        avail_ratio = 0.10  # Severe penalty for critical burnout
    elif utilization >= 85.0:
        avail_ratio = 0.35  # High workload warning
    elif utilization <= 40.0:
        avail_ratio = 1.00  # Bench talent is immediately available
    else:
        # Linearly proportional between 40% and 85%
        avail_ratio = 0.85 - ((utilization - 40.0) / 45.0) * 0.45
    availability_component = max(0.0, avail_ratio) * 25.0

    # Final Composite Match Score (0 to 100)
    composite = round(skill_component + experience_component + availability_component, 1)

    return (
        composite,
        round((skill_component / 50.0) * 100.0, 1),
        round((experience_component / 25.0) * 100.0, 1),
        round((availability_component / 25.0) * 100.0, 1),
        matched_skills,
        missing_skills
    )


# ---------------------------------------------------------
# Endpoints
# ---------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Workforce Intelligence Platform", "version": "1.1.0"}


@app.get("/api/employees", response_model=List[EmployeeOut])
def get_employees(db: Session = Depends(get_db)):
    """Fetch all employees and live calculated workload stats."""
    employees = db.query(EmployeeModel).all()
    results = []
    for emp in employees:
        utilization = round((emp.current_workload_hours / max(emp.max_hours, 1)) * 100, 1)
        results.append(EmployeeOut(
            id=emp.id,
            name=emp.name,
            email=emp.email,
            role=emp.role,
            skills=parse_skills(emp.skills),
            experience_years=emp.experience_years,
            max_hours=emp.max_hours,
            current_workload_hours=emp.current_workload_hours,
            utilization_pct=utilization,
            status=emp.status
        ))
    return results


@app.post("/api/employees", response_model=EmployeeOut)
def create_employee(emp_in: EmployeeCreate, db: Session = Depends(get_db)):
    """Interactive CRUD: Add a brand-new employee to SQLite DB."""
    # Check email duplicate
    existing = db.query(EmployeeModel).filter(EmployeeModel.email == emp_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Employee with email {emp_in.email} already exists.")

    current_hours = emp_in.current_workload_hours or 0
    max_h = emp_in.max_hours or 40
    util = (current_hours / max(max_h, 1)) * 100.0

    # Auto-assign initial status based on hours
    if util > 85.0:
        status_val = "Busy"
    elif util >= 40.0:
        status_val = "Partially Allocated"
    else:
        status_val = "Available"

    new_emp = EmployeeModel(
        name=emp_in.name,
        email=emp_in.email,
        role=emp_in.role,
        skills=", ".join([s.strip() for s in emp_in.skills]),
        experience_years=emp_in.experience_years,
        max_hours=max_h,
        current_workload_hours=current_hours,
        status=status_val
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)

    return EmployeeOut(
        id=new_emp.id,
        name=new_emp.name,
        email=new_emp.email,
        role=new_emp.role,
        skills=parse_skills(new_emp.skills),
        experience_years=new_emp.experience_years,
        max_hours=new_emp.max_hours,
        current_workload_hours=new_emp.current_workload_hours,
        utilization_pct=round(util, 1),
        status=new_emp.status
    )


@app.get("/api/projects", response_model=List[ProjectOut])
def get_projects(db: Session = Depends(get_db)):
    """Fetch all projects."""
    projects = db.query(ProjectModel).all()
    return [
        ProjectOut(
            id=p.id,
            name=p.name,
            description=p.description,
            required_skills=parse_skills(p.required_skills),
            required_experience=p.required_experience,
            status=p.status
        )
        for p in projects
    ]


@app.post("/api/projects", response_model=ProjectOut)
def create_project(proj_in: ProjectCreate, db: Session = Depends(get_db)):
    """Interactive CRUD: Add a custom project to SQLite DB and enable real-time matching."""
    new_proj = ProjectModel(
        name=proj_in.name,
        description=proj_in.description,
        required_skills=", ".join([s.strip() for s in proj_in.required_skills]),
        required_experience=proj_in.required_experience,
        status="Planning"
    )
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)

    return ProjectOut(
        id=new_proj.id,
        name=new_proj.name,
        description=new_proj.description,
        required_skills=parse_skills(new_proj.required_skills),
        required_experience=new_proj.required_experience,
        status=new_proj.status
    )


@app.post("/api/match-team", response_model=TeamRecommendationResponse)
def match_team(request: MatchRequest, db: Session = Depends(get_db)):
    """
    Algorithmic Real-Time Python Matching Engine:
    Score = (skills_matched / skills_required * 50) + (experience_score * 25) + (availability_score * 25)
    """
    required_skills = []
    required_exp = request.custom_experience or 3.0
    project_name = "Custom Requirements Project"
    project_id = request.project_id

    if project_id:
        proj = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
        if not proj:
            raise HTTPException(status_code=404, detail=f"Project with ID {project_id} not found.")
        project_name = proj.name
        required_skills = parse_skills(proj.required_skills)
        required_exp = proj.required_experience
    elif request.custom_skills:
        required_skills = request.custom_skills
    else:
        raise HTTPException(status_code=400, detail="Either 'project_id' or 'custom_skills' must be provided.")

    employees = db.query(EmployeeModel).all()
    candidate_scores: List[CandidateMatch] = []

    for emp in employees:
        emp_skills = parse_skills(emp.skills)
        (
            composite,
            skill_pct,
            exp_pct,
            avail_pct,
            matched,
            missing
        ) = calculate_realtime_scores(
            candidate_skills=emp_skills,
            required_skills=required_skills,
            candidate_exp=emp.experience_years,
            required_exp=required_exp,
            current_workload_hours=emp.current_workload_hours,
            max_hours=emp.max_hours
        )

        utilization = (emp.current_workload_hours / max(emp.max_hours, 1)) * 100.0
        avail_hours = max(0, emp.max_hours - emp.current_workload_hours)

        warning = None
        if utilization >= 90:
            warning = "Critical Burnout Risk (>90% Allocated)"
        elif utilization >= 85:
            warning = "High Workload Warning (>85% Allocated)"

        # Fit assessment label
        if composite >= 75:
            fit = "Prime Match"
        elif composite >= 55:
            fit = "Strong Contender"
        elif composite >= 40:
            fit = "Moderate Fit"
        else:
            fit = "Low Fit"

        candidate_scores.append(CandidateMatch(
            employee_id=emp.id,
            name=emp.name,
            role=emp.role,
            email=emp.email,
            experience_years=emp.experience_years,
            utilization_pct=round(utilization, 1),
            current_workload_hours=emp.current_workload_hours,
            available_hours=avail_hours,
            status=emp.status,
            match_score=composite,
            skill_match_score=skill_pct,
            experience_score=exp_pct,
            availability_score=avail_pct,
            matched_skills=matched,
            missing_skills=missing,
            all_skills=emp_skills,
            fit_assessment=fit,
            warning=warning
        ))

    # Sort candidates strictly by real-time composite score descending
    candidate_scores.sort(key=lambda c: c.match_score, reverse=True)

    team_size = request.team_size or 3
    selected_team = candidate_scores[:team_size]

    # Check overall team competency coverage
    combined_team_skills = set()
    for member in selected_team:
        for s in member.all_skills:
            combined_team_skills.add(s.lower())

    missing_team_competencies = []
    for req in required_skills:
        req_l = req.lower()
        if not any(req_l == s or req_l in s or s in req_l for s in combined_team_skills):
            missing_team_competencies.append(req)

    avg_team_score = sum(m.match_score for m in selected_team) / max(len(selected_team), 1)
    if required_skills:
        team_coverage_ratio = (len(required_skills) - len(missing_team_competencies)) / len(required_skills)
        overall_team_readiness = round((0.6 * avg_team_score) + (0.4 * (team_coverage_ratio * 100)), 1)
    else:
        overall_team_readiness = round(avg_team_score, 1)

    return TeamRecommendationResponse(
        project_id=project_id,
        project_name=project_name,
        required_skills=required_skills,
        required_experience=required_exp,
        team_size=team_size,
        overall_team_readiness=overall_team_readiness,
        missing_team_competencies=missing_team_competencies,
        selected_team=selected_team,
        all_ranked_candidates=candidate_scores
    )


@app.post("/api/assign-squad", response_model=AssignSquadResponse)
def assign_squad(req: AssignSquadRequest, db: Session = Depends(get_db)):
    """
    Dynamic DB State Changes:
    Assigns selected squad members to a project, updating their current_workload_hours in SQLite.
    Instantly shifts status:
    - If new utilization > 85% -> 'Busy'
    - If 40% - 85% -> 'Partially Allocated'
    - If < 40% -> 'Available'
    And marks project status to 'Active'.
    """
    project = db.query(ProjectModel).filter(ProjectModel.id == req.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    updated_employees = []
    hours_to_add = req.hours_per_member or 15

    for emp_id in req.employee_ids:
        emp = db.query(EmployeeModel).filter(EmployeeModel.id == emp_id).first()
        if emp:
            # Increase employee workload hours
            emp.current_workload_hours = min(emp.max_hours, emp.current_workload_hours + hours_to_add)
            util = (emp.current_workload_hours / max(emp.max_hours, 1)) * 100.0

            # Dynamic state transition
            if util > 85.0:
                emp.status = "Busy"
            elif util >= 40.0:
                emp.status = "Partially Allocated"
            else:
                emp.status = "Available"

            updated_employees.append(EmployeeOut(
                id=emp.id,
                name=emp.name,
                email=emp.email,
                role=emp.role,
                skills=parse_skills(emp.skills),
                experience_years=emp.experience_years,
                max_hours=emp.max_hours,
                current_workload_hours=emp.current_workload_hours,
                utilization_pct=round(util, 1),
                status=emp.status
            ))

    # Update project status
    project.status = "Active"
    db.commit()

    return AssignSquadResponse(
        success=True,
        project_id=project.id,
        project_name=project.name,
        assigned_count=len(updated_employees),
        updated_employees=updated_employees,
        message=f"Successfully deployed {len(updated_employees)} specialists to '{project.name}'. Workloads updated live in SQLite database!"
    )


@app.get("/api/workload-stats", response_model=WorkloadStatsResponse)
def get_workload_stats(db: Session = Depends(get_db)):
    """
    Return workforce utilization metrics,
    flagging overloaded (>85%) and underutilized (<40%) staff for live heatmaps.
    """
    employees = db.query(EmployeeModel).all()
    overloaded = []
    underutilized = []
    optimal = []
    all_out = []
    total_util = 0.0

    for emp in employees:
        util = round((emp.current_workload_hours / max(emp.max_hours, 1)) * 100, 1)
        total_util += util
        out = EmployeeOut(
            id=emp.id,
            name=emp.name,
            email=emp.email,
            role=emp.role,
            skills=parse_skills(emp.skills),
            experience_years=emp.experience_years,
            max_hours=emp.max_hours,
            current_workload_hours=emp.current_workload_hours,
            utilization_pct=util,
            status=emp.status
        )
        all_out.append(out)

        if util > 85.0:
            overloaded.append(out)
        elif util < 40.0:
            underutilized.append(out)
        else:
            optimal.append(out)

    avg_util = round(total_util / max(len(employees), 1), 1)

    return WorkloadStatsResponse(
        total_employees=len(employees),
        average_utilization=avg_util,
        overloaded_count=len(overloaded),
        underutilized_count=len(underutilized),
        optimal_count=len(optimal),
        employees=all_out,
        overloaded_employees=overloaded,
        underutilized_employees=underutilized
    )


@app.post("/api/reallocate", response_model=List[ReallocationSuggestion])
def reallocate_workload(db: Session = Depends(get_db)):
    """
    Suggest task shift recommendations to balance workloads:
    Pairs overloaded staff (>85%) with underutilized staff (<40%) sharing compatible skills.
    """
    employees = db.query(EmployeeModel).all()
    overloaded = []
    underutilized = []

    for emp in employees:
        util = (emp.current_workload_hours / max(emp.max_hours, 1)) * 100.0
        if util > 85.0:
            overloaded.append(emp)
        elif util < 40.0:
            underutilized.append(emp)

    suggestions: List[ReallocationSuggestion] = []

    for high in overloaded:
        high_skills = {s.lower(): s for s in parse_skills(high.skills)}
        high_excess = high.current_workload_hours - int(high.max_hours * 0.75)

        if high_excess <= 0:
            continue

        best_candidate = None
        best_overlap: List[str] = []

        for low in underutilized:
            low_skills = {s.lower(): s for s in parse_skills(low.skills)}
            overlap = [name for key, name in high_skills.items() if key in low_skills]
            if overlap:
                if not best_candidate or len(overlap) > len(best_overlap):
                    best_candidate = low
                    best_overlap = overlap

        if not best_candidate and underutilized:
            best_candidate = min(underutilized, key=lambda e: e.current_workload_hours)
            best_overlap = ["Cross-training / General Engineering"]

        if best_candidate:
            shift_hours = min(high_excess, 12, max(4, best_candidate.max_hours - best_candidate.current_workload_hours - 5))
            if shift_hours <= 0:
                shift_hours = 6

            proj_from = round(((high.current_workload_hours - shift_hours) / high.max_hours) * 100, 1)
            proj_to = round(((best_candidate.current_workload_hours + shift_hours) / best_candidate.max_hours) * 100, 1)

            suggestions.append(ReallocationSuggestion(
                from_employee_id=high.id,
                from_employee_name=high.name,
                from_employee_role=high.role,
                from_workload=high.current_workload_hours,
                from_utilization_pct=round((high.current_workload_hours / high.max_hours) * 100, 1),
                to_employee_id=best_candidate.id,
                to_employee_name=best_candidate.name,
                to_employee_role=best_candidate.role,
                to_workload=best_candidate.current_workload_hours,
                to_utilization_pct=round((best_candidate.current_workload_hours / best_candidate.max_hours) * 100, 1),
                suggested_hours_to_shift=shift_hours,
                shared_skills=best_overlap,
                projected_from_utilization=proj_from,
                projected_to_utilization=proj_to,
                impact_rationale=(
                    f"Offload {shift_hours}h/wk of {best_overlap[0]} tasks from {high.name} to {best_candidate.name}. "
                    f"Reduces burnout index from {round((high.current_workload_hours/high.max_hours)*100)}% to {proj_from}% "
                    f"while activating bench talent ({proj_to}% projected)."
                )
            ))

    return suggestions


@app.post("/api/apply-shift")
def apply_workload_shift(from_id: int, to_id: int, hours: int, db: Session = Depends(get_db)):
    """Dynamic DB state change: Applies an actual workload shift in SQLite."""
    from_emp = db.query(EmployeeModel).filter(EmployeeModel.id == from_id).first()
    to_emp = db.query(EmployeeModel).filter(EmployeeModel.id == to_id).first()

    if not from_emp or not to_emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    from_emp.current_workload_hours = max(0, from_emp.current_workload_hours - hours)
    to_emp.current_workload_hours = min(to_emp.max_hours, to_emp.current_workload_hours + hours)

    # Re-evaluate statuses
    for emp in [from_emp, to_emp]:
        util = (emp.current_workload_hours / max(emp.max_hours, 1)) * 100.0
        if util > 85.0:
            emp.status = "Busy"
        elif util >= 40.0:
            emp.status = "Partially Allocated"
        else:
            emp.status = "Available"

    db.commit()
    return {
        "success": True,
        "message": f"Successfully shifted {hours}h from {from_emp.name} to {to_emp.name} in SQLite database!",
        "from_employee": {
            "name": from_emp.name,
            "workload": from_emp.current_workload_hours,
            "status": from_emp.status
        },
        "to_employee": {
            "name": to_emp.name,
            "workload": to_emp.current_workload_hours,
            "status": to_emp.status
        }
    }


@app.get("/api/skill-gaps/{project_id}", response_model=SkillGapResponse)
def get_project_skill_gaps(project_id: int, db: Session = Depends(get_db)):
    """Skill-gap report for a project paired with automated training recommendations."""
    proj = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")

    required_skills = parse_skills(proj.required_skills)
    employees = db.query(EmployeeModel).all()
    org_skills = set()
    for e in employees:
        for s in parse_skills(e.skills):
            org_skills.add(s.lower())

    covered = []
    missing = []
    for req in required_skills:
        req_l = req.lower()
        if any(req_l == s or req_l in s or s in req_l for s in org_skills):
            covered.append(req)
        else:
            missing.append(req)

    trainings = db.query(TrainingModuleModel).all()
    training_map = {}
    for t in trainings:
        training_map[t.skill_name.lower()] = {
            "skill": t.skill_name,
            "course": t.course_name,
            "provider": t.provider
        }

    recommendations = []
    for skill in required_skills:
        skill_l = skill.lower()
        if skill_l in training_map:
            recommendations.append(training_map[skill_l])
        else:
            recommendations.append({
                "skill": skill,
                "course": f"Advanced {skill} Professional Certification",
                "provider": "Enterprise Academy"
            })

    coverage_pct = round((len(covered) / max(len(required_skills), 1)) * 100, 1)

    return SkillGapResponse(
        project_id=proj.id,
        project_name=proj.name,
        required_skills=required_skills,
        missing_skills=missing,
        covered_skills=covered,
        coverage_percentage=coverage_pct,
        recommended_training=recommendations
    )
