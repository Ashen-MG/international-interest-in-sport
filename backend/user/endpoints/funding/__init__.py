from flasgger import SwaggerView, swag_from
from settings import DB

class ShowFundingView(SwaggerView):

    @swag_from("get.yml")
    def get(self, countryCode: str):
        res = {"message": "ok", "data": DB.getFundingData(countryCode)}
        return res
