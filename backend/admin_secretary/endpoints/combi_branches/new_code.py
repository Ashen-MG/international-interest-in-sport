from flasgger import SwaggerView, swag_from
from verification.jwt import is_admin_or_secretary
from settings import DB

class BranchCode(SwaggerView):

	@is_admin_or_secretary
	@swag_from("new_code_get.yml")
	def get(self):
		return {"message": "ok", "newCombiBranchCode": DB.suggestNewCombiBranchCode()}
