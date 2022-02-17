from flasgger import SwaggerView, swag_from
import importlib  # can be resolved by removing '-' from the data-computation name
datacomputation = importlib.import_module("data-computation")

class ShowChartView(SwaggerView):

    @swag_from("get.yml")
    def get(self, countryCode: str):
        c = datacomputation.Computations()
        res = {"message": "ok", "data": c.getFinalOrderByCountryCode(countryCode)}
        return res
