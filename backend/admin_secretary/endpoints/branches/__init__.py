from flasgger import SwaggerView, swag_from
from verification.jwt import is_admin_or_secretary
from flask import request
from settings import DB

class Branches(SwaggerView):

	@is_admin_or_secretary
	@swag_from("post.yml")
	def post(self):
		DB.addBranch(request.json)
		return {"message": "ok"}
