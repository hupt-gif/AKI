// ==========================================================
// ============ CARREGAR CHAMADOS REAIS DO LOCALSTORAGE =====
// ==========================================================

let chamados = JSON.parse(localStorage.getItem("chamados")) || [];

// Garante que cada chamado tenha os campos esperados e um ID único
chamados = chamados.map((c, i) => ({
  id: c.id || `CH-${Date.now()}-${i + 1}`,  
  cliente: c.cliente || "Cliente não identificado",
  assunto: c.assunto || c.mensagem || "Sem assunto",
  status: c.status || "Aberto",
  categoria: c.categoria || "Geral",
  dataHora: c.dataHora || new Date().toLocaleString()
}));

// ==========================================================
// ============ ELEMENTOS DO DOM ============================
// ==========================================================
const tabela = document.getElementById("lista-chamados");
const popup = document.getElementById("popup");
const dadosCliente = document.getElementById("dados-cliente");
const chatMensagens = document.getElementById("chat-mensagens");

// ==========================================================
// ============ FUNÇÕES PRINCIPAIS ==========================
// ==========================================================

function renderizarChamados() {
  tabela.innerHTML = "";
  if (chamados.length === 0) {
    tabela.innerHTML = `<tr><td colspan="5">Nenhum chamado recebido ainda.</td></tr>`;
    return;
  }

  chamados.forEach(ch => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${ch.id}</td>
      <td>${ch.cliente}</td>
      <td>${ch.assunto}</td>
      <td>${ch.status}</td>
      <td>
        <button class="atender" onclick="abrirPopup('${ch.id}')">Atender</button>
        <button class="fechar" onclick="fecharChamado('${ch.id}')">Fechar</button>
      </td>
    `;
    tabela.appendChild(linha);
  });
}

function abrirPopup(id) {
  const chamado = chamados.find(c => c.id === id);
  if (!chamado) return;

  dadosCliente.innerHTML = `
    <p><strong>ID do chamado:</strong> ${chamado.id}</p>
    <p><strong>Cliente:</strong> ${chamado.cliente}</p>
    <p><strong>Assunto:</strong> ${chamado.assunto}</p>
    <p><strong>Categoria:</strong> ${chamado.categoria}</p>
    <p><strong>Status:</strong> ${chamado.status}</p>
    <p><strong>Aberto em:</strong> ${chamado.dataHora}</p>
  `;

  chatMensagens.innerHTML = "";
  adicionarMensagem("cliente", `Olá, estou com um problema: ${chamado.assunto}`);

  popup.style.display = "flex";
}

function fecharPopup() {
  popup.style.display = "none";
}

function adicionarMensagem(remetente, texto) {
  const div = document.createElement("div");
  const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  div.classList.add("msg", remetente);
  div.innerHTML = `<span>${texto}</span><small>${hora}</small>`;
  chatMensagens.appendChild(div);
  chatMensagens.scrollTo({ top: chatMensagens.scrollHeight, behavior: "smooth" });
}

function enviarMensagem() {
  const input = document.getElementById("mensagem");
  const texto = input.value.trim();
  if (!texto) return;

  adicionarMensagem("suporte", texto);
  input.value = "";

  adicionarMensagem("cliente", "Digitando...");
  setTimeout(() => {
    chatMensagens.lastChild.remove();
    adicionarMensagem("cliente", "Obrigado pelo retorno! Estou aguardando.");
  }, 1500);
}

// ==========================================================
// ============ FECHAR CHAMADOS =============================
// ==========================================================
function fecharChamado(id) {
  const chamado = chamados.find(c => c.id === id);
  if (chamado) {
    chamado.status = "Fechado";
    localStorage.setItem("chamados", JSON.stringify(chamados));
    renderizarChamados();
    alert(`Chamado #${id} foi fechado.`);
  }
}

// ==========================================================
// ============ FILTRO DE CHAMADOS ==========================
// ==========================================================
function filtrarChamados() {
  const termo = document.getElementById("buscar").value.toLowerCase();
  const linhas = document.querySelectorAll("#lista-chamados tr");
  linhas.forEach(linha => {
    const texto = linha.textContent.toLowerCase();
    linha.style.display = texto.includes(termo) ? "" : "none";
  });
}

// ==========================================================
// ============ LOGOUT E PERFIL ==============================
// ==========================================================
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "/login";
}

document.addEventListener("DOMContentLoaded", () => {
  const nome = localStorage.getItem("nome-funcionario");
  const cargo = localStorage.getItem("cargo-funcionario");
  const status = localStorage.getItem("status-funcionario") || "Online";

  if (nome) {
    document.getElementById("nome-funcionario").textContent = nome;
    const painel = document.getElementById("nome-painel");
    if (painel) painel.textContent = nome;
  }

  if (cargo) {
    const cargoEl = document.getElementById("cargo-painel");
    if (cargoEl) cargoEl.textContent = cargo;
  }

  const spanStatus = document.getElementById("status-painel");
  if (spanStatus) {
    spanStatus.textContent = status;
    spanStatus.style.color = status === "Online" ? "green" : "red";
  }

  renderizarChamados();
});

// ==========================================================
// ============ EVENTOS DE ATALHO E TEMAS ===================
// ==========================================================
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && popup.style.display === "flex") {
    fecharPopup();
  }
});

document.getElementById("toggle-theme")?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

const inputMensagem = document.getElementById("mensagem");
if (inputMensagem) {
  inputMensagem.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      enviarMensagem();
    }
  });
}

// ==========================================================
// ============ ATUALIZAÇÃO AUTOMÁTICA VIA STORAGE =========
// ==========================================================
window.addEventListener("storage", () => {
  chamados = JSON.parse(localStorage.getItem("chamados")) || [];
  renderizarChamados();
});

window.addEventListener("DOMContentLoaded", () => {
  fetch("/api/atendente")
    .then(res => res.json())
    .then(data => {
      if (!data.erro) {
        document.getElementById("nome-funcionario").textContent = data.nome;
        document.getElementById("nome-painel").textContent = data.nome;
        document.getElementById("cargo-painel").textContent = data.cargo;
        document.getElementById("status-painel").textContent = data.status;
      }
    })
    .catch(err => console.error("Erro ao carregar dados do atendente:", err));
});
