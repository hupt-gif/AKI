# -- Arquivo parcialmente desabilitada, foi substituído por arquivo de usuarios (Excluir em breve)

import csv
import os

LOGIN_ARQUIVO = 'data/login.csv'
LOGIN_HEADERS = ['id', 'username', 'email','senha', 'role', 'cliente_id']

def salvar_usuario(usuario):
    file_exists = os.path.isfile(LOGIN_ARQUIVO)
    with open(LOGIN_ARQUIVO, 'a', newline='', encoding='utf-8') as arquivo:
        writer = csv.DictWriter(arquivo, fieldnames=LOGIN_HEADERS, delimiter=';')
        if not file_exists:
            writer.writeheader()
        writer.writerow(usuario)

def usuario_existe(username):
    if not os.path.exists(LOGIN_ARQUIVO):
        return False

    with open(LOGIN_ARQUIVO, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter=';')
        for row in reader:
            if row['username'] == username:
                return True
    return False

def validar_login(username, senha, role=None):
    """Valida as credenciais e retorna os dados do usuário se forem válidos."""
    if not os.path.isfile(LOGIN_ARQUIVO):
        return False

    with open(LOGIN_ARQUIVO, newline='', encoding='utf-8') as arquivo:
        reader = csv.DictReader(arquivo, delimiter=';')
        for row in reader:
            if (
                row['username'].strip().lower() == username.strip().lower()
                and row['senha'] == senha
                and (role is None or row['role'].strip().lower() == role.strip().lower())
            ):
                return row  # retorna o usuário completo
    return False

# Função para buscar o perfil do usuário no CSV
def get_user_profile(cliente_id):
    if not os.path.exists(LOGIN_ARQUIVO):
        return None

    with open(LOGIN_ARQUIVO, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter=';')
        for row in reader:
            if row['id'] == cliente_id:
                return row  # Retorna os dados do usuário como dicionário
    return None

def atualizar_usuario(id_usuario, novos_dados):
    """
    novos_dados é um dict com campos que devem ser atualizados.
    Exemplo: {"senha": "nova123"}
    """
    if not os.path.exists(LOGIN_ARQUIVO):
        return False

    linhas = []
    atualizado = False

    with open(LOGIN_ARQUIVO, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter=';')
        for row in reader:
            if row['id'] == str(id_usuario):
                row.update(novos_dados)
                atualizado = True
            linhas.append(row)

    if atualizado:
        with open(LOGIN_ARQUIVO, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=LOGIN_HEADERS, delimiter=';')
            writer.writeheader()
            writer.writerows(linhas)

    return atualizado

def email_existe(email):
    if not os.path.exists(LOGIN_ARQUIVO):
        return False

    with open(LOGIN_ARQUIVO, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter=';')
        for row in reader:
            if row["email"].strip().lower() == email.strip().lower():
                return True
    return False