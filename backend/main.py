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
    # Check if data already exists
    if db.query(EmployeeModel).first():
        return

    sample_employees = [
        EmployeeModel(
            name="Aria Montgomery",
            email="aria.m@workforceiq.internal",
            role="Senior Cloud Architect",
            skills="Cloud Computing, Python, Kubernetes, AWS, Terraform, Docker",
            experience_years=8.5,
            max_hours=40,
            current_workload_hours=38,
            status="Busy"
        ),
        EmployeeModel(
            name="Devon Vance",
            email="devon.v@workforceiq.internal",
            role="Full Stack Engineer",
            skills="React, TypeScript, Python, Node.js, GraphQL, PostgreSQL",
            experience_years=5.0,
            max_hours=40,
            current_workload_hours=28,
            status="Partially Allocated"
        ),
        EmployeeModel(
            name="Elena Rostova",
            email="elena.r@workforceiq.internal",
            role="Staff ML / Data Scientist",
            skills="Python, Data Analytics, Machine Learning, PyTorch, SQL, Cloud Computing",
            experience_years=7.2,
            max_hours=40,
            current_workload_hours=36,
            status="Busy"
        ),
        EmployeeModel(
            name="Marcus Chen",
            email="marcus.c@workforceiq.internal",
            role="Backend Specialist",
            skills="Java, Spring Boot, Microservices, Docker, Kubernetes, SQL",
            experience_years=6.0,
            max_hours=40,
            current_workload_hours=12,
            status="Available"
        ),
        EmployeeModel(
            name="Sofia Patel",
            email="sofia.p@workforceiq.internal",
            role="Frontend UI/UX Engineer",
            skills="React, Next.js, Tailwind CSS, TypeScript, UI/UX, Figma",
            experience_years=4.2,
            max_hours=40,
            current_workload_hours=14,
            status="Available"
        ),
        EmployeeModel(
            name="Liam Gallagher",
            email="liam.g@workforceiq.internal",
            role="DevOps & Reliability Engineer",
            skills="Cloud Computing, Docker, CI/CD, Terraform, Linux, Python",
            experience_years=5.5,
            max_hours=40,
            current_workload_hours=32,
            status="Partially Allocated"
        ),
        EmployeeModel(
            name="Zara Ibrahim",
            email="zara.i@workforceiq.internal",
            role="Junior Data Analyst",
            skills="Data Analytics, Python, Tableau, SQL, Excel, Statistics",
            experience_years=2.1,
            max_hours=40,
            current_workload_hours=10,
            status="Available"
        ),
        EmployeeModel(
            name="Lucas Morales",
            email="lucas.m@workforceiq.internal",
            role="Principal Enterprise Architect",
            skills="Java, Cloud Computing, System Design, Microservices, Security, Python",
            experience_years=11.0,
            max_hours=40,
            current_workload_hours=39,
            status="Busy"
        ),
        EmployeeModel(
            name="Hannah Schmidt",
            email="hannah.s@workforceiq.internal",
            role="React & Mobile Developer",
            skills="React, React Native, JavaScript, Tailwind CSS, REST APIs",
            experience_years=3.5,
            max_hours=40,
            current_workload_hours=8,
            status="Available"
        ),
        EmployeeModel(
            name="Tariq Al-Mansoor",
            email="tariq.a@workforceiq.internal",
            role="Platform Data Engineer",
            skills="Data Analytics, Python, Apache Kafka, Spark, SQL, AWS",
            experience_years=6.8,
            max_hours=40,
            current_workload_hours=35,
            status="Busy"
        ),
        EmployeeModel(
            name="Chloe Dubois",
            email="chloe.d@workforceiq.internal",
            role="Cybersecurity & Cloud Ops",
            skills="Security, Cloud Computing, AWS, Linux, Python, CI/CD",
            experience_years=4.8,
            max_hours=40,
            current_workload_hours=20,
            status="Partially Allocated"
        ),
        EmployeeModel(
            name="Rohan Verma",
            email="rohan.v@workforceiq.internal",
            role="Java & Cloud Backend Developer",
            skills="Java, Python, Cloud Computing, Kubernetes, Spring Boot",
            experience_years=3.8,
            max_hours=40,
            current_workload_hours=15,
            status="Available"
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
            description="Internal glassmorphic HR optimization portal with intelligent scheduling & predictive match scores.",
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
    # Create tables
    Base.metadata.create_all(bind=engine)
    # Seed data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="WorkforceIQ API",
    description="Intelligent Workforce Planning & Talent Optimization Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production ready & dev-friendly across ports 3000, 3001, etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------
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
    match_score: float  # 0 to 100%
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
# Helper Functions: Cosine / Intersection Similarity Engine
# ---------------------------------------------------------
def parse_skills(skills_str: str) -> List[str]:
    if not skills_str:
        return []
    return [s.strip() for s in skills_str.split(",") if s.strip()]


def calculate_skill_similarity(candidate_skills: List[str], required_skills: List[str]) -> tuple[float, List[str], List[str]]:
    """
    Computes normalized skill intersection / cosine overlap.
    Returns (score_ratio, matched_skills, missing_skills)
    """
    if not required_skills:
        return 1.0, candidate_skills, []

    req_set = {s.lower() for s in required_skills}
    cand_map = {s.lower(): s for s in candidate_skills}

    matched = []
    for r in required_skills:
        if r.lower() in cand_map:
            matched.append(cand_map[r.lower()])
        else:
            # Substring matching (e.g. "React" matches "React Native", "Cloud" matches "Cloud Computing")
            for c_low, c_orig in cand_map.items():
                if r.lower() in c_low or c_low in r.lower():
                    matched.append(c_orig)
                    break

    matched = list(dict.fromkeys(matched))
    missing = [r for r in required_skills if not any(r.lower() == m.lower() or r.lower() in m.lower() or m.lower() in r.lower() for m in matched)]

    # Cosine-like normalized similarity: |A ∩ B| / sqrt(|A| * |B|) or straight recall ratio
    # For workforce matching, coverage of required skills is paramount
    coverage_ratio = len(matched) / len(required_skills)
    # Give slight bonus for rich skill sets (cosine similarity blending)
    if candidate_skills:
        cosine_sim = len(matched) / (math.sqrt(len(required_skills)) * math.sqrt(len(candidate_skills)))
    else:
        cosine_sim = 0.0

    blended_skill_score = 0.75 * coverage_ratio + 0.25 * min(1.0, cosine_sim * 1.4)
    return min(1.0, blended_skill_score), matched, missing


# ---------------------------------------------------------
# Endpoints
# ---------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "WorkforceIQ", "version": "1.0.0"}


@app.get("/api/employees", response_model=List[EmployeeOut])
def get_employees(db: Session = Depends(get_db)):
    """Fetch all employees and their workload stats."""
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


@app.post("/api/match-team", response_model=TeamRecommendationResponse)
def match_team(request: MatchRequest, db: Session = Depends(get_db)):
    """
    Accept { "project_id": int } or custom skills,
    calculate match scores based on skill intersection, experience, and availability,
    and return the best team recommendation.
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
        skill_score, matched_skills, missing_skills = calculate_skill_similarity(emp_skills, required_skills)
        
        # Experience score: ratio up to 1.0 (with slight boost if exceeding required)
        exp_ratio = min(1.0, emp.experience_years / max(required_exp, 1.0))
        
        # Availability score: 
        # Overloaded (>85%) gets severe penalty; underutilized or optimal gets high score
        utilization = (emp.current_workload_hours / max(emp.max_hours, 1.0)) * 100
        avail_hours = max(0, emp.max_hours - emp.current_workload_hours)

        if utilization >= 90:
            avail_score = 0.15
            warning = "Critical Burnout Risk (>90% Allocated)"
        elif utilization >= 85:
            avail_score = 0.35
            warning = "High Workload Warning (>85% Allocated)"
        elif utilization <= 40:
            avail_score = 1.0  # Bench talent is ready for deployment
            warning = None
        else:
            avail_score = 0.85
            warning = None

        # Composite weighted score:
        # 50% Skill Match, 25% Experience, 25% Availability
        composite = (0.50 * skill_score) + (0.25 * exp_ratio) + (0.25 * avail_score)
        match_percentage = round(composite * 100, 1)

        # Fit assessment label
        if match_percentage >= 80:
            fit = "Prime Match"
        elif match_percentage >= 60:
            fit = "Strong Contender"
        elif match_percentage >= 40:
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
            match_score=match_percentage,
            skill_match_score=round(skill_score * 100, 1),
            experience_score=round(exp_ratio * 100, 1),
            availability_score=round(avail_score * 100, 1),
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            all_skills=emp_skills,
            fit_assessment=fit,
            warning=warning
        ))

    # Sort descending by match score
    candidate_scores.sort(key=lambda c: c.match_score, reverse=True)

    team_size = request.team_size or 3
    selected_team = candidate_scores[:team_size]

    # Calculate overall team readiness and combined missing competencies
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
    
    # Penalize team readiness if core skills are missing across the assembled group
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


@app.get("/api/workload-stats", response_model=WorkloadStatsResponse)
def get_workload_stats(db: Session = Depends(get_db)):
    """
    Return workforce utilization metrics,
    flagging overloaded (>85%) and underutilized (<40%) staff.
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
    Suggest task shift recommendations for workload balancing:
    Pairs overloaded staff (>85%) with underutilized staff (<40%) sharing compatible skills.
    """
    employees = db.query(EmployeeModel).all()
    overloaded = []
    underutilized = []

    for emp in employees:
        util = (emp.current_workload_hours / max(emp.max_hours, 1)) * 100
        if util > 85.0:
            overloaded.append(emp)
        elif util < 40.0:
            underutilized.append(emp)

    suggestions: List[ReallocationSuggestion] = []

    for high in overloaded:
        high_skills = {s.lower(): s for s in parse_skills(high.skills)}
        high_excess = high.current_workload_hours - int(high.max_hours * 0.75) # Bring down to ~75%

        if high_excess <= 0:
            continue

        # Look for the best underutilized candidate with overlapping skills
        best_candidate = None
        best_overlap: List[str] = []

        for low in underutilized:
            low_skills = {s.lower(): s for s in parse_skills(low.skills)}
            overlap = [name for key, name in high_skills.items() if key in low_skills]
            if overlap:
                if not best_candidate or len(overlap) > len(best_overlap):
                    best_candidate = low
                    best_overlap = overlap

        # If no skill overlap found, pick the underutilized employee with most capacity
        if not best_candidate and underutilized:
            best_candidate = min(underutilized, key=lambda e: e.current_workload_hours)
            best_overlap = ["Cross-training / General Engineering"]

        if best_candidate:
            shift_hours = min(high_excess, 12, best_candidate.max_hours - best_candidate.current_workload_hours - 10)
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


@app.get("/api/skill-gaps/{project_id}", response_model=SkillGapResponse)
def get_project_skill_gaps(project_id: int, db: Session = Depends(get_db)):
    """
    Detailed skill-gap report for a project paired with automated training recommendations.
    """
    proj = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")

    required_skills = parse_skills(proj.required_skills)
    
    # Get all active available or partially allocated employees
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

    # Fetch training modules for required skills
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
            # Fallback training entry
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


@app.get("/api/training-modules")
def get_training_modules(db: Session = Depends(get_db)):
    """Fetch all available training and certification tracks."""
    modules = db.query(TrainingModuleModel).all()
    return [
        {
            "id": m.id,
            "skill_name": m.skill_name,
            "course_name": m.course_name,
            "provider": m.provider
        }
        for m in modules
    ]
