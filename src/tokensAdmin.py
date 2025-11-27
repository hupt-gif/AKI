import csv, os, uuid
from datetime import datetime


BASE_DIR = os.path.dirname(__file__)
TOKENS_ADMIN_ARQUIVO = os.path.join(BASE_DIR, '..', 'data', 'tokensAdmin.csv')

HEADERS = ['id', 'user_id', 'code', 'discount', 'max_uses', 'current_uses', 'active', 'created_at']

def _init_db():
    os.makedirs(os.path.dirname(TOKENS_ADMIN_ARQUIVO), exist_ok=True)
    if not os.path.exists(TOKENS_ADMIN_ARQUIVO):
        with open(TOKENS_ADMIN_ARQUIVO, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=HEADERS, delimiter=';')
            writer.writeheader()

def listar_tokens_admin():
    _init_db()
    with open(TOKENS_ADMIN_ARQUIVO, 'r', encoding='utf-8') as f:
        return list(csv.DictReader(f, delimiter=';'))

def salvar_tokens_admin(lista):
    with open(TOKENS_ADMIN_ARQUIVO, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=HEADERS, delimiter=';')
        writer.writeheader()
        writer.writerows(lista)

def criar_token_admin(user_id, codigo, desconto, max_usos):
    _init_db()
    tokens = listar_tokens_admin()
    
    if any(t['code'].upper() == codigo.upper() for t in tokens):
        return False, "Código já existe!"

    novo = {
        'id': str(uuid.uuid4()),
        'user_id': user_id,
        'code': codigo.upper(),
        'discount': str(desconto),
        'max_uses': str(max_usos),
        'current_uses': '0',
        'active': 'True',
        'created_at': datetime.now().strftime('%d/%m/%Y %H:%M')
    }
    
    tokens.append(novo)
    salvar_tokens_admin(tokens)
    return True, novo

def alternar_status_token(token_id):
    tokens = listar_tokens_admin()
    found = False
    novo_status = ""
    
    for t in tokens:
        if t['id'] == token_id:
            eh_ativo = t['active'] == 'True'
            t['active'] = 'False' if eh_ativo else 'True'
            novo_status = t['active']
            found = True
            break
            
    if found:
        salvar_tokens_admin(tokens)
        return True, novo_status
    return False, "Token não encontrado"

def usar_token_admin(codigo):
    _init_db()
    tokens = listar_tokens_admin()
    codigo = codigo.upper().strip()
    
    for t in tokens:
        if t['code'] == codigo:
            if t['active'] != 'True':
                return False, 0, "Este cupom foi desativado pelo administrador."
            
            usos = int(t['current_uses'])
            maximo = int(t['max_uses'])
            if usos >= maximo:
                return False, 0, "Este cupom atingiu o limite máximo de usos."
            
            t['current_uses'] = str(usos + 1)
            salvar_tokens_admin(tokens)
            
            desconto = float(t['discount'])
            return True, desconto, "Cupom aplicado com sucesso!"
            
    return False, 0, "Cupom não encontrado."