from flasgger import SwaggerView, swag_from
from verification.jwt import is_admin_or_secretary
from settings import DB

class BranchesWithSports(SwaggerView):

	@is_admin_or_secretary
	@swag_from("get.yml")
	def get(self):
		return {"message": "ok", "branchesWithSports": DB.getBranchesWithSports()}
