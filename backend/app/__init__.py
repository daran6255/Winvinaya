from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os
from dotenv import load_dotenv

from .database import db
from .models.user import User
from .models.role import Role
from .models.user_role import UserRole
from .models.token import Token
from .models.permission import Permission
from .models.role_permission import RolePermission
from .models.candidate_registration import CandidateRegistration
from .models.candidate_profile import CandidateProfile
from .models.candidate_evaluation import CandidateEvaluation
from .models.candidate_interview_status import CandidateInterviewStatus
from .models.candidate_job_mapping import CandidateJobMapping
from .models.companies import Company
from .models.post_training_skill_analysis import PostTrainingSkillAnalysis
from .models.jobmela import JobMela
from .models.jobs import Job
from .models.training_batch_candidates import TrainingBatchCandidate
from .models.training_batches import TrainingBatch

from .api.auth import auth_bp
from .api.users import users_bp
from .api.candidates import candidates_bp
from .api.candidate_profiles import candidate_profiles_bp
from .api.candidate_evaluation import candidate_evaluations_bp
from .api.training_batch import training_batches_bp
from .api.candidate_batch_allocation import training_batch_candidates_bp
from .api.post_training_skill_analysis import post_training_skill_bp
# from .api.files import file_blp
from .api.company import company_bp
from .api.job import jobs_bp
from .api.job_mapping import candidate_job_mapping_bp
from .api.candidate_interview_status import candidate_interview_status_bp
from .api.jobmela import jobmela_bp


load_dotenv()

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'temp')
RESUME_FOLDER = os.path.join(UPLOAD_FOLDER, 'resume')
DISABILITY_FOLDER = os.path.join(UPLOAD_FOLDER, 'disability_certificate')

# Ensure folders exist
os.makedirs(RESUME_FOLDER, exist_ok=True)
os.makedirs(DISABILITY_FOLDER, exist_ok=True)

jwt = JWTManager()

# Declare a simple token blacklist in memory
# In production replace this with Redis or DB table
TOKEN_BLACKLIST = set()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    token_obj = Token.query.filter_by(jti=jti).first()
    return token_obj is not None and token_obj.revoked

def create_app():
    """Create and configure the Flask app."""
    app = Flask(__name__)

    # Load config
    app.config.from_object('app.config.Config')
    app.config['DEBUG'] = True

    # Upload folders config
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['RESUME_FOLDER'] = RESUME_FOLDER
    app.config['DISABILITY_FOLDER'] = DISABILITY_FOLDER

    # JWT config
    app.config['JWT_SECRET_KEY'] = os.environ.get("SECRET_KEY", "supersecretkey")
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)

    # CORS
    CORS(app, origins="*", supports_credentials=True)

    # Initialize DB and Migrations
    db.init_app(app)
    migrate = Migrate(app, db)

    # Initialize JWT
    jwt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(candidates_bp)
    app.register_blueprint(candidate_profiles_bp)
    app.register_blueprint(candidate_evaluations_bp)
    app.register_blueprint(training_batches_bp)
    app.register_blueprint(training_batch_candidates_bp)
    app.register_blueprint(post_training_skill_bp)
    # app.register_blueprint(file_blp)
    app.register_blueprint(company_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(candidate_job_mapping_bp)
    app.register_blueprint(candidate_interview_status_bp)
    app.register_blueprint(jobmela_bp)
    
    # Register CLI commands
    from seed_admin import seed_admin
    app.cli.add_command(seed_admin)

    return app
