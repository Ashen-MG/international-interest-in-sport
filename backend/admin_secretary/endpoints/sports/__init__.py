from flasgger import SwaggerView, swag_from
from verification.jwt import is_admin_or_secretary
from flask import request
from settings import DB

class Sports(SwaggerView):

	@is_admin_or_secretary
	@swag_from("get.yml")
	def get(self):
		return {"message": "ok", "sports": DB.getAllSports()}

	@is_admin_or_secretary
	@swag_from("post.yml")
	def post(self):
		code = request.json.get("code")
		title = request.json.get("title")
		ok = DB.addSport(code, title)
		if ok:
			return {"message": "ok"}
		return {"message": "Database error"}, 500

