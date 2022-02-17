from typing import Any


class Status:
	OK = "ok"
	ERROR = "error"

class Response:
	""" JSON response structure. """

	@staticmethod
	def get(status: Status, message: str, data: Any = None) -> dict:
		return {"status": status, message: message, data: data}


class UserTypes:
	SECRETARY = 0
	ADMIN = 1
