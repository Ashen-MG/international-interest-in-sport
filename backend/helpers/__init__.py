from hashlib import pbkdf2_hmac
import os

def hashPassword(key, salt):
	password_hash = pbkdf2_hmac('sha256', key.encode("utf-8"), salt, 100000, dklen=128)
	return password_hash

def createPassword(newPasword):
	salt = os.urandom(32)
	password_hashed = salt + pbkdf2_hmac('sha256', newPasword.encode("utf-8"), salt, 100000, dklen=128)
	return password_hashed