from flask import request
from flasgger import SwaggerView, swag_from
from flask_jwt_extended import create_access_token
from helpers import hashPassword
from app_types import UserTypes
from settings import DB

class LoginView(SwaggerView):

	@swag_from("post.yml")
	def post(self):
		if not request.json:
			return {"message": "Missing JSON body.", "data": {}}, 400

		email = request.json.get("email")
		password = request.json.get("password")

		if not email:
			return {"message": "Missing required parameter: `email`.", "data": {}}, 400
		if not password:
			return {"message": "Missing required parameter: `password`.", "data": {}}, 400

		secretary = DB.getSecretary(email)
		if not secretary:
			return {"message": "Nesprávny email alebo heslo.", "data": {}}, 400

		dbPasswordHash = bytes.fromhex(secretary["password"])
		dbPasswordSalt = dbPasswordHash[:32]
		dbPasswordHash = dbPasswordHash[32:]

		if hashPassword(password, dbPasswordSalt) != dbPasswordHash:
			return {"message": "Nesprávny email alebo heslo.", "data": {}}, 400

		return {"message": "ok", "data": {
				"accessToken": create_access_token(
					identity=email,
					additional_claims={"userType": UserTypes.SECRETARY}
				)
			}
    }