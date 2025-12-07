from flask import Blueprint, request, jsonify
from ..models.sourcing import Sourcing
from ..models.candidates import Candidate
from ..database import db

blp = Blueprint("sourcing", __name__, url_prefix="/sourcing")

@blp.route("/add", methods=["POST"])
def add_sourcing():
    """
    Create a sourcing record for a candidate.
    """
    try:
        data = request.get_json()
        candidate_id = data.get("candidate_id")
        
        candidate = Candidate.query.get(candidate_id)
        if not candidate:
            return jsonify({"status": "error", "result": "Candidate not found"}), 404

        sourcing = Sourcing(
            candidate_id = candidate_id,
            trained_by_winvinaya = data.get("trained_by_winvinaya"),
            batch_id = data.get("batch_id"),
            domain = data.get("domain"),
            duration_from_month = data.get("duration_from_month"),
            duration_from_year = data.get("duration_from_year"),
            duration_to_month = data.get("duration_to_month"),
            duration_to_year = data.get("duration_to_year"),
            willing_for_training = data.get("willing_for_training"),
            skills = data.get("skills", [])
        )

        db.session.add(sourcing)
        db.session.commit()

        return jsonify({"status": "success", "result": "Sourcing record added"}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Failed to add sourcing record"}), 500


@blp.route("/update/<string:sourcing_id>", methods=["PUT"])
def update_sourcing(sourcing_id):
    """
    Update sourcing record by ID.
    """
    try:
        data = request.get_json()
        sourcing = Sourcing.query.get(sourcing_id)
        if not sourcing:
            return jsonify({"status": "error", "result": "Sourcing record not found"}), 404

        # Update only provided fields
        for field in data:
            if hasattr(sourcing, field):
                setattr(sourcing, field, data[field])

        db.session.commit()
        return jsonify({"status": "success", "result": "Sourcing record updated"})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Failed to update sourcing record"}), 500


@blp.route("/get/<string:sourcing_id>", methods=["GET"])
def get_sourcing_by_id(sourcing_id):
    """
    Get sourcing record by ID.
    """
    try:
        sourcing = Sourcing.query.get(sourcing_id)
        if not sourcing:
            return jsonify({"status": "error", "result": "Sourcing record not found"}), 404

        result = {
            "id": sourcing.id,
            "candidate_id": sourcing.candidate_id,
            "trained_by_winvinaya": sourcing.trained_by_winvinaya,
            "batch_id": sourcing.batch_id,
            "domain": sourcing.domain,
            "duration_from_month": sourcing.duration_from_month,
            "duration_from_year": sourcing.duration_from_year,
            "duration_to_month": sourcing.duration_to_month,
            "duration_to_year": sourcing.duration_to_year,
            "willing_for_training": sourcing.willing_for_training,
            "skills": sourcing.skills,
            "created_at": sourcing.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        return jsonify({"status": "success", "result": result})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Failed to fetch sourcing record"}), 500


@blp.route("/get_all", methods=["GET"])
def get_all_sourcing():
    """
    Get all sourcing records.
    """
    try:
        sourcings = Sourcing.query.all()
        result = []
        for s in sourcings:
            result.append({
                "id": s.id,
                "candidate_id": s.candidate_id,
                "trained_by_winvinaya": s.trained_by_winvinaya,
                "batch_id": s.batch_id,
                "domain": s.domain,
                "duration_from_month": s.duration_from_month,
                "duration_from_year": s.duration_from_year,
                "duration_to_month": s.duration_to_month,
                "duration_to_year": s.duration_to_year,
                "willing_for_training": s.willing_for_training,
                "skills": s.skills,
                "created_at": s.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })
        return jsonify({"status": "success", "result": result})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Failed to fetch sourcing records"}), 500


@blp.route("/delete/<string:sourcing_id>", methods=["DELETE"])
def delete_sourcing(sourcing_id):
    """
    Delete sourcing record by ID.
    """
    try:
        sourcing = Sourcing.query.get(sourcing_id)
        if not sourcing:
            return jsonify({"status": "error", "result": "Sourcing record not found"}), 404

        db.session.delete(sourcing)
        db.session.commit()

        return jsonify({"status": "success", "result": "Sourcing record deleted"})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "result": "Failed to delete sourcing record"}), 500
