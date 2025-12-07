from flask import Blueprint, request, jsonify
from ..models.jobs import Job
from ..models.companies import Company
from ..database import db
import traceback

blp = Blueprint('jobs', __name__, url_prefix='/jobs')

# Create Job (POST)
@blp.route('/add', methods=['POST'])
def create_job():
    try:
        data = request.get_json()
        print("Received Job Data:", data)

        company_name = data.get('companyName')
        company = Company.query.filter_by(company_name=company_name).first()
        if not company:
            return jsonify({'status': 'error', 'message': 'Invalid company name'}), 400

        job = Job(
            company_id=company.id,
            job_role=data['jobRole'],
            skills=data['skills'],
            experience_level=data['experienceLevel'],
            education_qualification=data['educationQualification'],
            num_openings=data['numOpenings'],
            location=data['location'],
            disability_preferred=data.get('disabilityPreferred'),
            approx_salary=data.get('approxSalary'),
            roles_and_responsibilities=data['rolesAndResponsibilities'],
            description=data['description']
        )
        db.session.add(job)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Job created', 'id': job.id}), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': str(e)}), 400

# Get All Jobs (GET)
@blp.route('/get_all', methods=['GET'])
def get_all_jobs():
    try:
        jobs = Job.query.all()
        result = [{
            'id': j.id,
            'companyId': j.company_id,
            'companyName': j.company.company_name,
            'jobRole': j.job_role,
            'skills': j.skills,
            'experienceLevel': j.experience_level,
            'educationQualification': j.education_qualification,
            'numOpenings': j.num_openings,
            'location': j.location,
            'disabilityPreferred': j.disability_preferred,
            'approxSalary': j.approx_salary,
            'rolesAndResponsibilities': j.roles_and_responsibilities,
            'description': j.description,
            'createdAt': j.created_at.isoformat()
        } for j in jobs]
        return jsonify({'status': 'success', 'result': result})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Get Job by ID (GET)
@blp.route('/get/<string:job_id>', methods=['GET'])
def get_job(job_id):
    try:
        j = Job.query.get(job_id)
        if not j:
            return jsonify({'status': 'error', 'message': 'Job not found'}), 404
        result = {
            'id': j.id,
            'companyId': j.company_id,
            'companyName': j.company.company_name,
            'jobRole': j.job_role,
            'skills': j.skills,
            'experienceLevel': j.experience_level,
            'educationQualification': j.education_qualification,
            'numOpenings': j.num_openings,
            'location': j.location,
            'disabilityPreferred': j.disability_preferred,
            'approxSalary': j.approx_salary,
            'rolesAndResponsibilities': j.roles_and_responsibilities,
            'description': j.description,
            'createdAt': j.created_at.isoformat()
        }
        return jsonify({'status': 'success', 'result': result})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Update Job (PUT)
@blp.route('/put/<string:job_id>', methods=['PUT'])
def update_job(job_id):
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'status': 'error', 'message': 'Job not found'}), 404

        data = request.get_json()
        company_name = data.get('companyName')
        company = Company.query.filter_by(company_name=company_name).first()
        if not company:
            return jsonify({'status': 'error', 'message': 'Invalid company name'}), 400

        job.company_id = company.id
        job.job_role = data['jobRole']
        job.skills = data['skills']
        job.experience_level = data['experienceLevel']
        job.education_qualification = data['educationQualification']
        job.num_openings = data['numOpenings']
        job.location = data['location']
        job.disability_preferred = data.get('disabilityPreferred')
        job.approx_salary = data.get('approxSalary')
        job.roles_and_responsibilities = data['rolesAndResponsibilities']
        job.description = data['description']

        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Job updated'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': str(e)}), 400

# Delete Job (DELETE)
@blp.route('/delete/<string:job_id>', methods=['DELETE'])
def delete_job(job_id):
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'status': 'error', 'message': 'Job not found'}), 404
        db.session.delete(job)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Job deleted'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': str(e)}), 500
