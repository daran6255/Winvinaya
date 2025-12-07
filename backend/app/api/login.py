from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash
from datetime import timedelta
from ..models.admin_users import User
from ..database import db

blp = Blueprint("auth", __name__, url_prefix="/auth")

@blp.route("/login", methods=["POST"])
def login():
    result = {
        "status": "error",
        "result": "An error occurred while processing your request",
    }

    if request.method == "POST":
        req = request.get_json()
        email = req.get("email")
        password = req.get("password")

        try:
            # Query user by email
            user = User.query.filter_by(email=email).first()

            if user:
                if check_password_hash(user.password, password):
                    # Create JWT token with 10-day expiration
                    expires = timedelta(days=10)
                    access_token = create_access_token(
                        identity=user.email, expires_delta=expires
                    )

                    response = make_response({
                        "status": "success",
                        "token": access_token,
                        "result": {
                            "id": user.id,
                            "name": user.name,
                            "email": user.email,
                            "verified": user.verified,
                            "role": user.role,
                        },
                    })

                    # Optional: set JWT token in cookie
                    # response.set_cookie(
                    #     'access_token_cookie', access_token, httponly=True, samesite='Strict'
                    # )

                    return response
                else:
                    result = {"status": "error", "result": "Invalid email or password"}
            else:
                result = {"status": "error", "result": "Email not found. Please register"}

        except Exception as e:
            print(f"Error during login: {e}")
            result = {"status": "error", "result": "An internal error occurred"}

    return jsonify(result)
