from app.models.post_training_skill_analysis import PostTrainingSkillAnalysis
from app.models.jobs import Job
from app.models.candidate_registration import CandidateRegistration
import json

def get_candidate_skills(candidate_id):
    """
    Return list of skills (lowercased) for a given candidate.
    """
    analysis = PostTrainingSkillAnalysis.query.filter_by(candidate_id=candidate_id).first()
    if not analysis or not analysis.skills_with_level:
        return []

    skills_data = analysis.skills_with_level

    if isinstance(skills_data, str):
        try:
            skills_data = json.loads(skills_data)
        except json.JSONDecodeError:
            return []

    if isinstance(skills_data, dict):
        return [str(skill).lower() for skill in skills_data.keys()]

    if isinstance(skills_data, list):
        if all(isinstance(item, dict) for item in skills_data):
            return [str(s["skill"]).lower() for s in skills_data if "skill" in s]
        else:
            return [str(s).lower() for s in skills_data]

    return []


def get_all_jobs():
    return Job.query.all()


def find_exact_matches(job, candidates):
    """
    Find candidates whose skills completely cover job.skills
    job: dict with keys including 'skills'
    candidates: list of (CandidateRegistration, skills) tuples
    """
    if not job.get("skills"):
        return []

    job_skills = [s.lower() for s in job["skills"]]
    exact = []
    for candidate, skills in candidates:
        if all(skill in skills for skill in job_skills):
            exact.append(candidate)
    return exact


def find_close_matches(job, candidates, exclude_ids=None):
    """
    Find candidates who partially match job.skills
    job: dict with keys including 'skills'
    candidates: list of (CandidateRegistration, skills) tuples
    """
    if exclude_ids is None:
        exclude_ids = []

    if not job.get("skills"):
        return []

    job_skills = [s.lower() for s in job["skills"]]
    close = []
    for candidate, skills in candidates:
        if candidate.id in exclude_ids:
            continue
        matches = [s for s in job_skills if s in skills]
        if matches and not all(skill in skills for skill in job_skills):
            close.append(candidate)
    return close


def get_all_candidates_with_skills():
    all_candidates = CandidateRegistration.query.all()
    result = []
    for c in all_candidates:
        skills = get_candidate_skills(c.id)
        result.append((c, skills))
    return result