from flask import Flask
from routes.views import views_bp
from src.clientesCoop import *
from templates import *
from src.loginCoop import *

app = Flask(__name__)
app.register_blueprint(views_bp)
app.secret_key = os.urandom(24) # -- Senha configurada para sessão aleatória


@app.after_request
def aplicar_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'

    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate" # -- não ter armazenamento de cache
    response.headers["Pragma"] = "no-cache" # -- não ter armazenamento de cache
    response.headers["Expires"] = "0"
    return response

if __name__ == "__main__": 
    app.run(debug=True)
