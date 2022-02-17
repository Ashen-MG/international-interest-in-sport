from flasgger import SwaggerView, swag_from
from verification.jwt import is_admin
from flask import request
from settings import DB

class Sports(SwaggerView):

	@is_admin
	@swag_from("put.yml")
	def put(self):
		if not request.json:
			return {"message": "Missing JSON body.", "data": {}}, 400
		ok = DB.updateSport(request.json)
		if ok:
			return {"message": "ok"}
		return {"message": "Database error"}, 500
