import csv, os, uuid

PRODUTOS_ARQUIVO = 'data/produtos.csv'
PRODUTOS_HEADERS = ['produto_id', 'nome', 'descricao', 'preco', 'estoque', 'fotoURL']

def carregar_produtos():
    if not os.path.exists(PRODUTOS_ARQUIVO):
        return []
    with open(PRODUTOS_ARQUIVO, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter=';')
        return list(reader)

def salvar_produtos(produtos):
    with open(PRODUTOS_ARQUIVO, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=PRODUTOS_HEADERS, delimiter=';')
        writer.writeheader()
        writer.writerows(produtos)

def adicionar_produto(data):
    produtos = carregar_produtos()
    novo_produto = {
        'produto_id': str(uuid.uuid4()),
        'nome': data.get('nome'),
        'descricao': data.get('descricao'),
        'preco': data.get('preco'),
        'estoque': data.get('estoque'),
        'fotoURL': data.get('fotoURL')
    }
    produtos.append(novo_produto)
    salvar_produtos(produtos)
    return novo_produto

def editar_produto(produto_id, novos_dados):
    produtos = carregar_produtos()
    for p in produtos:
        if p['produto_id'] == produto_id:
            p.update(novos_dados)
            salvar_produtos(produtos)
            return p
    return None

def excluir_produto(produto_id):
    produtos = carregar_produtos()
    novos = [p for p in produtos if p['produto_id'] != produto_id]
    salvar_produtos(novos)
    return len(produtos) != len(novos)
