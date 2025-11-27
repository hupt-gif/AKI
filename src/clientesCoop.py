# -- Arquivo parcialmente desabilitado, substituído por usuarios

import csv
import os
import uuid

ARQUIVO_CLIENTES = 'data/clientesCoop.csv'
HEADERS_CLIENTES = ['id_cliente', 'nome', 'cpf', 'email', 'telefone', 'data_nasc']


def carregar_clientes():
    if not os.path.exists(ARQUIVO_CLIENTES):
        return []
    
    with open(ARQUIVO_CLIENTES, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter=';')
        return list(reader)


def salvar_clientes(lista):
    with open(ARQUIVO_CLIENTES, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=HEADERS_CLIENTES, delimiter=';')
        writer.writeheader()
        writer.writerows(lista)


def salvar_cliente(dados):
    clientes = carregar_clientes()

    novo = {
        'id_cliente': str(uuid.uuid4()),
        'nome': dados.get('nome', ''),
        'cpf': dados.get('cpf', ''),
        'email': dados.get('email', ''),
        'telefone': dados.get('telefone', ''),
        'data_nasc': dados.get('data_nasc', ''),
    }

    clientes.append(novo)
    salvar_clientes(clientes)
    return novo


def cliente_existe(cpf=None, email=None):
    clientes = carregar_clientes()

    for c in clientes:
        if cpf and c['cpf'] == cpf:
            return True
        if email and c['email'].lower() == email.lower():
            return True
    return False


def buscar_cliente_por_email(email):
    clientes = carregar_clientes()
    for c in clientes:
        if c['email'].lower() == email.lower():
            return c
    return None
