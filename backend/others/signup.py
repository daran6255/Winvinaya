from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from ..models.admin_users import User
from ..database import db

blp = Blueprint("signup", __name__, url_prefix="/oauth")

@blp.route("/signup", methods=["POST"])
def signup():
    """Register a new admin user based on allowed roles and emails."""
    result = {
        "status": "error",
        "result": "An error occurred while processing your request",
    }

    try:
        req = request.get_json()
        name = req.get("name")
        email = req.get("email")
        password = req.get("password")

        # Input validation
        if not name or not email or not password:
            result["result"] = "Name, email, and password are required."
            return jsonify(result), 400

        # Email-role verification logic
        email_role_map = {
            "info@winvinaya.com": "admin",
            "placement@winvinayafoundation.org": "Placement",
            "sourcing@winvinayafoundation.org": "Sourcing",
        }

        role = email_role_map.get(email)
        verified = bool(role)  # Only valid emails will result in True

        if not verified:
            result["result"] = "This email is not authorized for signup."
            return jsonify(result), 403

        # Check if email is already registered
        if User.query.filter_by(email=email).first():
            result["result"] = "Email is already registered."
            return jsonify(result), 409

        # Hash the password for security
        hashed_password = generate_password_hash(password)

        # Create a new user instance
        new_user = User(
            name=name,
            email=email,
            password=hashed_password,
            verified=verified,
            role=role,
        )

        # Save to DB
        db.session.add(new_user)
        db.session.commit()

        # Success response
        result = {
            "status": "success",
            "result": f"User '{email}' registered successfully with role '{role}'.",
        }
        return jsonify(result), 201

    except Exception as e:
        print(f"Error during signup: {e}")
        result["result"] = "An internal error occurred."
        return jsonify(result), 500
