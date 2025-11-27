import csv, os
from datetime import datetime
from collections import defaultdict


ARQUIVO_PEDIDOS = os.path.join(os.path.dirname(__file__), '..', 'data', 'pedidos.csv')
CABECALHO = ['id_pedido', 'cliente_id', 'produtos', 'valor_total', 'data_hora', 'status']

def salvar_pedido(cliente_id, lista_produtos, valor_total):
    id_pedido = datetime.now().strftime('%Y%m%d_%H%M%S')
    data_hora = datetime.now().strftime('%d-%m-%Y %H:%M:%S')
    status = "Aprovado"

    nomes_produtos = []
    if isinstance(lista_produtos, list):
        for item in lista_produtos:
            nome = item.get('name', 'Produto Desconhecido')
            qtd = item.get('quantity', 1)
            nomes_produtos.append(f"{nome} (Qtd: {qtd})")

    produtos_str = " | ".join(nomes_produtos)
    novo_pedido = [id_pedido, cliente_id, produtos_str, valor_total, data_hora, status]

    try:
        os.makedirs(os.path.dirname(ARQUIVO_PEDIDOS), exist_ok=True)
        arquivo_existe = os.path.isfile(ARQUIVO_PEDIDOS)

        with open(ARQUIVO_PEDIDOS, mode='a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file, delimiter=';')

            if not arquivo_existe:
                writer.writerow(CABECALHO)

            writer.writerow(novo_pedido)

        return True

    except Exception as e:
        print(f"❌ Erro ao salvar o pedido: {e}")
        return False

def ler_pedidos():
    pedidos = []
    try:
        with open(ARQUIVO_PEDIDOS, mode='r', encoding='utf-8') as file:
            reader = csv.reader(file, delimiter=';')
            next(reader, None)
            for row in reader:
                pedidos.append(row)
    except FileNotFoundError:
        print("⚠️ Arquivo pedidos.csv ainda não foi criado.")
    except Exception as e:
        print(f"❌ Erro ao ler o arquivo CSV: {e}")

    return pedidos

# -- Filtro de pedidos por usuário
def get_pedidos_por_usuario(id):
    pedidos_cliente = []
    pedidos = ler_pedidos()

    for row in pedidos:
        id_pedido, cliente_id_csv, produtos, valor_total, data_hora, status = row

        if cliente_id_csv == id:
            pedidos_cliente.append({
                "id": id_pedido,
                "cliente_id": id,
                "produtos": produtos,
                "valor_total": float(valor_total),
                "data": data_hora,
                "status": status
            })

    return pedidos_cliente

# -- Filtro de pedidos por data
def filtrar_por_data(data_inicial=None, data_final=None):
    pedidos = ler_pedidos()
    filtrados = []

    for row in pedidos:
        _, cliente_id, produtos, valor_total, data_hora, status = row
        dt = datetime.strptime(data_hora, "%d-%m-%Y %H:%M:%S")

        if data_inicial:
            if dt < datetime.strptime(data_inicial, "%d-%m-%Y"):
                continue

        if data_final:
            if dt > datetime.strptime(data_final, "%d-%m-%Y"):
                continue

        filtrados.append(row)

    return filtrados

# -- Filtro de pedidos por status
def filtrar_por_status(status):
    pedidos = ler_pedidos()
    return [p for p in pedidos if p[5].lower() == status.lower()]

# -- Filtro de pedidos por valor
def filtrar_por_valor(valor_min=None, valor_max=None):
    pedidos = ler_pedidos()
    filtrados = []

    for row in pedidos:
        valor = float(row[3])

        if valor_min is not None and valor < valor_min:
            continue

        if valor_max is not None and valor > valor_max:
            continue

        filtrados.append(row)

    return filtrados

# -- Chart de vendas por dia
def vendas_por_dia():
    pedidos = ler_pedidos()
    resultados = defaultdict(float)

    for row in pedidos:
        _, _, _, valor_total, data_hora, _ = row

        dia = data_hora.split(" ")[0]  # dd-mm-YYYY
        resultados[dia] += float(valor_total)

    return dict(resultados)

# -- Chart de pedidos por status
def pedidos_por_status():
    pedidos = ler_pedidos()
    contagem = defaultdict(int)

    for row in pedidos:
        status = row[5]
        contagem[status] += 1

    return dict(contagem)

# -- Chart produtos mais vendidos
def produtos_mais_vendidos():
    pedidos = ler_pedidos()
    ranking = defaultdict(int)

    for row in pedidos:
        produtos_str = row[2]
        produtos = produtos_str.split(" | ")

        for item in produtos:
            nome = item.split("(Qtd")[0].strip()
            ranking[nome] += 1

    return dict(sorted(ranking.items(), key=lambda x: x[1], reverse=True))
