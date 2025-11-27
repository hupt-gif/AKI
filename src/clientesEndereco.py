import csv, os, time

ARQUIVO_ENDERECO = "data/enderecos.csv"
HEADERS_ENDERECO = ["endereco_id", "cliente_id", "tipo", "cep", "rua","bairro", "cidade", "numero", "complemento"]


os.makedirs(os.path.dirname(ARQUIVO_ENDERECO) or ".", exist_ok=True)
if not os.path.exists(ARQUIVO_ENDERECO):
    with open(ARQUIVO_ENDERECO, "w", newline="", encoding="utf-8") as f:
        csv.writer(f, delimiter=";").writerow(HEADERS_ENDERECO)

def _read():
    with open(ARQUIVO_ENDERECO, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f, delimiter=";"))

def _write(lista):
    with open(ARQUIVO_ENDERECO, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=HEADERS_ENDERECO, delimiter=";")
        writer.writeheader()
        writer.writerows(lista)

def adicionar_endereco(dados):
    cid = dados.get("cliente_id")
    if not cid or str(cid).strip().lower() in ["null", "none", "undefined", ""]:
        raise ValueError("cliente_id inválido ou ausente.")

    novo = {k: dados.get(k, "") for k in HEADERS_ENDERECO}
    novo["cliente_id"] = str(cid)
    novo["endereco_id"] = str(int(time.time() * 1000))

    enderecos = _read()
    enderecos.append(novo)
    _write(enderecos)

    return novo

def get_enderecos_cliente(cliente_id):
    if not cliente_id:
        return []

    return [e for e in _read() if e["cliente_id"] == str(cliente_id)]

def remover_endereco(endereco_id):
    enderecos = _read()
    novos = [e for e in enderecos if e["endereco_id"] != endereco_id]
    _write(novos)
    return True
