// scriptAdmin.js

document.addEventListener('DOMContentLoaded', function() {
    // Adiciona um evento de clique para o botão de gerenciamento de usuários
    const btnUsuarios = document.querySelector('.btn-primary');
    if (btnUsuarios) {
        btnUsuarios.addEventListener('click', function() {
            alert('Você clicou em Gerenciar Usuários/Clientes!');
        });
    }

    // Adiciona um evento de clique para o botão de gerenciamento de produtos
    const btnProdutos = document.querySelector('.btn-success');
    if (btnProdutos) {
        btnProdutos.addEventListener('click', function() {
            alert('Você clicou em Gerenciar Produtos!');
        });
    }

    // Adiciona um evento de clique para o botão de gerenciamento da cooperativa
    const btnCooperativa = document.querySelector('.btn-warning');
    if (btnCooperativa) {
        btnCooperativa.addEventListener('click', function() {
            alert('Você clicou em Gerenciar Cooperativa!');
        });
    }
});
