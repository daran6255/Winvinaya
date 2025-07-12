import random
import string
import pgeocode
from datetime import datetime
import pandas as pd

from ..models.user import User
from ..models.role import Role
from ..models.user_role import UserRole

def generate_short_id(length=8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k=length))

def generate_candidate_id():
    year = datetime.utcnow().strftime('%y')
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f'WVF{year}{random_part}'

def skill_match_score(job_skills, candidate_skills):
    # Convert both to lowercase sets to avoid case mismatch
    job_set = set(s.strip().lower() for s in job_skills)
    candidate_set = set(s.strip().lower() for s in candidate_skills)
    return len(job_set & candidate_set)


def get_location_by_pincode(pincode):
    """
    Look up Indian postal codes using pgeocode.
    Returns dict with city, district, state or None if not found.
    """
    nomi = pgeocode.Nominatim('IN')
    info = nomi.query_postal_code(str(pincode))
    
    if info is None or pd.isna(info.place_name):
        return None
    
    city = str(info.place_name).split(",")[0].strip() if not pd.isna(info.place_name) else None
    district = str(info.county_name).strip() if not pd.isna(info.county_name) else None
    state = str(info.state_name).strip() if not pd.isna(info.state_name) else None
    
    return {
        "city": city,
        "district": district,
        "state": state
    }

def get_user_info(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return None
    user_role = UserRole.query.filter_by(user_id=user.id).first()
    role_name = None
    if user_role:
        role = Role.query.filter_by(id=user_role.role_id).first()
        if role:
            role_name = role.name
    return {
        "id": user.id,
        "username": user.username,
        "role": role_name
    }

