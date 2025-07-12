from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
from datetime import datetime

from app.database import db
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.helpers.auth_utils import role_required
from app.helpers.utils import get_user_info

role_permission_bp = Blueprint("role_permission_bp",__name__,url_prefix="/api/v1")


@role_permission_bp.route("/roles", methods=["POST"])
@jwt_required()
@role_required(["admin"])
def create_role():
    data = request.get_json()
    name = data.get("name")
    description = data.get("description")

    if not name:
        return jsonify({"status": "error", "message": "Role name is required"}), 400

    if Role.query.filter_by(name=name).first():
        return jsonify({"status": "error", "message": "Role already exists"}), 409

    role = Role(
        id=str(uuid.uuid4()),
        name=name,
        description=description
    )
    db.session.add(role)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Role created",
        "role_id": role.id
    }), 201


@role_permission_bp.route("/roles", methods=["GET"])
@jwt_required()
def get_all_roles():
    roles = Role.query.all()
    result = []
    for r in roles:
        result.append({
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "created_at": r.created_at
        })

    return jsonify({"status": "success", "data": result}), 200


@role_permission_bp.route("/roles/<role_id>", methods=["GET"])
@jwt_required()
def get_role_by_id(role_id):
    r = Role.query.filter_by(id=role_id).first()
    if not r:
        return jsonify({"status": "error", "message": "Role not found"}), 404

    result = {
        "id": r.id,
        "name": r.name,
        "description": r.description,
        "created_at": r.created_at
    }
    return jsonify({"status": "success", "data": result}), 200


@role_permission_bp.route("/roles/<role_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin"])
def update_role(role_id):
    r = Role.query.filter_by(id=role_id).first()
    if not r:
        return jsonify({"status": "error", "message": "Role not found"}), 404

    data = request.get_json()
    if "name" in data:
        r.name = data["name"]
    if "description" in data:
        r.description = data["description"]

    db.session.commit()
    return jsonify({"status": "success", "message": "Role updated"}), 200


@role_permission_bp.route("/roles/<role_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin"])
def delete_role(role_id):
    r = Role.query.filter_by(id=role_id).first()
    if not r:
        return jsonify({"status": "error", "message": "Role not found"}), 404

    db.session.delete(r)
    db.session.commit()
    return jsonify({"status": "success", "message": "Role deleted"}), 200


@role_permission_bp.route("/permissions", methods=["POST"])
@jwt_required()
@role_required(["admin"])
def create_permission():
    data = request.get_json()
    name = data.get("name")
    description = data.get("description")

    if not name:
        return jsonify({"status": "error", "message": "Permission name is required"}), 400

    if Permission.query.filter_by(name=name).first():
        return jsonify({"status": "error", "message": "Permission already exists"}), 409

    perm = Permission(
        id=str(uuid.uuid4()),
        name=name,
        description=description
    )
    db.session.add(perm)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Permission created",
        "permission_id": perm.id
    }), 201


@role_permission_bp.route("/permissions", methods=["GET"])
@jwt_required()
def get_all_permissions():
    perms = Permission.query.all()
    result = []
    for p in perms:
        result.append({
            "id": p.id,
            "name": p.name,
            "description": p.description
        })

    return jsonify({"status": "success", "data": result}), 200


@role_permission_bp.route("/permissions/<permission_id>", methods=["GET"])
@jwt_required()
def get_permission_by_id(permission_id):
    p = Permission.query.filter_by(id=permission_id).first()
    if not p:
        return jsonify({"status": "error", "message": "Permission not found"}), 404

    result = {
        "id": p.id,
        "name": p.name,
        "description": p.description
    }
    return jsonify({"status": "success", "data": result}), 200


@role_permission_bp.route("/permissions/<permission_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin"])
def update_permission(permission_id):
    p = Permission.query.filter_by(id=permission_id).first()
    if not p:
        return jsonify({"status": "error", "message": "Permission not found"}), 404

    data = request.get_json()
    if "name" in data:
        p.name = data["name"]
    if "description" in data:
        p.description = data["description"]

    db.session.commit()
    return jsonify({"status": "success", "message": "Permission updated"}), 200


