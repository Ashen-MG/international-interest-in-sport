# First time running

Install python 3.7+<br>
Create virtual environment <br>
On Windows:
<code>python -m venv venv</code><br>
On Linux:
<code>python3 -m venv venv</code>

Switch to your virtual environment in terminal using: <br>
<code>.\venv\Scripts\activate</code> on Windows<br>
<code>source venv/bin/activate</code> on Linux.

Optionally upgrade pip: <br>
<code>pip install --upgrade pip</code>

Install all required dependencies from the active terminal:<br>
<code>pip install -r requirements.txt</code> on Windows<br>
<code>pip3 install -r requirements.txt</code> on Linux.

# How to run the server

Switch to your virtual environment in terminal using: <br>
<code>.\venv\Scripts\activate</code> on Windows<br>
<code>source venv/bin/activate</code> on Linux.

Then start the server using <br>
<code>python app.py dev</code> on Windows <br>
<code>python3 app.py dev</code> on Linux.

# TL;DR
Always make sure you're in your virtual environment and 
before pushing to a repository use command<br>
<code>pip freeze > requirements.txt</code><br>,
which will ensure that all members of a team are going to be able to install
correct dependencies.