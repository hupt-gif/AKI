// Login
document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = e.target.username.value;
  const senha = e.target.senha.value;

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, senha })
  });

  const data = await res.json();
  const mensagem = document.getElementById('mensagemLogin');
  mensagem.textContent = data.message;
  mensagem.style.color = res.ok ? 'green' : 'red';

  if (res.ok && data.redirect) {
    setTimeout(() => {
      window.location.href = data.redirect;
    }, 450)
  }
});