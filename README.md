# International interest in sport

## Deployment to production

### Linux server dependencies (recommended)
1. Python3 (3.7+)
2. PostgreSQL
3. Nginx
4. Gunicorn3

### Frontend
Clone locally the repository and install all dependencies (described in frontend/README.md).<br>
Run `npm run build` and move build directory to a server e.g. using <br>
`scp -r frontend/build/* SERVER_USERNAME@SERVER_ADDRESS:SERVER_PATH_TO_FRONTEND`

### Backend
1. Create Python virtual environment (described in backend/README.md).
2. Clone the repository on the server.
3. Start the environment.
4. Install python dependencies (described in backend/README.md).
5. Create and generate a PostgreSQL database:
    1. `psql -U DB_USER -d DB_NAME`
    2. `\i backend/db/create_script.txt`
    3. `\i backend/db/gen_script.txt`

### Linux server configuration
#### Nginx
1. Make sure that nginx is installed, up and running.
2. Add nginx configuration to /etc/nginx/sites-available and link the file into
   /etc/nginx/sites-enabled.
<pre>
# Nginx configuration
server {
    # SSL configuration
    listen PORT_NUMBER ssl;
    listen [::]:PORT_NUMBER ssl;
    ssl_certificate     PATH/fullchain.pem;
    ssl_certificate_key PATH/privkey.pem;

    root PATH_TO_FRONTEND_BUILD;

    index index.html index.htm index.nginx-debian.html;
    
    server_name HTTP_ADDRESS_OR_IP;
    
    # Frontend routing
    location / {
        # First attempt to serve request as file, then
        # as directory, then fall back to displaying a 404.
        try_files $uri /index.html $uri/ =404;
    }
    
    # API (backend) routing
    location /api/ {
        proxy_pass http://localhost:API_PORT_NUMBER;
    }
}
</pre>

#### Gunicorn3
1. Create environmental variables: DB_HOST, DB_NAME, DB_USER and DB_PASS.
2. From the backend directory run <br>
   `gunicorn3 -b 0.0.0.0:API_PORT_NUMBER app:app` to safely start the backend code.

Ideally, run the gunicorn3 WSGI server automatically in the background e.g. using sh script:
<pre>
#!/bin/bash

APP_PATH=PATH_TO_BACKEND_DIR

export DB_HOST=...
export DB_NAME=...
export DB_USER=...
export DB_PASS=...

exec PATH_TO_GUNICORN --chdir ${APP_PATH} app:app -b 0.0.0.0:API_PORT_NUMBER
</pre>

<hr>

Reload the nginx service `nginx reload` and test if the web app is publicly available.

### Tips
* letsencrypt certificates are easy to generate in nginx configuration with a `certbot --nginx` util.
* Supervisor might be used to control automatically gunicorn and flask backend.