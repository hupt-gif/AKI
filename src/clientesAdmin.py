# -- Acredito que será alterado ou substituído após a apresentação

import csv, os, uuid

CLIENTES_ARQUIVO = 'data/clientesCoop.csv'
CLIENTES_HEADERS = ['id_cliente', 'nome', 'cpf', 'email', 'telefone', 'data_nasc']

def carregar_clientes():
    if not os.path.exists(CLIENTES_ARQUIVO):
        return []
    
    with open(CLIENTES_ARQUIVO, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter=';')
        return list(reader)

def salvar_clientes(clientes):
    with open(CLIENTES_ARQUIVO, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=CLIENTES_HEADERS, delimiter=';')
        writer.writeheader()
        writer.writerows(clientes)

def adicionar_cliente(data):
    clientes = carregar_clientes()

    novo_cliente = {
        'id_cliente': str(uuid.uuid4()),
        'nome': data.get('nome', ''),
        'cpf': data.get('cpf', ''),
        'email': data.get('email', ''),
        'telefone': data.get('telefone', ''),
        'data_nasc': data.get('data_nasc', ''),
    }

    clientes.append(novo_cliente)
    salvar_clientes(clientes)
    return novo_cliente

def editar_cliente(cliente_id, novos_dados):
    clientes = carregar_clientes()

    for c in clientes:
        if c['id_cliente'] == cliente_id:
            c.update(novos_dados)
            salvar_clientes(clientes)
            return c
    return None

def excluir_cliente(cliente_id):
    clientes = carregar_clientes()
    novos = [c for c in clientes if c['id_cliente'] != cliente_id]
    
    salvar_clientes(novos)
    return len(clientes) != len(novos)
