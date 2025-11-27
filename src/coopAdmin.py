import csv, os, uuid

COOPERATIVA_ARQUIVO = 'data/cooperativa.csv'
COOPERATIVA_HEADERS = ['id_cooperativa', 'nome', 'cnpj', 'telefone', 'email', 'cep', 'rua', 'bairro', 'cidade', 'numero']

def carregar_cooperativa():
    if not os.path.exists(COOPERATIVA_ARQUIVO):
        return []
    
    with open(COOPERATIVA_ARQUIVO, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter=';')
        return list(reader)

def salvar_cooperativa(cooperativa):
    with open(COOPERATIVA_ARQUIVO, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=COOPERATIVA_HEADERS, delimiter=';')
        writer.writeheader()
        writer.writerows(cooperativa)

# -- Adicionar cooperativa
def adicionar_cooperativa(data):
    cooperativa = carregar_cooperativa()
    nova_cooperativa = {
        'id_cooperativa': str(uuid.uuid4()),
        'nome': data.get('nome'),
        'cnpj': data.get('cnpj'),
        'telefone': data.get('telefone'),
        'email': data.get('email'),
        'cep': data.get('cep'),
        'rua': data.get('rua'),
        'bairro': data.get('bairro'),
        'cidade': data.get('cidade'),
        'numero': data.get('numero')
    }
    cooperativa.append(nova_cooperativa)
    salvar_cooperativa(cooperativa)
    return nova_cooperativa

# -- Editar cooperativa
def editar_cooperativa(cooperativa_id, novos_dados):
    cooperativa = carregar_cooperativa()
    for o in cooperativa:
        if o['id_cooperativa'] == cooperativa_id:
            o.update(novos_dados)
            salvar_cooperativa(cooperativa)
            return o
    return None

# -- Excluir cooperativa
def excluir_cooperativa(cooperativa_id):
    cooperativa = carregar_cooperativa()
    novos = [o for o in cooperativa if o['id_cooperativa'] != cooperativa_id]
    salvar_cooperativa(novos)
    return len(cooperativa) != len(novos)

def obter_nome_cooperativa(coop_id):
    with open(COOPERATIVA_ARQUIVO, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter=';')
        for row in reader:
            if row['id_cooperativa'] == str(coop_id):
                return row['nome']
