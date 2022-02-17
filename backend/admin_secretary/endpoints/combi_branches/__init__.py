from flasgger import SwaggerView, swag_from
from verification.jwt import is_admin_or_secretary
from flask import request
from settings import DB

class CombiBranches(SwaggerView):

	@is_admin_or_secretary
	@swag_from("get.yml")
	def get(self):
		return {"message": "ok", "combiBranches": DB.showCombiBranches()}

	@is_admin_or_secretary
	@swag_from("post.yml")
	def post(self):
		ok = DB.addCombiBranch(request.json)
		if ok:
			return {"message": "ok"}
		return {"message": "Database error"}, 500
