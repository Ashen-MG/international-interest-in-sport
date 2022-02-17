from flasgger import SwaggerView, swag_from
from settings import DB

class CountriesView(SwaggerView):

	@swag_from("get.yml")
	def get(self):
		res = {"message": "ok", "countries": DB.getAllCountries()}
		return res
