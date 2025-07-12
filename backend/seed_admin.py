from flask.cli import with_appcontext
import click
from werkzeug.security import generate_password_hash
from app import create_app
from app.database import db
from app.models.user import User
from app.models.role import Role
from app.models.user_role import UserRole
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from datetime import datetime
import uuid

@click.command("seed-admin")
@with_appcontext
def seed_admin():
    # === Create Roles ===
    role_names = [
        "admin",
        "manager",
        "data_analyst",
        "sourcing",
        "trainer",
        "placement"
    ]

    roles = {}
    for role_name in role_names:
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            role = Role(
                id=str(uuid.uuid4()),
                name=role_name,
                description=f"{role_name.capitalize()} role with specific responsibilities",
                created_at=datetime.utcnow()
            )
            db.session.add(role)
        roles[role_name] = role

    # === Create Admin User ===
    admin_email = "info@winvinaya.com"
    admin_user = User.query.filter_by(email=admin_email).first()
    if not admin_user:
        admin_user = User(
            id=str(uuid.uuid4()),
            username="dharanidaran-admin",
            email=admin_email,
            password_hash=generate_password_hash("12345"),
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.session.add(admin_user)

    # === Assign admin role to the user ===
    admin_role = roles["admin"]
    user_role = UserRole.query.filter_by(
        user_id=admin_user.id,
        role_id=admin_role.id
    ).first()
    if not user_role:
        user_role = UserRole(
            id=str(uuid.uuid4()),
            user_id=admin_user.id,
            role_id=admin_role.id,
            assigned_at=datetime.utcnow()
        )
        db.session.add(user_role)

    # === Create Permissions ===
    permission_names = [
        "view_dashboard",
        "manage_users",
        "assign_roles",
        "edit_settings"
    ]

    permissions = {}
    for perm_name in permission_names:
        perm = Permission.query.filter_by(name=perm_name).first()
        if not perm:
            perm = Permission(
                id=str(uuid.uuid4()),
                name=perm_name,
                description=f"Permission to {perm_name.replace('_', ' ')}"
            )
            db.session.add(perm)
        permissions[perm_name] = perm

    # === Assign all permissions to admin role ===
    for perm in permissions.values():
        rp = RolePermission.query.filter_by(
            role_id=admin_role.id,
            permission_id=perm.id
        ).first()
        if not rp:
            rp = RolePermission(
                id=str(uuid.uuid4()),
                role_id=admin_role.id,
                permission_id=perm.id
            )
            db.session.add(rp)

    db.session.commit()
    print("✅ Admin user, roles, and permissions seeded successfully.")
