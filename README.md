# AKI
Projeto educacional do primeiro semestre de DS
# Sistema de Gestão para E-commerce com Foco em Sustentabilidade

## Sobre o Projeto

Este projeto consiste no desenvolvimento de uma solução de software para e-commerce, simulando as operações de uma Software House. O sistema foi projetado para atender às necessidades de gestão de vendas e cadastros, com um diferencial estratégico voltado para a responsabilidade social e ambiental.

A aplicação oferece um painel administrativo completo para o gerenciamento de dados vitais do negócio, fomentando a economia circular através da integração com cooperativas de reciclagem.

### Alinhamento com os Objetivos de Desenvolvimento Sustentável (ODS) da ONU

O projeto foi concebido seguindo as diretrizes da ONU, especificamente:

* **ODS 7 (Energia Limpa e Acessível):** Foco em eficiência sistêmica.
* **ODS 8 (Trabalho Decente e Crescimento Econômico):** Fomento à economia local e apoio a cooperativas.
* **ODS 12 (Consumo e Produção Responsáveis):** Incentivo à destinação correta de resíduos e parcerias com cooperativas de reciclagem.

## Funcionalidades

O sistema contempla as operações fundamentais (CRUD - Create, Read, Update, Delete) para as seguintes entidades:

* **Gestão de Usuários:** Controle de acesso e administração de perfis.
* **Gestão de Produtos:** Cadastro, edição e controle de inventário.
* **Parceiros e Cooperativas:** Módulo dedicado ao cadastro de cooperativas de reciclagem parceiras, integrando o e-commerce à logística reversa.
* **Relatórios de Vendas:** Visualização e acompanhamento do desempenho comercial.

Além das funcionalidades técnicas, o produto foi idealizado com foco em atendimento ágil e suporte humanizado.

## Tecnologias Utilizadas

O desenvolvimento priorizou o entendimento profundo das linguagens base e a lógica de programação, optando por não utilizar frameworks pesados no frontend e focando na agilidade do Python no backend.

### Backend
* **Linguagem:** Python
* **Framework Web:** Flask (pela sua leveza e flexibilidade)
* **Persistência de Dados:** Manipulação de arquivos CSV.
    * *Nota:* A escolha por CSV visa fins educacionais para demonstrar a manipulação direta de arquivos e estruturas de dados sem a abstração de um SGBD complexo.

### Frontend
* **Estrutura:** HTML5 Semântico
* **Estilização:** CSS3 (Customizado, sem uso de frameworks como Bootstrap)
* **Interatividade:** JavaScript (Vanilla JS)

## Pré-requisitos

Para executar este projeto localmente, certifique-se de ter instalado:

* Python 3.x
* Pip (Gerenciador de pacotes do Python)

## Instalação e Execução

Siga os passos abaixo para configurar o ambiente de desenvolvimento:

1. Clone o repositório:
   ```bash
   git clone [https://github.com/hupt-gif/AKI.git]

2. Acesse o diretório do projeto:
   cd Aki

3. Crie um ambiente virtual (recomendado):
   # No Windows
  python -m venv venv
  .\venv\Scripts\activate

  # No Linux/Mac
  python3 -m venv venv
  source venv/bin/activate

4. Instale todas as dependências.
   pip install flask  

5. Execute a aplicação:
   python main.py
