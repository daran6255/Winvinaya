from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import uuid
from datetime import datetime

from app.database import db
from app.models.training_batch_candidates import TrainingBatchCandidate
from app.models.training_batches import TrainingBatch
from app.models.candidate_registration import CandidateRegistration
from app.helpers.auth_utils import role_required

training_batch_candidates_bp = Blueprint("training_batch_candidates_bp", __name__, url_prefix="/api/v1/training-batch-candidates")


@training_batch_candidates_bp.route("", methods=["POST"])
@jwt_required()
@role_required(["admin", "sourcing"])
def allocate_candidates_to_batch():
    try:
        data = request.get_json()

        required_fields = ["batch_id", "candidate_ids"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                "status": "error",
                "message": f"Missing fields: {missing}"
            }), 400

        # Check if batch exists
        batch = TrainingBatch.query.filter_by(id=data["batch_id"]).first()
        if not batch:
            return jsonify({
                "status": "error",
                "message": "Training batch not found."
            }), 404

        created_ids = []
        for candidate_id in data["candidate_ids"]:
            candidate = CandidateRegistration.query.filter_by(id=candidate_id).first()
            if not candidate:
                return jsonify({
                    "status": "error",
                    "message": f"Candidate with id {candidate_id} not found."
                }), 404

            # Check if already allocated
            existing = TrainingBatchCandidate.query.filter_by(batch_id=data["batch_id"], candidate_id=candidate_id).first()
            if existing:
                continue  # skip duplicate allocation

            allocation = TrainingBatchCandidate(
                id=str(uuid.uuid4()),
                batch_id=data["batch_id"],
                candidate_id=candidate_id
            )
            db.session.add(allocation)
            created_ids.append(allocation.id)

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Allocated {len(created_ids)} candidates to batch.",
            "data": {"allocation_ids": created_ids}
        }), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@training_batch_candidates_bp.route("", methods=["GET"])
@jwt_required()
@role_required(["admin", "sourcing"])
def get_all_allocations():
    try:
        # Get all batches upfront
        batches = TrainingBatch.query.all()
        
        result = []
        for batch in batches:
            # Fetch all allocations for this batch
            allocations = TrainingBatchCandidate.query.filter_by(batch_id=batch.id).all()
            
            candidates_data = []
            for alloc in allocations:
                # Fetch candidate details
                candidate = CandidateRegistration.query.filter_by(id=alloc.candidate_id).first()
                
                candidates_data.append({
                    "id": alloc.id,
                    "candidate_id": candidate.candidate_id if candidate else None,
                    "candidate_name": candidate.name if candidate else None,
                    "created_at": alloc.created_at
                })

            # Only add batches that have allocations
            if candidates_data:
                result.append({
                    "batch_id": batch.id,
                    "batch_name": batch.batch_name,
                    "batch_from": batch.batch_from,
                    "batch_to": batch.batch_to,
                    "candidates": candidates_data
                })

        return jsonify({
            "status": "success",
            "data": result
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@training_batch_candidates_bp.route("/<allocation_id>", methods=["GET"])
@jwt_required()
@role_required(["admin", "sourcing"])
def get_allocation_by_id(allocation_id):
    try:
        alloc = TrainingBatchCandidate.query.filter_by(id=allocation_id).first()
        if not alloc:
            return jsonify({
                "status": "error",
                "message": "Allocation not found."
            }), 404

        batch = TrainingBatch.query.filter_by(id=alloc.batch_id).first()
        candidate = CandidateRegistration.query.filter_by(id=alloc.candidate_id).first()

        result = {
            "id": alloc.id,
            "batch_id": batch.id if batch else None,
            "batch_name": batch.batch_name if batch else None,
            "batch_from": batch.batch_from if batch else None,
            "batch_to": batch.batch_to if batch else None,
            "candidate_id": candidate.candidate_id if candidate else None,
            "candidate_name": candidate.name if candidate else None,
            "created_at": alloc.created_at
        }

        return jsonify({
            "status": "success",
            "data": result
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500



@training_batch_candidates_bp.route("/<allocation_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin", "sourcing"])
def update_allocation(allocation_id):
    try:
        alloc = TrainingBatchCandidate.query.filter_by(id=allocation_id).first()
        if not alloc:
            return jsonify({
                "status": "error",
                "message": "Allocation not found."
            }), 404

        data = request.get_json()

        if "batch_id" in data:
            batch = TrainingBatch.query.filter_by(id=data["batch_id"]).first()
            if not batch:
                return jsonify({
                    "status": "error",
                    "message": "Batch not found."
                }), 404
            alloc.batch_id = data["batch_id"]

        if "candidate_id" in data:
            candidate = CandidateRegistration.query.filter_by(id=data["candidate_id"]).first()
            if not candidate:
                return jsonify({
                    "status": "error",
                    "message": "Candidate not found."
                }), 404
            alloc.candidate_id = data["candidate_id"]

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Allocation updated successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@training_batch_candidates_bp.route("/<allocation_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin", "sourcing"])
def delete_allocation(allocation_id):
    try:
        alloc = TrainingBatchCandidate.query.filter_by(id=allocation_id).first()
        if not alloc:
            return jsonify({
                "status": "error",
                "message": "Allocation not found."
            }), 404

        db.session.delete(alloc)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Allocation deleted successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
