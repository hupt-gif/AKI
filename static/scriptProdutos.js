// Função para carregar produtos do CSV
async function carregarCSV() {
  console.log("Carregando CSV...");
  try {
    // Evita cache adicionando timestamp
    const resposta = await fetch(`/produtos.csv?nocache=${Date.now()}`);
    console.log("Resposta do fetch:", resposta);

    if (!resposta.ok) throw new Error("Erro ao carregar o CSV");

    const texto = await resposta.text();

    // Divide linhas e remove o cabeçalho
    const linhas = texto.trim().split("\n");
    linhas.shift(); // remove cabeçalho

    const corpoTabela = document.querySelector("#tabela-produtos tbody");
    corpoTabela.innerHTML = "";

    if (linhas.length === 0) {
      corpoTabela.innerHTML = `<tr><td colspan="5">Nenhum produto cadastrado ainda 💤</td></tr>`;
      return;
    }

    linhas.forEach(linha => {
      // Regex para separar corretamente os campos entre aspas
      const campos = linha.match(/(".*?"|[^;]+)(?=;|$)/g)?.map(c => c.replace(/^"|"$/g, ""));
      if (!campos || campos.length < 6) return;

      const [produto_id, nome, descricao, preco, estoque, fotoURL] = campos;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><img src="${fotoURL}" alt="${nome}" class="img-produto" onclick="abrirImagem('${fotoURL}')"></td>
        <td>${nome}</td>
        <td>${descricao}</td>
        <td>R$ ${parseFloat(preco).toFixed(2)}</td>
        <td>
          <button class="btn-carrinho" onclick="adicionarAoCarrinho('${produto_id}', '${nome}', ${parseFloat(preco)})">
            🛒 Adicionar ao Carrinho
          </button>
        </td>
      `;

      const img = tr.querySelector("img");
      img.addEventListener("click", () => abrirImagem(fotoURL));

      corpoTabela.appendChild(tr);
    });

  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
    document.querySelector("#tabela-produtos tbody").innerHTML =
      `<tr><td colspan="5">Erro ao carregar produtos 😢</td></tr>`;
  }
}

// Função de busca/filtro
function filtrarProdutos() {
  const filtro = document.getElementById("campo-busca").value.toLowerCase();
  const linhas = document.querySelectorAll("#tabela-produtos tbody tr");

  linhas.forEach(linha => {
    const textoLinha = linha.textContent.toLowerCase();
    linha.style.display = textoLinha.includes(filtro) ? "" : "none";
  });
}

// Pop-up de imagem
function abrirImagem(src) {
  const popup = document.getElementById("popup-imagem");
  const img = document.getElementById("imagem-expandida");
  img.src = src;
  popup.style.display = "flex";

  popup.onclick = function(event) {
    if (event.target === popup) {
      fecharImagem();
    }
  };
}

function fecharImagem() {
  const popup = document.getElementById("popup-imagem");
  popup.style.display = "none";
  popup.onclick = null;
}

// Função de adicionar produto ao carrinho
function adicionarAoCarrinho(id, nome, preco) {
  // Aqui podemos adicionar o produto ao localStorage (ou qualquer outra estrutura de dados)
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  
  const produtoExistente = carrinho.find(produto => produto.id === id);
  if (produtoExistente) {
    produtoExistente.quantidade += 1;
  } else {
    carrinho.push({ id, nome, preco, quantidade: 1 });
  }

  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  
  // Exibe uma mensagem de confirmação
  alert(`✅ Produto adicionado ao carrinho:\n${nome} - R$ ${preco.toFixed(2)}`);
}

// Função de voltar para a página inicial
function voltarInicio() {
  window.location.href = "/akiCooperativa";
}

// Quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  carregarCSV();
  setInterval(carregarCSV, 5000); // atualiza a cada 5 segundos
});

// Adiciona o botão de voltar ao topo da página
const btnVoltar = document.createElement("button");
btnVoltar.textContent = "Voltar para a Página Inicial";
btnVoltar.classList.add("btn-voltar");
btnVoltar.onclick = voltarInicio;
document.body.appendChild(btnVoltar);