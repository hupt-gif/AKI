import csv, os, uuid

ARQUIVO_PAGAMENTOS = os.path.join("data", "pagamentos.csv")
HEADERS_PAG = ["id", "cliente_id", "tipo", "apelido", "info_mascarada"]

os.makedirs(os.path.dirname(ARQUIVO_PAGAMENTOS), exist_ok=True)

def _init_db():
    if not os.path.exists(ARQUIVO_PAGAMENTOS):
        with open(ARQUIVO_PAGAMENTOS, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=HEADERS_PAG, delimiter=";")
            writer.writeheader()

def listar_pagamentos(cliente_id):
    _init_db()
    resultados = []
    with open(ARQUIVO_PAGAMENTOS, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            if row["cliente_id"] == str(cliente_id):
                resultados.append(row)
    return resultados

def adicionar_pagamento(dados):
    _init_db()

    numero = dados.get("numero_cartao", "0000")
    final = numero[-4:] if len(numero) >= 4 else numero
    info = f"**** **** **** {final}"

    novo_metodo = {
        "id": str(uuid.uuid4()),
        "cliente_id": str(dados["cliente_id"]),
        "tipo": dados.get("tipo", "Cartão de Crédito"),
        "apelido": dados.get("apelido", "Meu Cartão"),
        "info_mascarada": info
    }

    with open(ARQUIVO_PAGAMENTOS, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=HEADERS_PAG, delimiter=";")
        writer.writerow(novo_metodo)
    
    return novo_metodo

def remover_pagamento(pagamento_id):
    _init_db()
    linhas = []
    removido = False
    
    with open(ARQUIVO_PAGAMENTOS, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            if row["id"] == pagamento_id:
                removido = True 
            else:
                linhas.append(row)
    
    if removido:
        with open(ARQUIVO_PAGAMENTOS, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=HEADERS_PAG, delimiter=";")
            writer.writeheader()
            writer.writerows(linhas)
            
    return removido