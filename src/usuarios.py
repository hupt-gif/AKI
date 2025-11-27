import csv, os, uuid

LOGIN_ARQUIVO = os.path.join("data", "usuarios.csv")
LOGIN_HEADERS = ["id", "username", "nome_completo", "cpf", "senha", "email", "role"]

# -- Salva novo usuário
def salvar_usuario(usuario: dict):
    """Salva um usuário no CSV, criando o arquivo caso ele não exista."""
    file_exists = os.path.exists(LOGIN_ARQUIVO)

    with open(LOGIN_ARQUIVO, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=LOGIN_HEADERS, delimiter=';')

        if not file_exists:
            writer.writeheader()

        writer.writerow(usuario)

# -- Valida usuário no arquivo
def usuario_existe(username: str) -> bool:
    if not os.path.exists(LOGIN_ARQUIVO):
        return False

    with open(LOGIN_ARQUIVO, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            if row.get("username", "").strip().lower() == username.strip().lower():
                return True
    return False

# -- Validador de login
def validar_login(username: str, senha: str, role: str | None = None):
    
    if not os.path.isfile(LOGIN_ARQUIVO):
        return False

    with open(LOGIN_ARQUIVO, newline='', encoding='utf-8') as arquivo:
        reader = csv.DictReader(arquivo, delimiter=';')

        for row in reader:
            if (
                row.get('username', '').strip().lower() == username.strip().lower()
                and row.get('senha', '') == senha
                and (role is None or row.get('role', '').strip().lower() == role.strip().lower())
            ):
                return row

    return False

# -- Busca completa do perfil
def get_user_profile(user_id: str):
    if not os.path.exists(LOGIN_ARQUIVO):
        return None

    with open(LOGIN_ARQUIVO, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            if row.get("id") == user_id:
                return row
    return None

# -- Atualiza dados do usuário
def atualizar_usuario(user_id: str, novos_dados: dict):
    if not os.path.exists(LOGIN_ARQUIVO):
        return False

    linhas = []
    atualizado = False

    with open(LOGIN_ARQUIVO, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            if row["id"] == user_id:
                row.update(novos_dados)
                atualizado = True
            linhas.append(row)

    if atualizado:
        with open(LOGIN_ARQUIVO, "w", newline='', encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=LOGIN_HEADERS, delimiter=';')
            writer.writeheader()
            writer.writerows(linhas)

    return atualizado

# -- Verificador de email
def email_existe(email: str) -> bool:
    if not os.path.exists(LOGIN_ARQUIVO):
        return False

    email = email.lower().strip()

    with open(LOGIN_ARQUIVO, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=';')

        for row in reader:
            if row.get("email", "").lower().strip() == email:
                return True

    return False
