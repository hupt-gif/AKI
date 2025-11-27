import csv, os

ARQUIVO_CONTATO = './data/contato.csv' 
HEADERS_CONTATO = ['idContato', 'nome', 'email', 'mensagem']

def salvar_em_csv(dados):
    arquivo_existe = os.path.isfile(ARQUIVO_CONTATO)

    with open(ARQUIVO_CONTATO, 'a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=dados.keys())
        
        if not arquivo_existe:
            writer.writeheader()
        
        writer.writerow(dados)

def verificarContato(nome, email):
    salvar_em_csv()
    if not os.path.exists(ARQUIVO_CONTATO):
        return False

    with open(ARQUIVO_CONTATO, 'r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['nome'].lower() == nome.lower() and row['email'].lower() == email.lower():
                return True
    return False

def validarMensagem(mensagem):
    if not mensagem or len(mensagem.strip()) < 1:
        return False
    return True
