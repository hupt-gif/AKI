from functools import wraps
from flask import render_template, Blueprint, request, redirect, url_for, flash, session, jsonify, send_file
from src.clientesCoop import *
from src.loginCoop import *
from src.contato import *
from src.produtosAdmin import *
from src.clientesAdmin import *
from src.pedidosAdmin import *
from src.coopAdmin import *
from src.tokens import *
from src.pedidosAdmin import *
from src.clientesEndereco import *
from src.usuarios import *
from src.alterPerfil import *
from src.pagamentos import *
from src.tokensAdmin import *
from datetime import datetime
import uuid, os, csv

views_bp = Blueprint('views', __name__)

# -- Requerente de login(protege as rotas de usuários não logados)
def login_required(role=None):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            user = session.get('usuario')
            print("Sessão atual ->", session)

            if not user:
                session['next'] = request.path # -- Guarda a rota atual para redirecionar depois do login
                return redirect(url_for('views.mostrar_registro'))

            if role and user.get('role', '').strip().lower() != role.strip().lower():
                flash("Você não tem permissão para acessar este local.", "error")
                return redirect(url_for('views.mostrar_registro'))
            
            return f(*args, **kwargs)
        return wrapped
    return decorator

# -- Index/Homepage --
@views_bp.route("/")
def homepage():
    return render_template("indexEmpresa.html")

# -- Cadastro --
@views_bp.route("/cadastro", methods = ['GET']) #Busca a visualização da rota de cadastro - Gustavo
def mostrarFormulario():
     return render_template("cadastro.html")

@views_bp.route('/cadastro', methods=['POST'])
def cadastro():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Dados inválidos'}), 400

    cpf = data.get('cpf')
    email = data.get('email')

    if cliente_existe(cpf=cpf, email=email):
        return jsonify({'message': 'CPF ou e-mail já cadastrado.'}), 409

    try:
        cliente = salvar_cliente(data)
        return jsonify({'message': f'Cliente {cliente["nome"]} cadastrado com sucesso!'})
    except Exception as e:
        return jsonify({'message': f'Erro ao salvar: {str(e)}'}), 500
  
# -- Login --
# -- Apagar toda essas funções abaixo.
def salvar_usuario(usuario):
    file_exists = os.path.exists(LOGIN_ARQUIVO)
    with open(LOGIN_ARQUIVO, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=LOGIN_HEADERS, delimiter=';')
        if not file_exists:
            writer.writeheader()
        writer.writerow(usuario)


def usuario_existe(username: str) -> bool:
    if not os.path.exists(LOGIN_ARQUIVO):
        return False

    with open(LOGIN_ARQUIVO, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter=';')
        for row in reader:
            if row.get('username', '').strip().lower() == username.strip().lower():
                return True
    return False


def validar_login(username: str, senha: str, role: str | None = None):
    if not os.path.isfile(LOGIN_ARQUIVO):
        return False
    with open(LOGIN_ARQUIVO, newline='', encoding='utf-8') as arquivo:
        reader = csv.DictReader(arquivo, delimiter=';')
        for row in reader:
            if (
                row.get('username', '').strip().lower() == (username or '').strip().lower() and
                row.get('senha', '') == (senha or '') and
                (role is None or row.get('role', '').strip().lower() == role.strip().lower())
            ):
                return row  # retorna o usuário completo
    return False

# -------- Rotas --------

# -- login
@views_bp.route('/login', methods=['GET'])
def mostrar_registro():
    return render_template("login.html")

# -- Registro
@views_bp.route('/registro', methods=['POST'])
def registrar():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Dados inválidos'}), 400

    username = (data.get('username') or '').strip()
    nome_completo = (data.get('nome') or '')
    cpf = (data.get('cpf') or '')
    senha = (data.get('senha') or '')
    email = (data.get('email') or '').strip().lower()
    role = (data.get('role') or 'user').strip().lower()

    if not username or not senha:
        return jsonify({'message': 'Usuário e senha são obrigatórios'}), 400

    if usuario_existe(username):
        return jsonify({'message': 'Usuário já existe.'}), 409

    usuario = {
        'id': str(uuid.uuid4()),
        'username': username,
        'nome_completo': nome_completo,
        'cpf': cpf,
        'senha': senha,
        'email': email,
        'role': role
    }

    salvar_usuario(usuario)

    return jsonify({'message': 'Usuário registrado com sucesso!'})

