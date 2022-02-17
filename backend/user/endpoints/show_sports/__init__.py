from flasgger import SwaggerView
from settings import DB


class ShowSportsView(SwaggerView):

    def get(self):
        res = {"message": "ok", "sports": DB.getAllSports()}
        return res
