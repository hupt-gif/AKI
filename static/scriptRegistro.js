// Função para validar CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, ''); // remover tudo que não é número

  if (cpf.length !== 11) return false;

  // Rejeitar CPFs com todos os dígitos iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Validação dos dígitos verificadores
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i]) * (10 - i);
  }
  let dig1 = 11 - (soma % 11);
  dig1 = dig1 > 9 ? 0 : dig1;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i]) * (11 - i);
  }
  let dig2 = 11 - (soma % 11);
  dig2 = dig2 > 9 ? 0 : dig2;

  return dig1 === parseInt(cpf[9]) && dig2 === parseInt(cpf[10]);
}

//Máscara de cpf
document.getElementById('cpf').addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, ''); // remove tudo que não é número

  if (value.length > 11) value = value.slice(0, 11);

  // aplica a máscara
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  e.target.value = value;
});


// Registro
document.getElementById('formRegistro').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = e.target.username.value;
  const nome = e.target.nome.value;
  const cpf = e.target.cpf.value;
  const email = e.target.email.value;
  const senha = e.target.senha.value;
  const confirmarSenha = e.target.confirmarSenha.value;

  const mensagem = document.getElementById('mensagemRegistro');

  // ✔️ Comparar as senhas
  if (senha !== confirmarSenha) {
    mensagem.textContent = "As senhas não coincidem!";
    mensagem.style.color = "red";
    return;
  }

  // ✔️ Validar CPF
  if (!validarCPF(cpf)) {
    mensagem.textContent = "CPF inválido!";
    mensagem.style.color = "red";
    return;
  }

  const res = await fetch('/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, nome, cpf, email, senha })
  });

  const data = await res.json();
  mensagem.textContent = data.message;
  mensagem.style.color = res.ok ? 'green' : 'red';


  if (res.ok) {
    setTimeout(() => {
      window.location.href = '/login';
    }, 450);
  }
});