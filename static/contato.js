/*Objetivo do sistema

Permitir que um usuário envie uma mensagem via formulário HTML e que os dados:

Sejam enviados via fetch() (JavaScript) no formato JSON

Sejam recebidos por um backend Flask

Sejam salvos em um arquivo .csv como base de dados

Ganhem um id único gerado com data e hora legível da requisição*/


document.getElementById('contato-form').addEventListener('submit', function (event) {
  event.preventDefault(); // Evita o recarregamento da página

  const formData = new FormData(this);
  const jsonData = {};
  const formulario = this;

  formData.forEach((value, key) => {
    jsonData[key] = value;
  });

  fetch('http://localhost:5000/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jsonData)
  })

    .then(res => res.json())
    .then(data => {
      document.getElementById('submit').textContent = data.mensagem || data.erro;
      alert("Mensagem enviada!")
      formulario.reset(); // Limpa o formulário após envio
    })

    .catch(err => {
      const errorMessage = 'Erro ao enviar: ' + err;
      document.getElementById('submit').textContent = errorMessage;
    });
});

// Smooth scrolling para links de navegação
// Seleciona todos os links que começam com '#' no href
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  // Adiciona um evento de clique para cada link
  anchor.addEventListener('click', function (e) {
    e.preventDefault(); // Impede o comportamento padrão do link (pular instantaneamente)

    // Pega o elemento que corresponde ao ID do href do link
    const target = document.querySelector(this.getAttribute('href'));

    if (target) {
      // Faz a página rolar suavemente até o elemento
      target.scrollIntoView({
        behavior: 'smooth', // rolagem suave
        block: 'start'      // alinha o topo do elemento ao topo da tela
      });
    }
  });
});

// Configuração da animação de entrada para os cards da equipe
const observerOptions = {
  threshold: 0.1, // porcentagem do card visível para ativar
  rootMargin: '0px 0px -50px 0px' // margem para ativar a animação
};

// Cria o observador que detecta quando o card entra na tela
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { // Se o card estiver visível
      entry.target.style.opacity = '1'; // Torna visível
      entry.target.style.transform = 'translateY(0)'; // Move para a posição original
    }
  });
}, observerOptions);

// Aplica animação em cada card da equipe
document.querySelectorAll('.team-card').forEach((card, index) => {
  card.style.opacity = '0'; // Começa invisível
  card.style.transform = 'translateY(30px)'; // Um pouco deslocado para baixo
  card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`; // Animação com atraso gradual
  observer.observe(card); // Observa o card
});
