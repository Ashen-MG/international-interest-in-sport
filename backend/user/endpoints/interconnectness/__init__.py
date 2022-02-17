from flasgger import SwaggerView, swag_from
from settings import DB

class ShowInterconnectnessView(SwaggerView):

    @swag_from("get.yml")
    def get(self, countryCode: str, interconnectednessType: int):
        res = {"message": "ok", "data": DB.getInterconnectnessData(interconnectednessType, countryCode)}
        return res
