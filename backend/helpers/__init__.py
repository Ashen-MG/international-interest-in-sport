from hashlib import pbkdf2_hmac

def hashPassword(key, salt):
	password_hash = pbkdf2_hmac('sha256', key.encode("utf-8"), salt, 100000, dklen=128)
	return password_hash