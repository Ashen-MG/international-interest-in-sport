from flasgger import SwaggerView, swag_from
from settings import DB
from flask import request


class ShowSuccessView(SwaggerView):

    @swag_from("get.yml")
    def post(self):
        code = request.json.get("code")
        res = {"message": "ok", "data": DB.getSuccessBySport(code)}
        return res