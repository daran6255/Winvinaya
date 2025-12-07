from flask import Blueprint, request, jsonify
from datetime import datetime
from ..models.jobmela import JobMela
from ..database import db

blp = Blueprint("jobmela", __name__, url_prefix="/jobmela")

# Create a new JobMela entry
@blp.route("/add", methods=["POST"])
def create_jobmela():
    try:
        data = request.get_json()
        jobmela = JobMela(
            jobmela_name=data.get("jobmela_name"),
            jobmela_date=datetime.strptime(data.get("jobmela_date"), "%Y-%m-%d"),
            jobmela_location=data.get("jobmela_location"),
            jobmela_partner=data.get("jobmela_partner"),
        )
        db.session.add(jobmela)
        db.session.commit()
        return jsonify({"status": "success", "result": {"id": jobmela.id}}), 201
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Failed to create Job Mela"}), 500

# Get all JobMela entries
@blp.route("/get_all", methods=["GET"])
def get_all_jobmelas():
    try:
        jobmelas = JobMela.query.all()
        result = [{
            "id": jm.id,
            "jobmela_name": jm.jobmela_name,
            "jobmela_date": jm.jobmela_date.strftime("%Y-%m-%d"),
            "jobmela_location": jm.jobmela_location,
            "jobmela_partner": jm.jobmela_partner,
            "created_at": jm.created_at.strftime("%Y-%m-%d %H:%M:%S")
        } for jm in jobmelas]

        return jsonify({"status": "success", "result": result})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Failed to fetch Job Melas"}), 500

# Get a specific JobMela by ID
@blp.route("/get/<string:jobmela_id>", methods=["GET"])
def get_jobmela_by_id(jobmela_id):
    try:
        jm = JobMela.query.get(jobmela_id)
        if jm:
            result = {
                "id": jm.id,
                "jobmela_name": jm.jobmela_name,
                "jobmela_date": jm.jobmela_date.strftime("%Y-%m-%d"),
                "jobmela_location": jm.jobmela_location,
                "jobmela_partner": jm.jobmela_partner,
                "created_at": jm.created_at.strftime("%Y-%m-%d %H:%M:%S")
            }
            return jsonify({"status": "success", "result": result})
        return jsonify({"status": "error", "result": "Job Mela not found"}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Failed to fetch Job Mela"}), 500

# Update a JobMela by ID
@blp.route("/update/<string:jobmela_id>", methods=["PUT"])
def update_jobmela(jobmela_id):
    try:
        data = request.get_json()
        jm = JobMela.query.get(jobmela_id)
        if not jm:
            return jsonify({"status": "error", "result": "Job Mela not found"}), 404

        jm.jobmela_name = data.get("jobmela_name", jm.jobmela_name)
        date_str = data.get("jobmela_date")
        if date_str:
            jm.jobmela_date = datetime.strptime(date_str, "%Y-%m-%d")
        jm.jobmela_location = data.get("jobmela_location", jm.jobmela_location)
        jm.jobmela_partner = data.get("jobmela_partner", jm.jobmela_partner)

        db.session.commit()
        return jsonify({"status": "success", "result": "Job Mela updated successfully"})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Failed to update Job Mela"}), 500

# Delete a JobMela by ID
@blp.route("/delete/<string:jobmela_id>", methods=["DELETE"])
def delete_jobmela(jobmela_id):
    try:
        jm = JobMela.query.get(jobmela_id)
        if not jm:
            return jsonify({"status": "error", "result": "Job Mela not found"}), 404

        db.session.delete(jm)
        db.session.commit()
        return jsonify({"status": "success", "result": "Job Mela deleted successfully"})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Failed to delete Job Mela"}), 500
