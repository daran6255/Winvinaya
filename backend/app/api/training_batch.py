from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
import uuid

from app.database import db
from app.models.training_batches import TrainingBatch
from app.helpers.auth_utils import role_required

training_batches_bp = Blueprint("training_batches_bp", __name__, url_prefix="/api/v1/training-batches")


@training_batches_bp.route("", methods=["POST"])
@jwt_required()
@role_required(["admin", "sourcing"])
def create_training_batch():
    try:
        data = request.get_json()

        required_fields = ["domain", "batch_name", "batch_from", "batch_to"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                "status": "error",
                "message": f"Missing fields: {missing}"
            }), 400

        batch = TrainingBatch(
            id=str(uuid.uuid4()),
            domain=data["domain"],
            batch_name=data["batch_name"],
            batch_from=data["batch_from"],
            batch_to=data["batch_to"]
        )

        db.session.add(batch)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Training Batch created successfully.",
            "data": {"id": batch.id}
        }), 201

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@training_batches_bp.route("", methods=["GET"])
@jwt_required()
@role_required(["admin", "sourcing"])
def get_all_training_batches():
    try:
        batches = TrainingBatch.query.all()
        result = []
        for batch in batches:
            result.append({
                "id": batch.id,
                "domain": batch.domain,
                "batch_name": batch.batch_name,
                "batch_from": batch.batch_from,
                "batch_to": batch.batch_to,
                "created_at": batch.created_at,
                "updated_at": batch.updated_at,
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


@training_batches_bp.route("/<batch_id>", methods=["GET"])
@jwt_required()
@role_required(["admin", "sourcing"])
def get_training_batch(batch_id):
    try:
        batch = TrainingBatch.query.filter_by(id=batch_id).first()
        if not batch:
            return jsonify({
                "status": "error",
                "message": "Training Batch not found."
            }), 404

        result = {
            "id": batch.id,
            "domain": batch.domain,
            "batch_name": batch.batch_name,
            "batch_from": batch.batch_from,
            "batch_to": batch.batch_to,
            "created_at": batch.created_at,
            "updated_at": batch.updated_at,
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


@training_batches_bp.route("/<batch_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin", "sourcing"])
def update_training_batch(batch_id):
    try:
        batch = TrainingBatch.query.filter_by(id=batch_id).first()
        if not batch:
            return jsonify({
                "status": "error",
                "message": "Training Batch not found."
            }), 404

        data = request.get_json()

        for key, value in data.items():
            if hasattr(batch, key):
                setattr(batch, key, value)

        batch.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Training Batch updated successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@training_batches_bp.route("/<batch_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin", "sourcing"])
def delete_training_batch(batch_id):
    try:
        batch = TrainingBatch.query.filter_by(id=batch_id).first()
        if not batch:
            return jsonify({
                "status": "error",
                "message": "Training Batch not found."
            }), 404

        db.session.delete(batch)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Training Batch deleted successfully."
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
