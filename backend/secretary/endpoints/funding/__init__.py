from flask import request
from flasgger import SwaggerView, swag_from
import csv_parsers.csvParser as parser
from verification.jwt import is_secretary
import json
from settings import DB

class Funding(SwaggerView):

	@is_secretary
	@swag_from("post.yml")
	def post(self):
		if len(request.files) == 0:
			return {"message": "Missing uploaded file."}, 400

		requestJSON = json.loads(request.form["json"])
		correction = requestJSON.get("correction")
		countryCode = requestJSON.get("countryCode")
		currency = requestJSON.get("currency")
		file = request.files["csvFile"]

		if not file:
			return {"message": "Missing required parameter: `csvFile`.", "data": {}}, 400
		if correction is None:
			return {"message": "Missing required parameter: `correction`.", "data": {}}, 400
		if not countryCode:
			return {"message": "Missing required parameter: `countryCode`.", "data": {}}, 400
		if not currency:
			return {"message": "Missing required parameter: `currency`.", "data": {}}, 400

		DB.createDatabaseBackup()

		lines = []
		for line in file:
			lines.append(line.decode("utf-8").strip())

		p = parser.csvParser()
		suggestions = p.findFailures(lines, correction, countryCode, currency)

		if len(suggestions) == 0:
			p.saveResults()
			return {"message": "ok"}
		else:
			return {"message": "fail", "suggestions": suggestions}, 400