# -- Envio do login
@views_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'message': 'Dados inválidos.'}), 400

    username = (data.get('username') or '').strip()
    senha = (data.get('senha') or '').strip()
    usuario = validar_login(username, senha)

    if not usuario:
        return jsonify({'message': 'Usuário ou senha incorretos.'}), 401

    role = (usuario.get('role') or '').strip().lower()
    user_id = usuario.get('id')

    session.clear()
    session['usuario'] = {'id': user_id, 'username': username, 'role': role}

    next_page = session.pop('next', None)

    if next_page:
        redirect_url = next_page
    elif role == 'admin':
        redirect_url = '/admin/dashboard'
    elif role == 'cooperativa':
        session['cooperativa_id'] = usuario.get('id')
        redirect_url = '/cooperativa'
    elif role == 'user':
        redirect_url = '/akiCooperativa/user'
    elif role == 'suporte':
        redirect_url = '/suporte/atendente'
    else:
        redirect_url = '/akiCooperativa'

    return jsonify({
        'message': f'Login realizado com sucesso para {role}!',
        'redirect': redirect_url
    })


# -- Perfil cliente
@views_bp.route('/perfil', methods=['POST', 'GET'])
def visualizar_perfil():
    usuario = session.get('usuario')
    
    if not usuario:
        return redirect(url_for('views.mostrar_registro'))

    user_id = usuario.get('id')
    perfil = get_user_profile(user_id)
    pedidos = get_pedidos_por_usuario(user_id)
    enderecos = get_enderecos_cliente(user_id)

    if not perfil:
        flash("Perfil não encontrado.", "error")
        return redirect('/')

    registros_extras = alter_read()
    dados_extras = next((r for r in registros_extras if r["cliente_id"] == str(user_id)), {})

    perfil['telefone'] = dados_extras.get('telefone', '')
    perfil['data_nasc'] = dados_extras.get('data_nasc', '')

    return render_template(
        'perfil_cliente.html',
        perfil=perfil,
        pedidos=pedidos,
        enderecos=enderecos
    )

# -- Busca de pedidos por id
@views_bp.route("/pedido/<pedido_id>/produtos")
def produtos_do_pedido(pedido_id):
    with open(ARQUIVO_PEDIDOS, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=';')

        for row in reader:
            if row["id_pedido"] == pedido_id:

                produtos_str = row["produtos"]

                return jsonify({"produtos": produtos_str})
            
# -- Endereços
@views_bp.route("/cliente/<id>/enderecos", methods=["GET"])
def listar_meus_enderecos(id):
    usuario = session.get('usuario')
    if not usuario:
        return jsonify({"erro": "Não autenticado"}), 401

    enderecos = get_enderecos_cliente(id)
    
    return jsonify(enderecos), 200

@views_bp.route("/cliente/<id>/enderecos", methods=["POST"])
def adicionar_meu_endereco(id):
    usuario = session.get('usuario')
    if not usuario:
        return jsonify({"erro": "Não autenticado"}), 401

    dados = request.json or {}

    dados["cliente_id"] = id

    try:
        novo = adicionar_endereco(dados)
        return jsonify(novo), 201
    except ValueError as e:
        return jsonify({"erro": str(e)}), 400
    except Exception as e:
        return jsonify({"erro": f"Falha ao salvar: {e}"}), 500

@views_bp.route("/endereco/<endereco_id>", methods=["DELETE"])
def remover_endereco_route(endereco_id):
    remover_endereco(endereco_id)
    return jsonify({"status": "ok"}), 200

# -- Tel e data_nasc
@views_bp.route("/cliente/<id>/perfil", methods=["POST"])
def atualizar_perfil(id):
    usuario = session.get('usuario')
    if not usuario:
        return jsonify({"erro": "Não autenticado"}), 401

    dados = request.json
    telefone = dados.get("telefone")
    nascimento = dados.get("data_nasc")

    if telefone_existe(telefone):
        return jsonify({"erro": "Telefone já cadastrado"}), 400

    salvar_tel_nasc(id, telefone, nascimento)
    return jsonify({"sucesso": True})
@views_bp.route("/cliente/<id>/perfil", methods=["GET"])
def obter_perfil(id):
    registros = alter_read()

    dado = next((r for r in registros if r["cliente_id"] == str(id)), None)

    if not dado:
        return jsonify({"telefone": "", "data_nasc": ""}), 200

    return jsonify({
        "telefone": dado.get("telefone", ""),
        "data_nasc": dado.get("data_nasc", "")
    }), 200

