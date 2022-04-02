from flasgger import SwaggerView, swag_from
from verification.jwt import is_admin
from flask import request
from settings import DB


class AddUser(SwaggerView):

    @is_admin
    @swag_from("post.yml")
    def post(self):
        if not request.json:
            return {"message": "Missing JSON body.", "data": {}}, 400
        if "email" not in request.json:
            return {"message": "Missing parameter"}, 400
        if "password" not in request.json:
            return {"message": "Missing parameter"}, 400
        if "type" not in request.json:
            return {"message": "Missing parameter"}, 400

        if request.json["type"] == "admin":
            DB.addAdmin(request.json["email"], request.json["password"])
        else:
            DB.addSecretary(request.json["email"], request.json["password"])

        #  todo check if insertion was successful
        return {"message": "ok"}