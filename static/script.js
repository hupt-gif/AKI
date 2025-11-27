//CONTATO
// Aguarda o conteúdo da página ser totalmente carregado para executar o script
document.addEventListener('DOMContentLoaded', function() {
    
    // Seleciona o formulário e o elemento de status pelo ID
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    // Adiciona um "ouvinte" para o evento de envio (submit) do formulário
    contactForm.addEventListener('submit', function(event) {
        
        // Impede o comportamento padrão do formulário, que é recarregar a página
        event.preventDefault();

        // Limpa mensagens de status anteriores
        formStatus.textContent = '';
        formStatus.className = ''; // Remove classes como 'success' ou 'error'

        // **INÍCIO DA SIMULAÇÃO**
        // Em um projeto real, aqui você enviaria os dados para um servidor.
        // Como não temos um servidor (backend), vamos apenas simular o sucesso.
        
        // Coleta os dados do formulário (opcional para a simulação, mas útil para o backend)
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        
        console.log('Formulário enviado com os seguintes dados:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        // Exibe uma mensagem de sucesso
        formStatus.textContent = `Obrigado, ${name}! Sua mensagem foi enviada com sucesso.`;
        formStatus.classList.add('success'); // Adiciona a classe CSS para o estilo de sucesso
        
        // Limpa os campos do formulário após o envio
        contactForm.reset();

        // Faz a mensagem de sucesso desaparecer após 5 segundos
        setTimeout(() => {
            formStatus.textContent = '';
            formStatus.classList.remove('success');
        }, 5000); // 5000 milissegundos = 5 segundos

        // **FIM DA SIMULAÇÃO**
    });
});



// Função para exibir mensagens de login/registro
function exibirMensagemLogin(texto, tipo, idElemento) {
    const el = document.getElementById(idElemento);
    el.textContent = texto;
    el.className = tipo;
    el.style.display = 'block';
  }
  
  // Login
  const formLogin = document.getElementById('form-login');
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const dados = {
      username: formLogin.username.value.trim(),
      senha: formLogin.senha.value.trim(),
    };
  
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dados),
      });
  
      const json = await res.json();
  
      if (res.ok) {
        exibirMensagemLogin(json.message, 'sucesso', 'mensagem-login');
        formLogin.reset();
      } else {
        exibirMensagemLogin(json.message, 'erro', 'mensagem-login');
      }
    } catch (error) {
      exibirMensagemLogin('Erro na conexão com o servidor.', 'erro', 'mensagem-login');
    }
});
  
// Registro
const formRegistro = document.getElementById('form-registro');
  formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const dados = {
      username: formRegistro.username.value.trim(),
      senha: formRegistro.senha.value.trim(),
    };
  
    try {
      const res = await fetch('/registro', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dados),
      });
  
      const json = await res.json();
  
      if (res.ok) {
        exibirMensagemLogin(json.message, 'sucesso', 'mensagem-registro');
        formRegistro.reset();
      } else {
        exibirMensagemLogin(json.message, 'erro', 'mensagem-registro');
      }
    } catch (error) {
      exibirMensagemLogin('Erro na conexão com o servidor.', 'erro', 'mensagem-registro');
    }
});
  