# -- Segurança
@views_bp.route("/perfil/alterar-senha", methods=["POST"])
def alterar_senha():
    data = request.json
    user_id = data.get("id")
    senha_atual = data.get("senha_atual")
    senha_nova = data.get("senha_nova")

    user = get_user_profile(user_id)
    if not user:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    if user["senha"] != senha_atual:
        return jsonify({"erro": "Senha atual incorreta"}), 400

    sucesso = atualizar_usuario(user_id, {"senha": senha_nova})

    if sucesso:
        return jsonify({"sucesso": True})
    else:
        return jsonify({"erro": "Falha ao atualizar senha"}), 500


@views_bp.route("/perfil/alterar-email", methods=["POST"])
def alterar_email():
    data = request.json
    user_id = data.get("id")
    novo_email = data.get("email")

    if email_existe(novo_email):
        return jsonify({"erro": "Este email já está cadastrado"}), 400

    sucesso = atualizar_usuario(user_id, {"email": novo_email})

    if sucesso:
        return jsonify({"sucesso": True})
    else:
        return jsonify({"erro": "Falha ao atualizar email"}), 500

# -- Suporte -- Cliente
@views_bp.route('/suporte', methods=['GET', 'POST'])
@login_required()
def suporte():
    return render_template('suporte_cliente.html')

# -- Suporte -- Atendente
@views_bp.route('/suporte/atendente', methods=['POST', 'GET'])
def sac():
    return render_template('suporte_atendente.html')

@views_bp.route('/api/atendente', methods=['GET'])
def dados_atendente():
    usuario = session.get('usuario')
    if usuario:
        return jsonify({
            "nome": usuario.get("nome", "Atendente"),
            "cargo": usuario.get("cargo", "Suporte"),
            "status": "Online"
        })
    return jsonify({"erro": "Usuário não logado"}), 401

@views_bp.route('/suporte/atendente/perfil', methods=['POST', 'GET'])
def perfil_sac():
    return render_template('perfil_atendente_suporte.html')

# -- Contato --
@views_bp.route('/', methods=['POST'])
def receber_formulario():
    dados = request.get_json()
    if not dados:
        return jsonify({'erro': 'Nenhum dado recebido'}), 400
    
    id_requisicao = datetime.now().strftime('ID-%Y-%m-%d-%H-%M-%S')
    dados['id'] = id_requisicao

    salvar_em_csv(dados)
    return jsonify({'mensagem': 'Dados salvos com sucesso',  'id': id_requisicao}), 200

# -- Ecomerce --
@views_bp.route('/akiCooperativa')
def ir_para_loja():
    try:
        lista_cooperativas = carregar_cooperativa()

        for coop in lista_cooperativas:
            # --- Formatar Telefone
            tel_bruto = ''.join(filter(str.isdigit, str(coop.get('telefone', ''))))
            
            if len(tel_bruto) == 11:   # Celular
                coop['telefone'] = f"({tel_bruto[:2]}) {tel_bruto[2:7]}-{tel_bruto[7:]}"
            elif len(tel_bruto) == 10: # Fixo
                coop['telefone'] = f"({tel_bruto[:2]}) {tel_bruto[2:6]}-{tel_bruto[6:]}"

            # --- Formatar CEP
            cep_bruto = ''.join(filter(str.isdigit, str(coop.get('cep', ''))))
            
            if len(cep_bruto) == 8:
                coop['cep'] = f"{cep_bruto[:5]}-{cep_bruto[5:]}"

    except Exception as e:
        print(f"Erro ao carregar ou formatar cooperativas: {e}")
        lista_cooperativas = []

    return render_template('akiCooperativa.html', cooperativas=lista_cooperativas)

