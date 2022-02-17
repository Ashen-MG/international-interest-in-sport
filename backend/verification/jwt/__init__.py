from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt
from app_types import UserTypes, Status, Response

def is_secretary(f):
	"""
	Request validation with JWT token.
	Use this decorator on any route that needs authetication of a secretary.
	"""
	@jwt_required()
	@wraps(f)
	def decorated_function(*args, **kwargs):
		jwtData = get_jwt()
		userType = jwtData.get("userType")
		if userType == UserTypes.SECRETARY:
			return f(*args, **kwargs)
		return Response.get(status=Status.ERROR, message="Invalid token")
	return decorated_function

def is_admin(f):
	"""
	Request validation with JWT token.
	Use this decorator on any route that needs authetication of an admin.
	"""
	@jwt_required()
	@wraps(f)
	def decorated_function(*args, **kwargs):
		jwtData = get_jwt()
		userType = jwtData.get("userType")
		if userType == UserTypes.ADMIN:
			return f(*args, **kwargs)
		return Response.get(status=Status.ERROR, message="Invalid token")
	return decorated_function

def is_admin_or_secretary(f):
	"""
	Request validation with JWT token.
	Use this decorator on any route that has shared access for a secretary and admin.
	"""
	@jwt_required()
	@wraps(f)
	def decorated_function(*args, **kwargs):
		jwtData = get_jwt()
		userType = jwtData.get("userType")
		if userType == UserTypes.SECRETARY or userType == UserTypes.ADMIN:
			return f(*args, **kwargs)
		return Response.get(status=Status.ERROR, message="Invalid token")
	return decorated_function