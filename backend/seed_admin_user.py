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

@click.command("seed-dharanidaran-admin")
@with_appcontext
def seed_dharanidaran_admin():
    # === Ensure admin role exists ===
    admin_role = Role.query.filter_by(name="admin").first()
    if not admin_role:
        admin_role = Role(
            id=str(uuid.uuid4()),
            name="admin",
            description="Admin role with full access",
            created_at=datetime.utcnow()
        )
        db.session.add(admin_role)

    # === Create user ===
    user_email = "dharanidaran.a@winvinaya.com"
    user = User.query.filter_by(email=user_email).first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            username="dharanidaran",
            email=user_email,
            password_hash=generate_password_hash("12345"),
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.session.add(user)

    # === Assign admin role to user ===
    user_role = UserRole.query.filter_by(
        user_id=user.id,
        role_id=admin_role.id
    ).first()
    if not user_role:
        user_role = UserRole(
            id=str(uuid.uuid4()),
            user_id=user.id,
            role_id=admin_role.id,
            assigned_at=datetime.utcnow()
        )
        db.session.add(user_role)

    # === Create and assign permissions to admin role ===
    permission_names = [
        "view_dashboard",
        "manage_users",
        "assign_roles",
        "edit_settings"
    ]
    for name in permission_names:
        perm = Permission.query.filter_by(name=name).first()
        if not perm:
            perm = Permission(
                id=str(uuid.uuid4()),
                name=name,
                description=f"Permission to {name.replace('_', ' ')}"
            )
            db.session.add(perm)
            db.session.flush()  # Ensure ID is available for FK assignment

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
    print("✅ Admin user 'dharanidaran' seeded successfully with role and permissions.")