# -- Rota de usuário logado
@views_bp.route('/akiCooperativa/user')
def loja_logado():
    try:
        lista_cooperativas = carregar_cooperativa()

        for coop in lista_cooperativas:
            tel_bruto = ''.join(filter(str.isdigit, str(coop.get('telefone', ''))))
            
            if len(tel_bruto) == 11:   # Celular
                coop['telefone'] = f"({tel_bruto[:2]}) {tel_bruto[2:7]}-{tel_bruto[7:]}"
            elif len(tel_bruto) == 10: # Fixo
                coop['telefone'] = f"({tel_bruto[:2]}) {tel_bruto[2:6]}-{tel_bruto[6:]}"

            # --- Formatar CEP
            cep_bruto = ''.join(filter(str.isdigit, str(coop.get('cep', ''))))
            
            if len(cep_bruto) == 8:
                coop['cep'] = f"{cep_bruto[:5]}-{cep_bruto[5:]}"

    except Exception as e:
        print(f"Erro ao carregar ou formatar cooperativas: {e}")
        lista_cooperativas = []

    return render_template('usuario_logado.html', cooperativas=lista_cooperativas)

# -- Produtos --
@views_bp.route('/produtos')
def ir_para_produtos():
    return render_template('venda_produtos.html')

@views_bp.route("/produtos.csv")
def get_produtos_csv():
    caminho_csv = os.path.join(os.path.dirname(__file__), "..", "data", "produtos.csv")
    caminho_csv = os.path.abspath(caminho_csv)
    return send_file(caminho_csv, mimetype="text/csv")
    

# -- Carrinho de compras -- 
@views_bp.route('/cart')
@login_required()
def carrinho_de_compras():
    return render_template('cart.html')

# -- API de token
@views_bp.route('/api/validar-token', methods=['POST'])
def api_validar_token():
    data = request.get_json()
    codigo = data.get('token', '').strip().upper()
    
    if not codigo:
        return jsonify({'valid': False, 'message': 'Código vazio.'}), 400

    try:
        tokens_admin = listar_tokens_admin()
        for t in tokens_admin:
            if t['code'].upper() == codigo:

                if t['active'] == 'True' and int(t['current_uses']) < int(t['max_uses']):
                    return jsonify({
                        'valid': True,
                        'type': 'admin',
                        'discount_percent': float(t['discount']),
                        'message': f"Cupom Admin: {t['discount']}% OFF"
                    })
                else:
                    return jsonify({'valid': False, 'message': 'Cupom esgotado ou inativo.'}), 200
    except Exception as e:
        print(f"Erro ao validar token admin: {e}")

    try:
        tokens_coop = load_tokens()
        for t in tokens_coop:
            if t['code'].upper() == codigo:
                if t['used'] == 'False':
                    return jsonify({
                        'valid': True,
                        'type': 'coop',
                        'discount_percent': 10, # Fixo 10% (Recebido feedback que o valor pode ser inviavel)
                        'message': 'Cupom Cooperativa: 10% OFF'
                    })
                else:
                    return jsonify({'valid': False, 'message': 'Token já utilizado.'}), 200
    except Exception as e:
        print(f"Erro ao validar token coop: {e}")

    return jsonify({'valid': False, 'message': 'Token não encontrado.'}), 200

# -- Pagamento --
@views_bp.route('/checkout', methods=['GET'])
@login_required() 
def pagamento():
    usuario = session.get('usuario')
    user_id = usuario.get('id')

    perfil = get_user_profile(user_id)
    enderecos = get_enderecos_cliente(user_id)

    metodos_pagamento = listar_pagamentos(user_id)

    return render_template('checkout.html', perfil=perfil, enderecos=enderecos, pagamentos=metodos_pagamento)
 
