// Seleção de botões e campos
const btnEditar = document.getElementById("btn-editar-perfil");
const btnSalvar = document.getElementById("btn-salvar");

const campos = [
  { id: "nome-funcionario", label: "Nome" },
  { id: "cargo-funcionario", label: "Cargo" },
  { id: "email-funcionario", label: "Email" },
  { id: "telefone-funcionario", label: "Telefone" }
];

// Transformar spans em inputs para edição
btnEditar.addEventListener("click", () => {
  campos.forEach(c => {
    const elem = document.getElementById(c.id);
    const valor = elem.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.id = c.id + "-input";
    input.value = valor;
    input.required = true; // garante que o campo seja preenchido
    elem.replaceWith(input);
  });
  btnEditar.style.display = "none";
  btnSalvar.style.display = "inline-block";
});

// Salvar alterações com validação
btnSalvar.addEventListener("click", () => {
  let valido = true;

  // Verifica se algum campo está vazio
  campos.forEach(c => {
    const input = document.getElementById(c.id + "-input");
    if (!input.value.trim()) valido = false;
  });

  if (!valido) {
    alert("Por favor, preencha todos os campos.");
    return; // Sai sem salvar
  }

  // Atualiza spans e salva no localStorage
  campos.forEach(c => {
    const input = document.getElementById(c.id + "-input");
    const span = document.createElement("span");
    span.id = c.id;
    span.textContent = input.value.trim();
    input.replaceWith(span);
    localStorage.setItem(c.id, span.textContent);
  });

  btnSalvar.style.display = "none";
  btnEditar.style.display = "inline-block";
  alert("Perfil atualizado com sucesso!");
});

// Trocar foto de perfil
document.getElementById("upload-foto").addEventListener("change", function(event){
  const file = event.target.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = function(e){
      document.getElementById("foto-perfil").src = e.target.result;
      localStorage.setItem("foto-perfil", e.target.result); // salva a foto no localStorage
    }
    reader.readAsDataURL(file);
  }
});

// Logout
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "/login";
}

// Status online
function atualizarStatusOnline(online = true) {
  const status = document.querySelector(".info-perfil .online");
  if (online) {
    status.textContent = "Online";
    status.style.color = "green";
  } else {
    status.textContent = "Offline";
    status.style.color = "red";
  }
}

// Carregar dados do localStorage ao abrir a página
window.addEventListener("DOMContentLoaded", () => {
  campos.forEach(c => {
    const valor = localStorage.getItem(c.id);
    if (valor) document.getElementById(c.id).textContent = valor;
  });

  const foto = localStorage.getItem("foto-perfil");
  if (foto) document.getElementById("foto-perfil").src = foto;

  atualizarStatusOnline(true);
});
