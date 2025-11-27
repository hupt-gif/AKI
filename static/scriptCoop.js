console.log('Inicializando ScriptCoop Unificado');

document.addEventListener('DOMContentLoaded', () => {
    /* ============================================================
       VARIÁVEIS GLOBAIS DE PAGAMENTO
    ============================================================ */
    let metodoSelecionado = null; // Armazena se é 'pix', 'boleto' ou 'credito'

    /* ============================================================
       CONFIGURAÇÃO DO CARRINHO (ÚNICO E UNIFICADO)
    ============================================================ */
    const cartKey = 'akiCooperativaCart';

    const getCart = () => JSON.parse(sessionStorage.getItem(cartKey)) || [];
    const saveCart = (cart) => sessionStorage.setItem(cartKey, JSON.stringify(cart));

    const updateCartIcon = () => {
        const cart = getCart();
        const icon = document.querySelector('.cart-item-count');
        if (icon) icon.textContent = cart.reduce((t, i) => t + i.quantity, 0);
    };

    const formatCurrency = (v) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    /* ============================================================
       TOAST (NOTIFICAÇÃO)
    ============================================================ */
    const toastElement = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    let toastTimeout;

    const showToast = (message) => {
        if (!toastElement) return;
        clearTimeout(toastTimeout);
        toastMessage.textContent = message;
        toastElement.classList.add('show');
        toastTimeout = setTimeout(() => toastElement.classList.remove('show'), 3000);
    };

    /* ============================================================
       FUNÇÃO ÚNICA PARA ADICIONAR AO CARRINHO
    ============================================================ */
    window.adicionarAoCarrinho = (id, nome, preco, imagem = "") => {
        const cart = getCart();
        const item = cart.find(p => p.id === id);
        if (item) {
            item.quantity++;
        } else {
            cart.push({
                id,
                name: nome,
                price: parseFloat(preco),
                image: imagem,
                quantity: 1
            });
        }
        // alert(`Produto adicionado ao carrinho: ${nome}`); // Opcional se usar Toast
        showToast(`Adicionado: ${nome}`);
        saveCart(cart);
        updateCartIcon();
    };

    /* ============================================================
       ADICIONAR AO CARRINHO EM CARDS DA PÁGINA INICIAL
    ============================================================ */
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            adicionarAoCarrinho(
                card.dataset.id,
                card.dataset.name,
                card.dataset.price,
                card.dataset.image
            );
        });
    });

    /* ============================================================
       CARRINHO (cart.html)
    ============================================================ */
    const renderCartPage = () => {
        if (!document.querySelector('.cart-page')) return;

        const cart = getCart();
        const container = document.getElementById('cart-items-container');
        const checkoutBtn = document.getElementById('checkout-button');

        container.innerHTML = "";

        if (cart.length === 0) {
            container.innerHTML = `<p class="empty-cart-message">Seu carrinho está vazio.</p>`;
            if (checkoutBtn) checkoutBtn.style.display = "none";
            updateCartIcon();
            return;
        }

        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = "cart-item";
            div.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.image || ''}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>${formatCurrency(item.price)}</p>
                    <div class="quantity-control">
                        <label>Qtd:</label>
                        <input type="number" class="quantity-input"
                               value="${item.quantity}" min="1"
                               data-id="${item.id}">
                    </div>
                </div>
                <button class="remove-item-btn" data-id="${item.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            container.appendChild(div);
        });

        if (checkoutBtn) checkoutBtn.style.display = "block";
        updateCartSummary();
        updateCartIcon();
    };

    const updateCartSummary = () => {
        const cart = getCart();
        const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
        const sub = document.getElementById('summary-subtotal');
        const tot = document.getElementById('summary-total');

        if (sub) sub.textContent = formatCurrency(subtotal);
        if (tot) tot.textContent = formatCurrency(subtotal);
    };

    document.getElementById('cart-items-container')?.addEventListener('click', e => {
        if (e.target.closest('.remove-item-btn')) {
            const id = e.target.closest('.remove-item-btn').dataset.id;
            const cart = getCart().filter(item => item.id !== id);
            saveCart(cart);
            renderCartPage();
            updateCartIcon();
        }
    });

    document.getElementById('cart-items-container')?.addEventListener('change', e => {
        if (e.target.classList.contains('quantity-input')) {
            const id = e.target.dataset.id;
            const newQty = Number(e.target.value);
            let cart = getCart();

            if (newQty <= 0) {
                cart = cart.filter(i => i.id !== id);
            } else {
                const item = cart.find(i => i.id === id);
                if (item) item.quantity = newQty;
            }
            saveCart(cart);
            renderCartPage();
            updateCartIcon();
        }
    });

    /* ============================================================
       CHECKOUT (checkout.html) - LÓGICA VISUAL E RENDERIZAÇÃO
    ============================================================ */
    const renderCheckoutPage = () => {
        if (!document.querySelector('.checkout-page')) return;
        console.log('Renderizando Checkout Page');

        const cart = getCart();
        if (cart.length === 0) return window.location.href = "cart.html";

        const container = document.getElementById('summary-items-container');
        const totalEl = document.getElementById('summary-total-checkout');

        container.innerHTML = "";

        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = "summary-item-checkout";
            div.innerHTML = `
                <img src="${item.image || ''}">
                <div>
                    <span>${item.name} (x${item.quantity})</span><br>
                    <strong>${formatCurrency(item.price * item.quantity)}</strong>
                </div>
            `;
            container.appendChild(div);
        });

        const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
        totalEl.textContent = formatCurrency(total);

        // --- LÓGICA VISUAL DE SELEÇÃO DE PAGAMENTO (INTEGRADA AQUI) ---
        configurarBotoesPagamento();
    };

    // Função auxiliar para lidar com cliques nos botões de pagamento
    const configurarBotoesPagamento = () => {
        const paymentDetails = document.getElementById('payment-details');
        const selectCartao = document.getElementById('cartao-salvo-select');

        const limparSelecao = () => {
            document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('active'));
            if (selectCartao) selectCartao.value = "";
            if (paymentDetails) paymentDetails.innerHTML = "";
            metodoSelecionado = null;
        };

        // Seleção Pix
        const btnPix = document.getElementById('btn-pix');
        if (btnPix) {
            btnPix.addEventListener('click', function () {
                limparSelecao();
                this.classList.add('active');
                metodoSelecionado = 'pix';
                if (paymentDetails) paymentDetails.innerHTML = '<p style="color:#666;">O QR Code será gerado após confirmar a compra.</p>';
            });
        }

        // Seleção Boleto
        const btnBoleto = document.getElementById('btn-boleto');
        if (btnBoleto) {
            btnBoleto.addEventListener('click', function () {
                limparSelecao();
                this.classList.add('active');
                metodoSelecionado = 'boleto';
                if (paymentDetails) paymentDetails.innerHTML = '<p style="color:#666;">O Boleto ficará disponível para download após confirmar a compra.</p>';
            });
        }

        // Seleção Cartão Salvo
        if (selectCartao) {
            selectCartao.addEventListener('change', function () {
                if (this.value) {
                    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('active'));
                    metodoSelecionado = 'credito_salvo';
                    if (paymentDetails) paymentDetails.innerHTML = '<div style="padding:10px; color:green;">Cartão salvo selecionado.</div>';
                }
            });
        }

        // Botão Novo Cartão (Apenas abre modal, lógica mantida simples)
        const btnNovoCartao = document.getElementById('btn-novo-cartao');
        if (btnNovoCartao) {
            btnNovoCartao.addEventListener('click', () => {
                const modalCartao = document.getElementById("pagamentoModalCheckout");
                if (modalCartao) modalCartao.style.display = "flex";
            });
        }

        // Fechar modal novo cartão
        const btnCloseCartao = document.getElementById("closePagamentoModalCheckout");
        const modalCartao = document.getElementById("pagamentoModalCheckout");
        if (btnCloseCartao && modalCartao) btnCloseCartao.onclick = () => modalCartao.style.display = "none";
    };

    /* ============================================================
           LÓGICA DE VALIDAÇÃO DE TOKENS (CORRIGIDA)
        ============================================================ */
    const btnToken = document.getElementById('apply-token-btn');

    if (btnToken) {
        btnToken.addEventListener('click', function (e) {
            e.preventDefault();

            var input = document.getElementById('token-input');
            var msgElement = document.getElementById('token-message');
            var totalElement = document.getElementById('summary-total-checkout');

            if (!input) return;
            var codigo = input.value.trim();

            if (!codigo) {
                msgElement.textContent = "Digite um código.";
                msgElement.style.color = "red";
                return;
            }

            msgElement.textContent = "Validando...";
            msgElement.style.color = "blue";

            fetch('/api/validar-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: codigo })
            })
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    // em vez de ler 'aki_cart' manualmente.
                    var currentCart = getCart();

                    var subtotal = currentCart.reduce(function (acc, item) {
                        return acc + (item.price * item.quantity);
                    }, 0);

                    if (data.valid) {
                        // --- SUCESSO ---
                        msgElement.textContent = "✅ " + data.message;
                        msgElement.style.color = "green";

                        var percentual = parseFloat(data.discount_percent);
                        var valorDesconto = subtotal * (percentual / 100);
                        var novoTotal = subtotal - valorDesconto;

                        if (totalElement) {
                            totalElement.innerHTML = "";

                            // Cria elemento do preço antigo (riscado)
                            var spanVelho = document.createElement("span");
                            spanVelho.style.textDecoration = "line-through";
                            spanVelho.style.color = "#999";
                            spanVelho.style.fontSize = "0.8em";
                            spanVelho.style.marginRight = "10px";
                            spanVelho.textContent = formatCurrency(subtotal);

                            var br = document.createElement("br");

                            // Cria elemento do preço novo
                            var spanNovo = document.createElement("span");
                            spanNovo.textContent = formatCurrency(novoTotal) + " ";

                            // Cria elemento da porcentagem
                            var smallDesc = document.createElement("small");
                            smallDesc.style.color = "green";
                            smallDesc.style.fontWeight = "bold";
                            smallDesc.textContent = "(" + percentual + "% OFF)";

                            totalElement.appendChild(spanVelho);
                            totalElement.appendChild(br);
                            totalElement.appendChild(spanNovo);
                            totalElement.appendChild(smallDesc);
                        }
                    } else {
                        // --- ERRO ---
                        msgElement.textContent = "❌ " + (data.message || "Inválido");
                        msgElement.style.color = "red";

                        if (totalElement) {
                            totalElement.textContent = formatCurrency(subtotal);
                        }
                    }
                })
                .catch(function (err) {
                    console.error(err);
                    msgElement.textContent = "Erro de conexão.";
                    msgElement.style.color = "red";
                });
        });
    }

    /* ============================================================
       FINALIZAÇÃO DO PEDIDO
    ============================================================ */
    const confirmar = document.getElementById('confirmation-modal');

    // Botão "Finalizar Compra" (Abre o modal de confirmação)
    document.getElementById('finish-order-btn')?.addEventListener('click', () => {
        if (!metodoSelecionado) {
            alert("Por favor, selecione uma forma de pagamento antes de finalizar.");
            return;
        }
        confirmar.style.display = 'block';
    });

    // Botão "Cancelar" do Modal
    document.getElementById('modal-cancel-btn')?.addEventListener('click', () => {
        confirmar.style.display = 'none';
    });

    // Lógica de endereço
    const selectEndereco = document.getElementById('endereco-select');
    const detalheEndereco = document.getElementById('endereco-detalhes');
    if (selectEndereco) {
        selectEndereco.addEventListener('change', (e) => {
            const option = e.target.options[e.target.selectedIndex];
            if (option.value) {
                detalheEndereco.textContent = `Entrega para: ${option.dataset.rua}, ${option.dataset.numero} - ${option.dataset.bairro}, ${option.dataset.cidade}`;
            }
        });
    }

    // Botão "CONFIRMAR" (Envia para o Backend)
    /* ============================================================
           FINALIZAÇÃO DO PEDIDO (ATUALIZADO E SEGURO)
        ============================================================ */

    // Botão "CONFIRMAR" do Modal de Confirmação
    document.getElementById('modal-confirm-btn')?.addEventListener('click', async () => {
        const cart = getCart(); // Pega itens do sessionStorage

        // 1. Validações Básicas
        if (cart.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const selectEnd = document.getElementById('endereco-select');
        if (!selectEnd || !selectEnd.value) {
            alert("Por favor, selecione um endereço de entrega.");
            // Não fechamos o modal para o usuário poder corrigir
            return;
        }

        if (!metodoSelecionado) {
            alert("Por favor, selecione uma forma de pagamento (Pix, Boleto ou Cartão).");
            return;
        }

        // 2. Prepara os dados para envio (Payload)
        // Enviamos apenas ID e Quantidade. O servidor calcula o preço.
        const itemsPayload = cart.map(item => ({
            id: item.id,
            quantity: item.quantity
        }));

        const option = selectEnd.options[selectEnd.selectedIndex];

        // Pega o token se houver
        const tokenInput = document.getElementById('token-input');
        const tokenCode = tokenInput ? tokenInput.value.trim() : "";

        const data = {
            items: itemsPayload,
            token: tokenCode, // Envia o token para o backend validar e aplicar desconto
            shipping: {
                endereco_id: selectEnd.value,
                rua: option.dataset.rua,
                numero: option.dataset.numero,
                bairro: option.dataset.bairro,
                cidade: option.dataset.cidade,
                cep: option.dataset.cep
            },
            paymentMethod: metodoSelecionado,
            // Se for cartão salvo, envia o ID dele
            cardId: (metodoSelecionado === 'credito_salvo') ? document.getElementById('cartao-salvo-select').value : null
        };

        // 3. Envia para o Backend
        try {
            const response = await fetch('/checkout', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // Fecha o modal de confirmação "Tem certeza?"
            document.getElementById('confirmation-modal').style.display = 'none';

            if (response.ok && result.success) {
                // SUCESSO!
                sessionStorage.removeItem(cartKey); // Limpa o carrinho do navegador
                updateCartIcon(); // Zera o ícone

                // Pega o valor final calculado pelo servidor (com desconto aplicado)
                const valorFinal = result.new_total || "R$ --,--";

                if (metodoSelecionado === 'pix' || metodoSelecionado === 'boleto') {
                    // Se for Pix ou Boleto, mostra o modal para pagar agora
                    showToast("Pedido realizado! Gerando pagamento...");
                    exibirModalPosCompra(metodoSelecionado, valorFinal);
                } else {
                    // Se for cartão, redireciona para a página de agradecimento
                    showToast("Pagamento aprovado!");
                    setTimeout(() => {
                        window.location.href = "/success";
                    }, 1000);
                }

            } else {
                // ERRO (Ex: Estoque acabou, token inválido)
                alert("Não foi possível concluir: " + (result.message || "Erro desconhecido."));
            }

        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Erro de conexão com o servidor. Tente novamente.");
            document.getElementById('confirmation-modal').style.display = 'none';
        }
    });

    /* ============================================================
       CARREGAR CSV (index + produtos)
    ============================================================ */
    async function carregarCSV() {
        const tabela = document.querySelector('#tabela-produtos tbody');
        if (!tabela) return;

        try {
            const resposta = await fetch(`/produtos.csv?nocache=${Date.now()}`);
            const texto = await resposta.text();
            const linhas = texto.trim().split("\n");
            linhas.shift();
            tabela.innerHTML = "";

            linhas.forEach(linha => {
                const campos = linha.match(/(".*?"|[^;]+)(?=;|$)/g)?.map(c => c.replace(/^"|"$/g, ""));
                if (!campos || campos.length < 6) return;
                const [id, nome, descricao, preco, estoque, foto] = campos;

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><img src="${foto}" class="img-produto"></td>
                    <td>${nome}</td>
                    <td>${descricao}</td>
                    <td>${formatCurrency(parseFloat(preco))}</td>
                    <td>
                        <button class="btn-carrinho">🛒 Adicionar ao Carrinho</button>
                    </td>
                `;
                tr.querySelector('.btn-carrinho').onclick = () =>
                    adicionarAoCarrinho(id, nome, preco, foto);
                tabela.appendChild(tr);
            });
        } catch (erro) {
            tabela.innerHTML = `<tr><td colspan="5">Erro ao carregar produtos 😢</td></tr>`;
        }
    }

    // Inicialização
    carregarCSV();
    setInterval(carregarCSV, 5000);

    updateCartIcon();
    renderCartPage();
    renderCheckoutPage();
});

/* ============================================================
   FUNÇÕES GLOBAIS (MODAIS PÓS-COMPRA, BUSCA, PDF)
============================================================ */

function filtrarProdutos() {
    const filtro = document.getElementById('campo-busca').value.toLowerCase();
    const linhas = document.querySelectorAll('#tabela-produtos tbody tr');
    linhas.forEach(linha => {
        const nomeProduto = linha.cells[1].textContent.toLowerCase();
        linha.style.display = nomeProduto.includes(filtro) ? '' : 'none';
    });
}

function exibirModalPosCompra(tipo, valorTotal) {
    const modalPagamentoFinal = document.getElementById('modal-pagamento-final');
    const conteudoPagamentoFinal = document.getElementById('conteudo-pagamento-final');
    const btnConcluirFinal = document.getElementById('btn-concluir-final');
    const closePagamentoFinal = document.getElementById('close-modal-pagamento');

    if (!modalPagamentoFinal) {
        // Fallback se não tiver modal
        window.location.href = "/success";
        return;
    }

    modalPagamentoFinal.style.display = "flex";
    conteudoPagamentoFinal.innerHTML = "";

    if (tipo === 'pix') {
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=AkiCoop-${Date.now()}`;
        conteudoPagamentoFinal.innerHTML = `
            <h3 style="color: #da6416;">Pagamento via Pix</h3>
            <p>Pedido confirmado! Escaneie para pagar:</p>
            <img src="${qrCodeUrl}" alt="QR Code Pix" style="margin: 15px 0;">
            <p><strong>Valor: ${valorTotal}</strong></p>
            <div style="background:#f0f0f0; padding:10px; font-family:monospace; font-size:0.8rem; word-break:break-all; border-radius:4px;">
                00020126360014BR.GOV.BCB.PIX0114+5544998135592...
            </div>
        `;
    } else if (tipo === 'boleto') {
        conteudoPagamentoFinal.innerHTML = `
            <h3 style="color: #da6416;">Boleto Gerado</h3>
            <p>Seu pedido foi confirmado. Baixe seu boleto abaixo:</p>
            <i class="fa-solid fa-file-invoice-dollar" style="font-size: 4rem; color: #555; margin: 20px 0;"></i>
            <br>
            <button type="button" id="btn-baixar-boleto-final" class="btn btn-secondary" style="margin-top:15px;">
                <i class="fa-solid fa-download"></i> Baixar PDF do Boleto
            </button>
        `;
        setTimeout(() => {
            const btnBaixar = document.getElementById("btn-baixar-boleto-final");
            if (btnBaixar) {
                btnBaixar.onclick = function () {
                    gerarPDFBoleto(valorTotal);
                };
            }
        }, 100);
    }

    // Botões de saída
    const irParaSucesso = () => window.location.href = '/success';
    if (btnConcluirFinal) btnConcluirFinal.onclick = irParaSucesso;
    if (closePagamentoFinal) closePagamentoFinal.onclick = irParaSucesso;
}

function gerarPDFBoleto(totalTexto) {
    if (!window.jspdf) {
        alert("Erro: Biblioteca jsPDF não carregada.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const nome = document.getElementById("input-nome")?.value || "Cliente";
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    doc.setFontSize(22);
    doc.text("Aki Cooperativa", 20, 20);
    doc.setFontSize(16);
    doc.text("Boleto Bancário", 150, 20);
    doc.line(20, 25, 190, 25);
    doc.setFontSize(12);
    doc.text(`Pagador: ${nome}`, 20, 40);
    doc.text(`Data de Emissão: ${dataHoje}`, 140, 40);
    doc.setFontSize(14);
    doc.text(`Valor a Pagar: ${totalTexto}`, 140, 70);
    doc.setFontSize(10);
    doc.text("Instruções: Pagável em qualquer banco.", 20, 80);

    doc.setFillColor(0, 0, 0);
    doc.rect(20, 110, 170, 15, 'F');

    doc.save("boleto_aki_cooperativa.pdf");
}

let currentIndex = 0;
const wrapper = document.querySelector('.carousel-wrapper');
const cards = document.querySelectorAll('.local-card');
const totalCards = cards.length;
const CARDS_TO_SHOW = 4; // Constante para definir quantos cards exibir e mover

function updateCarousel() {
    // O deslize deve ser 100% dividido pelo número de cards visíveis (4)
    const offset = -currentIndex * (100 / CARDS_TO_SHOW);
    wrapper.style.transform = `translateX(${offset}%)`;
}

function moveCarousel(direction) {
    let newIndex = currentIndex + direction;

    // Lógica circular (dando a volta)
    if (direction > 0) { // Próximo
        // Se o novo índice mais o número de cards visíveis for maior que o total, volta ao início (0)
        if (newIndex + CARDS_TO_SHOW > totalCards) {
            newIndex = 0;
        }
    } else { // Anterior
        // Se for menor que 0, vai para a posição onde o último card fica visível
        if (newIndex < 0) {
            newIndex = totalCards - CARDS_TO_SHOW;
        }
    }

    currentIndex = newIndex;
    updateCarousel();
}

updateCarousel(); 