@views_bp.route('/checkout', methods=['POST'])
@login_required()
def finalizar_compra():
    data = request.get_json()
    if not data: return jsonify({'message': 'Dados inválidos'}), 400

    usuario = session.get('usuario')
    cliente_id = usuario.get('id')
    itens_carrinho = data.get('items', [])
    token_code = str(data.get('token', '')).strip()

    # --- 1. Calcular Valor Real (Segurança) ---
    try:
        todos_produtos = carregar_produtos()
        dict_produtos = {p['produto_id']: p for p in todos_produtos}
    except Exception as e:
        return jsonify({'message': 'Erro ao carregar produtos.'}), 500

    valor_total_real = 0.0
    produtos_para_atualizar = []
    lista_historico = []

    for item in itens_carrinho:
        pid = item.get('id')
        qtd = int(item.get('quantity', 1))
        prod = dict_produtos.get(pid)

        if not prod: return jsonify({'message': f'Produto {pid} indisponível.'}), 400
        
        estoque = int(prod.get('estoque', 0))
        if estoque < qtd: return jsonify({'message': f'Estoque insuficiente: {prod["nome"]}'}), 400

        try:
            preco = float(str(prod['preco']).replace(',', '.'))
        except: preco = 0.0

        valor_total_real += preco * qtd
        
        prod['estoque'] = str(estoque - qtd)
        produtos_para_atualizar.append(prod)
        lista_historico.append({'name': prod['nome'], 'quantity': qtd, 'price': preco})

    porcentagem_desconto = 0.0
    msg_token = ""

    if token_code:
        eh_admin, desc_admin, msg_admin = usar_token_admin(token_code)
        
        if eh_admin:
            porcentagem_desconto = desc_admin / 100.0
            msg_token = f"Cupom aplicado: {desc_admin}% OFF"
        
        else:
            sucesso_coop, msg_coop = mark_token_as_used(token_code)
            
            if sucesso_coop:
                porcentagem_desconto = 0.10
                msg_token = "Token Cooperativa aplicado: 10% OFF"
            else:
                return jsonify({'message': f'Token inválido: {msg_admin} / {msg_coop}'}), 400

    valor_final = valor_total_real * (1 - porcentagem_desconto)

    try:
        # -- Retira itens do estoque
        for p in produtos_para_atualizar:
            editar_produto(p['produto_id'], {'estoque': p['estoque']})
        
        salvar_pedido(cliente_id, lista_historico, valor_final)

        return jsonify({
            'success': True, 
            'message': 'Compra realizada! ' + msg_token,
            'new_total': f'R$ {valor_final:.2f}'
        }), 200

    except Exception as e:
        return jsonify({'message': f'Erro fatal: {e}'}), 500
    
# -- Rota de pagamento (Inclusão perfil cliente)
@views_bp.route("/cliente/<id>/pagamentos", methods=["GET"])
def listar_meus_pagamentos(id):

    usuario = session.get('usuario')
    if not usuario or str(usuario.get('id')) != str(id):
         return jsonify({"erro": "Acesso não autorizado"}), 403
         
    metodos = listar_pagamentos(id)
    return jsonify(metodos), 200

@views_bp.route("/cliente/<id>/pagamentos", methods=["POST"])
def adicionar_meu_pagamento(id):
    usuario = session.get('usuario')
    if not usuario:
        return jsonify({"erro": "Não autenticado"}), 401

    dados = request.json or {}
    dados["cliente_id"] = id 
    
    try:
        novo = adicionar_pagamento(dados)
        return jsonify(novo), 201
    except Exception as e:
        return jsonify({"erro": f"Erro ao salvar: {str(e)}"}), 500

@views_bp.route("/pagamento/<pagamento_id>", methods=["DELETE"])
def deletar_meu_pagamento(pagamento_id):
    if remover_pagamento(pagamento_id):
        return jsonify({"status": "ok"}), 200
    return jsonify({"erro": "Não encontrado"}), 404
    
# -- Success --
@views_bp.route('/success')
def success():
     return render_template('success.html')
 
# -- Página de admin --
@views_bp.route('/admin/dashboard')
@login_required(role='admin')
def admin_dashboard():
    usuario = session.get('usuario')
    return render_template('admin_dashboard.html', usuario=usuario)

# -- Tokens Admin
@views_bp.route('/admin/tokens', methods=['GET'])
@login_required(role='admin')
def api_listar_tokens():
    return jsonify(listar_tokens_admin())

@views_bp.route('/admin/tokens', methods=['POST'])
@login_required(role='admin')
def api_criar_token():
    data = request.json
    usuario = session.get('usuario')
    
    sucesso, res = criar_token_admin(
        user_id=usuario['id'],
        codigo=data.get('code'),
        desconto=data.get('discount'),
        max_usos=data.get('max_uses')
    )
    
    if sucesso:
        return jsonify(res), 201
    return jsonify({'erro': res}), 400

@views_bp.route('/admin/tokens/<id>/toggle', methods=['POST'])
@login_required(role='admin')
def api_toggle_token(id):
    sucesso, status = alternar_status_token(id)
    if sucesso:
        return jsonify({'active': status}), 200
    return jsonify({'erro': status}), 404

# -- CRUD Produtos --
@views_bp.route('/admin/produtos')
def listar_produtos():
    try:
        produtos = carregar_produtos()
    except Exception as e:
        flash(f'Erro ao carregar produtos: {e}', 'error')
        produtos = []
    return render_template('admin_produtos.html', produtos=produtos)

