from flasgger import SwaggerView, swag_from
from settings import DB

class ShowInterconnectnessTypeView(SwaggerView):

    @swag_from("get.yml")
    def get(self):
        res = {"message": "ok", "data": DB.getInterconnTypes()}
        return res
