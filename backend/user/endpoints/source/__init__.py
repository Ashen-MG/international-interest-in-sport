from flasgger import SwaggerView, swag_from
from settings import DB

class ShowSourceView(SwaggerView):

    def get(self, countryCode: str):
        res = {"message": "ok", "data": DB.getFundingSourceByCountry(countryCode)}
        return res