@role_permission_bp.route("/permissions/<permission_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin"])
def delete_permission(permission_id):
    p = Permission.query.filter_by(id=permission_id).first()
    if not p:
        return jsonify({"status": "error", "message": "Permission not found"}), 404

    db.session.delete(p)
    db.session.commit()
    return jsonify({"status": "success", "message": "Permission deleted"}), 200


@role_permission_bp.route("/role-permissions", methods=["POST"])
@jwt_required()
@role_required(["admin"])
def create_role_permission():
    data = request.get_json()
    role_id = data.get("role_id")
    permission_id = data.get("permission_id")

    if not role_id or not permission_id:
        return jsonify({"status": "error", "message": "Both role_id and permission_id are required."}), 400

    # Ensure both exist
    role = Role.query.filter_by(id=role_id).first()
    perm = Permission.query.filter_by(id=permission_id).first()
    if not role or not perm:
        return jsonify({"status": "error", "message": "Role or Permission does not exist."}), 404

    # Prevent duplicates
    existing = RolePermission.query.filter_by(
        role_id=role_id,
        permission_id=permission_id
    ).first()
    if existing:
        return jsonify({"status": "error", "message": "RolePermission mapping already exists."}), 409

    mapping = RolePermission(
        id=str(uuid.uuid4()),
        role_id=role_id,
        permission_id=permission_id
    )
    db.session.add(mapping)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "RolePermission mapping created.",
        "mapping_id": mapping.id
    }), 201


@role_permission_bp.route("/role-permissions", methods=["GET"])
@jwt_required()
def get_all_role_permissions():
    mappings = RolePermission.query.all()
    result = []
    for m in mappings:
        role = Role.query.filter_by(id=m.role_id).first()
        perm = Permission.query.filter_by(id=m.permission_id).first()

        result.append({
            "id": m.id,
            "role_id": m.role_id,
            "role_name": role.name if role else None,
            "permission_id": m.permission_id,
            "permission_name": perm.name if perm else None
        })

    return jsonify({"status": "success", "data": result}), 200


@role_permission_bp.route("/role-permissions/<mapping_id>", methods=["GET"])
@jwt_required()
def get_role_permission_by_id(mapping_id):
    m = RolePermission.query.filter_by(id=mapping_id).first()
    if not m:
        return jsonify({"status": "error", "message": "RolePermission mapping not found"}), 404

    role = Role.query.filter_by(id=m.role_id).first()
    perm = Permission.query.filter_by(id=m.permission_id).first()

    result = {
        "id": m.id,
        "role_id": m.role_id,
        "role_name": role.name if role else None,
        "permission_id": m.permission_id,
        "permission_name": perm.name if perm else None
    }
    return jsonify({"status": "success", "data": result}), 200


@role_permission_bp.route("/role-permissions/<mapping_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin"])
def update_role_permission(mapping_id):
    m = RolePermission.query.filter_by(id=mapping_id).first()
    if not m:
        return jsonify({"status": "error", "message": "Mapping not found"}), 404

    data = request.get_json()
    if "role_id" in data:
        role = Role.query.filter_by(id=data["role_id"]).first()
        if not role:
            return jsonify({"status": "error", "message": "Role does not exist."}), 404
        m.role_id = data["role_id"]

    if "permission_id" in data:
        perm = Permission.query.filter_by(id=data["permission_id"]).first()
        if not perm:
            return jsonify({"status": "error", "message": "Permission does not exist."}), 404
        m.permission_id = data["permission_id"]

    db.session.commit()
    return jsonify({"status": "success", "message": "Mapping updated"}), 200


@role_permission_bp.route("/role-permissions/<mapping_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin"])
def delete_role_permission(mapping_id):
    m = RolePermission.query.filter_by(id=mapping_id).first()
    if not m:
        return jsonify({"status": "error", "message": "Mapping not found"}), 404

    db.session.delete(m)
    db.session.commit()
    return jsonify({"status": "success", "message": "Mapping deleted"}), 200
