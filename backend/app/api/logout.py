from flask import Blueprint, jsonify, make_response
from flask_jwt_extended import jwt_required

blp = Blueprint("logout", __name__, url_prefix="/auth")

@blp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """
    Logout the user by deleting the JWT cookie.
    """
    response = make_response(jsonify({"msg": "Logout successful"}))
    response.delete_cookie('access_token_cookie')
    return response