@views_bp.route('/admin/produtos', methods=['POST'])
def criar_produto():
    data = request.get_json()
    try:
        produto = adicionar_produto(data)
        return jsonify({'message': 'Produto adicionado com sucesso!', 'produto': produto}), 201
    except Exception as e:
        return jsonify({'message': f'Erro ao adicionar: {e}'}), 500

@views_bp.route('/admin/produtos/<produto_id>', methods=['PUT'])
def atualizar_produto(produto_id):
    dados = request.get_json()

    produto_atualizado = editar_produto(produto_id, dados)

    if not produto_atualizado:
        return jsonify({"error": "Produto não encontrado"}), 404

    return jsonify({"message": "Produto atualizado com sucesso!", "produto": produto_atualizado})

@views_bp.route('/admin/produtos/<produto_id>', methods=['DELETE'])
def remover_produto(produto_id):
    try:
        if excluir_produto(produto_id):
            return jsonify({'message': 'Produto excluído com sucesso!'}), 200
        return jsonify({'message': 'Produto não encontrado.'}), 404
    except Exception as e:
        return jsonify({'message': f'Erro ao excluir: {e}'}), 500

@views_bp.route('/admin/produtos/<produto_id>', methods=['GET'])
def obter_produto(produto_id):
    produtos = carregar_produtos()

    produto = next((p for p in produtos if p['produto_id'] == produto_id), None)

    if not produto:
        return jsonify({"error": "Produto não encontrado"}), 404

    # Converter preco/estoque para número se vier como string do CSV - Gustavo
    produto_convertido = {
        **produto,
        "preco": float(produto["preco"]) if produto["preco"] else 0,
        "estoque": int(produto["estoque"]) if produto["estoque"] else 0
    }

    return jsonify(produto_convertido), 200

# -- CRUD Clientes --
@views_bp.route('/admin/clientes')
def listar_clientes():
    try:
        clientes = carregar_clientes()
    except Exception as e:
        flash(f'Erro ao carregar clientes: {e}', 'error')
        clientes = []
    return render_template('admin_clientes.html', clientes=clientes)

@views_bp.route('/admin/clientes', methods=['POST'])
def criar_cliente():
    data = request.get_json()
    try:
        cliente = adicionar_cliente(data)
        return jsonify({'message': 'Cliente adicionado com sucesso!', 'cliente': cliente}), 201
    except Exception as e:
        return jsonify({'message': f'Erro ao adicionar: {e}'}), 500

@views_bp.route('/admin/clientes/<cliente_id>', methods=['PUT'])
def atualizar_cliente(cliente_id):
    data = request.get_json()
    try:
        cliente = editar_cliente(cliente_id, data)
        if cliente:
            return jsonify({'message': 'Cliente atualizado com sucesso!', 'cliente': cliente}), 200
        return jsonify({'message': 'Cliente não encontrado.'}), 404
    except Exception as e:
        return jsonify({'message': f'Erro ao atualizar: {e}'}), 500

@views_bp.route('/admin/clientes/<cliente_id>', methods=['DELETE'])
def remover_cliente(cliente_id):
    try:
        if excluir_cliente(cliente_id):
            return jsonify({'message': 'Cliente excluído com sucesso!'}), 200
        return jsonify({'message': 'Cliente não encontrado.'}), 404
    except Exception as e:
        return jsonify({'message': f'Erro ao excluir: {e}'}), 500

# -- CRUD Cooperativas --
@views_bp.route('/admin/cooperativas')
def listar_cooperativas():
    try:
        cooperativas = carregar_cooperativa()
    except Exception as e:
        flash(f'Erro ao carregar cooperativas: {e}', 'error')
        cooperativas = []
    return render_template('admin_cooperativa.html', cooperativa=cooperativas)

@views_bp.route('/admin/cooperativas', methods=['POST'])
def criar_cooperativa():
    data = request.get_json()
    try:
        cooperativa = adicionar_cooperativa(data)
        return jsonify({'message': 'Cooperativa adicionada com sucesso!', 'cooperativa': cooperativa}), 201
    except Exception as e:
        return jsonify({'message': f'Erro ao adicionar: {e}'}), 500

@views_bp.route('/admin/cooperativas/<cooperativa_id>', methods=['PUT'])
def atualizar_cooperativa(cooperativa_id):
    data = request.get_json()
    try:
        cooperativa = editar_cooperativa(cooperativa_id, data)
        if cooperativa:
            return jsonify({'message': 'Cooperativa atualizada com sucesso!', 'cooperativa': cooperativa}), 200
        return jsonify({'message': 'Cooperativa não encontrada'}), 404
    except Exception as e:
        return jsonify({'message': f'Erro ao atualizar: {e}'}), 500

