import csv, os, uuid, random, string
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, '..', 'data')

TOKENS_ARQUIVO = os.path.join(DATA_DIR, 'tokens.csv')
TOKENS_HEADERS = ['token_id', 'code', 'created_at', 'expires_at', 'id', 'used', 'used_at']

COOPERATIVA_ARQUIVO = os.path.join(DATA_DIR, 'cooperativa.csv')
COOP_DELIMITER = ';'
TOK_DELIMITER = ';'

def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)

def generate_code(length=8):
    letters = string.ascii_uppercase
    return ''.join(random.choice(letters) for _ in range(length))

def get_all_cooperatives():
    ensure_data_dir()
    cooperatives = []
    if os.path.exists(COOPERATIVA_ARQUIVO):
        with open(COOPERATIVA_ARQUIVO, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=COOP_DELIMITER)
            for row in reader:
                if 'id' in row and row['id']:
                    cooperatives.append(row['id'])
    return cooperatives

def create_token_entry(cooperative_id, expire_days=30):
    token_id = str(uuid.uuid4())
    code = generate_code()
    created_at = datetime.now()
    expires_at = created_at + timedelta(days=expire_days)
    return {
        "token_id": token_id,
        "code": code,
        "created_at": created_at.isoformat(),
        "expires_at": expires_at.isoformat(),
        "id": str(cooperative_id),
        "used": "False",
        "used_at": ""
    }

def save_token_to_csv(token: dict):
    ensure_data_dir()
    file_exists = os.path.exists(TOKENS_ARQUIVO)
    with open(TOKENS_ARQUIVO, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=TOKENS_HEADERS, delimiter=TOK_DELIMITER)
        if not file_exists:
            writer.writeheader()
        writer.writerow(token)

def load_tokens():
    ensure_data_dir()
    tokens = []
    if not os.path.exists(TOKENS_ARQUIVO):
        return tokens
    with open(TOKENS_ARQUIVO, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=TOK_DELIMITER)
        for row in reader:
            tokens.append(row)
    return tokens

def write_tokens(rows: list[dict]):
    ensure_data_dir()
    with open(TOKENS_ARQUIVO, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=TOKENS_HEADERS, delimiter=TOK_DELIMITER)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)

def mark_token_as_used(code: str):
    ensure_data_dir()
    if not os.path.exists(TOKENS_ARQUIVO):
        return False, "Arquivo de tokens não encontrado."

    code = (code or '').strip().upper()
    tokens = load_tokens()

    token_found = False
    now_iso = datetime.now().isoformat()

    for row in tokens:
        if (row.get('code') or '').strip().upper() == code:
            token_found = True

            if (row.get('used') or '').strip().lower() == 'true':
                return False, "Token já foi utilizado."

            try:
                expires_at = datetime.fromisoformat(row.get('expires_at', ''))
            except Exception:
                return False, "Data de expiração inválida no token."

            if datetime.now() > expires_at:
                return False, "Token expirado."

            row['used'] = "True"
            row['used_at'] = now_iso
            break

    if not token_found:
        return False, "Token não encontrado."

    write_tokens(tokens)
    return True, f"Token {code} marcado como usado em {now_iso}."

def get_tokens_by_cooperative(cooperative_id: str):
    cooperative_id = str(cooperative_id).strip()
    tokens = load_tokens()
    return [t for t in tokens if (t.get('id') or '').strip() == cooperative_id]