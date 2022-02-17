"""
Setup of the backend.
Plenty of things here can throw exception and that's good, since settings are called on the start of the backend app
and it's necessary to have everything up and running.
"""

from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
from os import environ as env
from datetime import timedelta
import psycopg2
from psycopg2 import pool
from db import Database
from flasgger import Swagger

DEVELOPMENT_IP = "localhost"
DEVELOPMENT_PORT = 3001
PRODUCTION_IP = "localhost"
PRODUCTION_PORT = 8766

""" Flask webserver setup. """
app = Flask(__name__)
app.secret_key = os.urandom(12)

""" Allowing Cross-Origin Resource Sharing. """
CORS(app)

""" JWT tokens setup. """
app.config["JWT_SECRET_KEY"] = "production secret key DSJF09830E9F8DS08F903280EJW030FM30F03VJ900F9023NV092F092UVJ02FJ2"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=72)
jwt = JWTManager(app)

""" 
Database connection pool setup. 
Setting up max connections in the pool (great resource: https://www.enterprisedb.com/postgres-tutorials/why-you-should-use-connection-pooling-when-setting-maxconnections-postgres).
"""
dbPool = psycopg2.pool.ThreadedConnectionPool(
    minconn=1,
    maxconn=1000,
    host=env.get("DB_HOST"),
    database=env.get("DB_NAME"),
    user=env.get("DB_USER"),
    password=env.get("DB_PASS")
)
DB = Database(dbPool)

""" Swagger (OpenAPI) docs """
swagger = Swagger(
    app,
    config = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec',
                "route": '/apispec.json',
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/apidocs/"
    },
    template = {
        "info": {
            "title": "International interest in sport API Documentation",
            "version": "1.0"
        },
        "host": "localhost:3001",
        "basePath": "/api",
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header"
            }
        },
        "consumes": [
            "application/json",
        ],
        "produces": [
            "application/json",
        ],
    },
)