@views_bp.route('/admin/cooperativas/<cooperativa_id>', methods=['DELETE'])
def remover_cooperativa(cooperativa_id):
    try:
        if excluir_cooperativa(cooperativa_id):
            return jsonify({'message': 'Cooperativa excluída com sucesso!'}), 200
        return jsonify({'message': 'Cooperativa não encontrada'}), 404
    except Exception as e:
        return jsonify({'message': f'Erro ao excluir: {e}'}), 500

# -- Tela de cooperativa
@views_bp.route('/cooperativa')
@login_required(role='cooperativa')
def cooperativa_dashboard():
    coop_id = session.get('cooperativa_id')
    
    if not coop_id:
        flash('Você precisa estar logado como cooperativa para acessar esta página.')
        return redirect(url_for('views.mostrar_registro'))

    cooperativa_nome= obter_nome_cooperativa(coop_id)
    
    tokens = get_tokens_by_cooperative(coop_id)
    return render_template('cooperativa.html', cooperativa_nome=cooperativa_nome, tokens=tokens)

@views_bp.route('/cooperativa/gerar_token', methods=['POST'])
def gerar_token_coop():
    coop_id = session.get('cooperativa_id')
    if not coop_id:
        return jsonify({'error': 'Não logado'}), 401

    try:
        novo_token = create_token_entry(coop_id)
        save_token_to_csv(novo_token)
        return jsonify({'token': novo_token}), 201
    except Exception as e:
        return jsonify({'error': f'Falha ao gerar token: {e}'}), 500

# -- Tokens de cooperativa
@views_bp.route('/tokens', methods=['POST'])
def generate_tokens_for_all():
    try:
        cooperatives = get_all_cooperatives()
    except Exception as e:
        return jsonify({"error": f"Falha ao carregar cooperativas: {e}"}), 500

    if not cooperatives:
        return jsonify({"error": "Nenhuma cooperativa encontrada"}), 404

    tokens = []
    try:
        for coop in cooperatives:
            if isinstance(coop, dict):
                coop_id = coop.get('id') or coop.get('cooperativa_id') or coop.get('nome')
            else:
                coop_id = str(coop)

            if not coop_id:
                continue 

            token = create_token_entry(coop_id)
            save_token_to_csv(token)
            tokens.append(token)

        return jsonify({
            "message": f"Tokens gerados com sucesso ({len(tokens)} criados)",
            "tokens": tokens
        }), 201
    except Exception as e:
        return jsonify({"error": f"Falha ao gerar tokens: {e}"}), 500

@views_bp.route('/tokens/use', methods=['POST'])
def use_token():
    data = request.get_json()
    if not data or 'code' not in data or not (data['code'] or '').strip():
        return jsonify({"error": "Campo 'code' é obrigatório"}), 400

    success, message = mark_token_as_used(data['code'].strip())
    status_code = 200 if success else 400
    
    return jsonify({"success": success, "message": message}), status_code


# -- Relatório de vendas
@views_bp.route('/admin/relatorio')
def relatorio_vendas():
    lista_de_pedidos = ler_pedidos()

    lista_de_pedidos.reverse()

    return render_template('relatorio_vendas.html', pedidos=lista_de_pedidos)

@views_bp.route("/api/grafico/vendas-dia")
def api_vendas_dia():
    return jsonify(vendas_por_dia())

@views_bp.route("/api/grafico/pedidos-status")
def api_pedidos_status():
    return jsonify(pedidos_por_status())

@views_bp.route("/api/grafico/produtos-mais-vendidos")
def api_produtos_mais_vendidos():
    return jsonify(produtos_mais_vendidos())

# -- Pedidos
@views_bp.route('/meus-pedidos')
def meus_pedidos():
    if "usuario_email" not in session:
        return redirect(url_for('views_bp.login'))

    email = session["usuario_email"]

    pedidos = get_pedidos_por_usuario(email)

    pedidos.reverse()

    return render_template('perfil_cliente.html', pedidos=pedidos)

# -- Logout
@views_bp.route('/logout')
def logout():
    session.clear()
    flash('Logout realizado com sucesso!')
    return redirect('/login')