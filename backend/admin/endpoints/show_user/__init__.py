from flasgger import SwaggerView, swag_from
from verification.jwt import is_admin
from flask import request
from settings import DB

class Accounts(SwaggerView):

	@is_admin
	def get(self):
		accounts = DB.getUsers()
		if accounts:
			return {"message": "ok", "accounts":accounts}
		return {"message": "Database error"}, 500