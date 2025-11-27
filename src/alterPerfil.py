import csv, os, uuid

ALTER_ARQUIVO = os.path.join('data/alterperfil.csv')
ALTER_HEADERS = ['id_alter', 'cliente_id', 'telefone', 'data_nasc']

os.makedirs(os.path.dirname(ALTER_ARQUIVO), exist_ok=True)

if not os.path.exists(ALTER_ARQUIVO):
    with open(ALTER_ARQUIVO, "w", newline="", encoding="utf-8") as f:
        csv.DictWriter(f, fieldnames=ALTER_HEADERS, delimiter=";").writeheader()
        
def alter_read():
    if not os.path.exists(ALTER_ARQUIVO):
        return []
    with open(ALTER_ARQUIVO, encoding="utf-8") as f:
        return list(csv.DictReader(f, delimiter=";"))

def _write(lista):
    with open(ALTER_ARQUIVO, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=ALTER_HEADERS, delimiter=";")
        writer.writeheader()
        writer.writerows(lista)
        
def salvar_tel_nasc(cliente_id, telefone, data_nasc):
    registros = alter_read()

    existente = next((r for r in registros if r["cliente_id"] == str(cliente_id)), None)

    if not existente:

        novo = {
            "id_alter": str(uuid.uuid4()),
            "cliente_id": str(cliente_id),
            "telefone": telefone,
            "data_nasc": data_nasc
        }
        registros.append(novo)
        _write(registros)
        return True

    existente["telefone"] = telefone
    existente["data_nasc"] = data_nasc
    _write(registros)
    return True

    
def telefone_existe(telefone):
    return any(r["telefone"] == telefone for r in alter_read())

def nasc_existe(cliente_id):
    return any(r["cliente_id"] == str(cliente_id) and r["data_nasc"] for r in alter_read())
