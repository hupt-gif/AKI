document.addEventListener("DOMContentLoaded", () => {
    /* =============================================================
       1. SISTEMA DE ABAS
    ============================================================= */
    const links = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".content-section");

    links.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();

            links.forEach(l => l.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));

            link.classList.add("active");
            const id = link.dataset.target;
            const section = document.getElementById(id);

            if (section) section.classList.add("active");
        });
    });

    /* Botão de salvar perfil */

    const btnSalvarPerfil = document.getElementById("btn-salvar-perfil");
    if (btnSalvarPerfil) {
        btnSalvarPerfil.addEventListener("click", salvarPerfil);
    }

    /* =============================================================
       2. SEGURANÇA — Habilitar edição
    ============================================================= */
    const btnEnableEdit = document.getElementById("btnEnableEdit");
    const btnSaveSecurity = document.getElementById("btnSaveSecurity");
    const secEmail = document.getElementById("secEmail");
    const secPhone = document.getElementById("secPhone");

    if (btnEnableEdit && btnSaveSecurity) {
        btnEnableEdit.addEventListener("click", () => {
            if (secEmail) secEmail.disabled = false;
            if (secPhone) secPhone.disabled = false;
            btnEnableEdit.style.display = "none";
            btnSaveSecurity.style.display = "inline-flex";
            if (secEmail) secEmail.focus();
        });

        btnSaveSecurity.addEventListener("click", () => {
            if (secEmail) secEmail.disabled = true;
            if (secPhone) secPhone.disabled = true;
            btnSaveSecurity.style.display = "none";
            btnEnableEdit.style.display = "inline-flex";

            alert("Dados de segurança atualizados!");
        });
    }

    /* =============================================================
       5. DETALHES DOS PEDIDOS
    ============================================================= */
    document.addEventListener("click", async e => {
        if (e.target.classList.contains("btn-detalhes")) {
            e.preventDefault();
            const pedidoId = e.target.dataset.pedidoId;

            const resposta = await fetch(`/pedido/${pedidoId}/produtos`);
            const produtos = await resposta.json();

            mostrarProdutos(produtos.produtos, pedidoId);
        }
    });

    function mostrarProdutos(texto, pedidoId) {
        const container = document.getElementById("detalhes-" + pedidoId);
        if (!container) return;
        container.innerHTML = `
            <p><strong>Produtos:</strong></p>
            <p>${escapeHtml(texto)}</p>
        `;
    }

    function escapeHtml(s) {
        return String(s || "").replace(/[&<>"']/g, m => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[m]));
    }

    /* =============================================================
       6. ENDEREÇOS
    ============================================================= */
    const clienteId = window.clienteId || null;

    const enderecoModal = document.getElementById("enderecoModal");
    const btnOpenEndereco = document.getElementById("btn-add-endereco");
    const btnCloseEndereco = document.getElementById("closeEnderecoModal");
    const btnCancelEndereco = document.getElementById("btn-cancel-endereco");
    const formEndereco = document.getElementById("form-endereco");

    const inputTipo = document.getElementById("input-tipo");
    const inputCep = document.getElementById("input-cep");
    const inputRua = document.getElementById("input-rua");
    const inputNumero = document.getElementById("input-numero");
    const inputBairro = document.getElementById("input-bairro");
    const inputCidade = document.getElementById("input-cidade");
    const inputComplemento = document.getElementById("input-complemento");

    const btnBuscarCep = document.getElementById("btn-buscar-cep");

    function openEnderecoModal() {
        if (enderecoModal) enderecoModal.style.display = "flex";
    }
    function closeEnderecoModal() {
        if (enderecoModal) enderecoModal.style.display = "none";
        if (formEndereco) formEndereco.reset();
    }

    if (btnOpenEndereco) btnOpenEndereco.onclick = openEnderecoModal;
    if (btnCloseEndereco) btnCloseEndereco.onclick = closeEnderecoModal;
    if (btnCancelEndereco) btnCancelEndereco.onclick = closeEnderecoModal;

    async function buscarViaCEP(cep) {
        const clean = (cep || "").replace(/\D/g, "");
        if (clean.length !== 8) throw new Error("CEP inválido");
        const resp = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await resp.json();
        if (data.erro) throw new Error("CEP não encontrado");
        return data;
    }

    if (btnBuscarCep) {
        btnBuscarCep.addEventListener("click", async () => {
            try {
                const data = await buscarViaCEP(inputCep.value.trim());
                if (inputRua) inputRua.value = data.logradouro || "";
                if (inputBairro) inputBairro.value = data.bairro || "";
                if (inputCidade) inputCidade.value = `${data.localidade} - ${data.uf}` || "";
            } catch (err) {
                alert(err.message);
            }
        });
    }

    async function carregarEnderecos() {
        const container = document.getElementById("enderecos-container");
        if (!container) return;
        container.innerHTML = "<p>Carregando...</p>";

        try {
            const resp = await fetch(`/cliente/${clienteId}/enderecos`);
            if (!resp.ok) throw new Error("Falha ao carregar endereços");

            const enderecos = await resp.json();
            container.innerHTML = "";

            if (!Array.isArray(enderecos) || enderecos.length === 0) {
                container.innerHTML = "<p>Nenhum endereço cadastrado.</p>";
                return;
            }

            enderecos.forEach(e => {
                const div = document.createElement("div");
                div.className = "endereco-card";
                div.innerHTML = `
                <strong>${escapeHtml(e.tipo)}</strong><br>
                ${escapeHtml(e.rua)}, ${escapeHtml(e.numero)}<br>
                ${escapeHtml(e.bairro)} - ${escapeHtml(e.cidade)}<br>
                CEP: ${escapeHtml(e.cep)}
                <div style="margin-top:8px;"><button class="remover" data-id="${escapeHtml(e.endereco_id)}">Remover</button></div>
            `;
                container.appendChild(div);
            });

            // attach listeners after elements created
            document.querySelectorAll(".remover").forEach(btn => {
                btn.addEventListener("click", async () => {
                    if (!confirm("Remover este endereço?")) return;
                    try {
                        const del = await fetch(`/endereco/${btn.dataset.id}`, { method: "DELETE" });
                        if (!del.ok) throw new Error("Falha ao remover");
                        carregarEnderecos();
                    } catch (err) {
                        alert("Erro ao remover endereço.");
                    }
                });
            });

        } catch (err) {
            container.innerHTML = "<p>Erro ao carregar endereços.</p>";
        }
    }

    if (formEndereco) {
        formEndereco.addEventListener("submit", async (e) => {
            e.preventDefault();

            console.log("Id do cliente:", clienteId)

            if (!clienteId) {
                alert("Erro: usuário não identificado. Faça login novamente.");
                return;
            }

            const dados = {
                cliente_id: clienteId,
                tipo: inputTipo ? inputTipo.value : "",
                cep: inputCep ? inputCep.value.trim() : "",
                rua: inputRua ? inputRua.value.trim() : "",
                bairro: inputBairro ? inputBairro.value.trim() : "",
                cidade: inputCidade ? inputCidade.value.trim() : "",
                numero: inputNumero ? inputNumero.value.trim() : "",
                complemento: inputComplemento ? inputComplemento.value.trim() : ""
            };

            try {
                const resp = await fetch(`/cliente/${clienteId}/enderecos`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dados)
                });

                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    throw new Error(err.erro || err.message || "Erro ao salvar");
                }

                carregarEnderecos();
                closeEnderecoModal();

            } catch (err) {
                alert(err.message);
            }
        });
    }

    carregarEnderecos();

    /* =============================================================
       8. ALTERAR EMAIL
    ============================================================= */
    const formEmail = document.querySelector("#seguranca .form-card:nth-of-type(2)");
    if (formEmail) {
        formEmail.addEventListener("submit", async e => {
            e.preventDefault();

            const payload = {
                id: window.perfilId || null,
                email: document.getElementById("novo-email").value
            };

            const resp = await fetch("/perfil/alterar-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await resp.json();

            if (data.sucesso) {
                alert("Email atualizado!");
                const emailField = document.getElementById("email");
                if (emailField) emailField.value = payload.email;
            } else {
                alert(data.erro);
            }
        });
    }

    /* =============================================================
       9. MODAL DE CADASTRO DE CLIENTE
    ============================================================= */
    const cadastroModal = document.getElementById("cadastroClienteModal");
    const btnOpenCadastro = document.getElementById("btn-open-cadastro");
    const btnCloseCadastro = document.getElementById("closeCadastroCliente");
    const btnCancelCadastro = document.getElementById("cancelCadastroCliente");

    if (btnOpenCadastro) btnOpenCadastro.onclick = () => { if (cadastroModal) cadastroModal.style.display = "flex"; };
    if (btnCloseCadastro) btnCloseCadastro.onclick = () => { if (cadastroModal) cadastroModal.style.display = "none"; };
    if (btnCancelCadastro) btnCancelCadastro.onclick = () => { if (cadastroModal) cadastroModal.style.display = "none"; };

    window.addEventListener("click", e => {
        if (e.target === cadastroModal) {
            if (cadastroModal) cadastroModal.style.display = "none";
        }
    });

    /* =============================================================
       10. MÁSCARAS (CPF, CEP e Telefone)
    ============================================================= */
    const applyMask = (input, fn) => {
        if (!input) return;
        input.addEventListener("input", () => input.value = fn(input.value));
    };

    const maskCPF = v => {
        v = v.replace(/\D/g, "");
        return v.replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    };

    const maskCEP = v => v.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2");

    const maskPhone = v => {
        v = v.replace(/\D/g, "");
        return v.length <= 10
            ? v.replace(/^(\d{2})(\d{4})(\d)/, "($1) $2-$3")
            : v.replace(/^(\d{2})(\d{5})(\d)/, "($1) $2-$3");
    };

    applyMask(document.getElementById("input-cep"), maskCEP);
    applyMask(document.getElementById("secPhone"), maskPhone);

    /* =============================================================
       11. GESTÃO DE PAGAMENTOS (NOVO)
    ============================================================= */
    const pagamentoModal = document.getElementById("pagamentoModal");
    const btnAddPagamento = document.getElementById("btn-add-pagamento");
    const btnClosePagamento = document.getElementById("closePagamentoModal");
    const btnCancelPagamento = document.getElementById("btn-cancel-pagamento");
    const formPagamento = document.getElementById("form-novo-pagamento");
    const listaPagamentos = document.getElementById("lista-pagamentos");

    // Funções do Modal
    function openPagModal() { if (pagamentoModal) pagamentoModal.style.display = "flex"; }
    function closePagModal() {
        if (pagamentoModal) pagamentoModal.style.display = "none";
        if (formPagamento) formPagamento.reset();
    }

    if (btnAddPagamento) btnAddPagamento.onclick = openPagModal;
    if (btnClosePagamento) btnClosePagamento.onclick = closePagModal;
    if (btnCancelPagamento) btnCancelPagamento.onclick = closePagModal;

    // Máscara simples para cartão visual no input
    const inputCartao = document.getElementById("pg-numero");
    if (inputCartao) {
        inputCartao.addEventListener("input", e => {
            let v = e.target.value.replace(/\D/g, "");
            v = v.replace(/(\d{4})/g, "$1 ").trim();
            e.target.value = v.substring(0, 19);
        });
    }

    // Carregar Pagamentos
    async function carregarPagamentos() {
        if (!listaPagamentos) return;

        try {
            const resp = await fetch(`/cliente/${clienteId}/pagamentos`);
            const dados = await resp.json();

            listaPagamentos.innerHTML = "";

            if (dados.length === 0) {
                listaPagamentos.innerHTML = "<p>Nenhum método salvo.</p>";
                return;
            }

            dados.forEach(pg => {
                const div = document.createElement("div");
                div.className = "endereco-card"; // Reutilizando estilo de card
                div.style.borderColor = "#28a745";
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center">
                        <div>
                            <strong>${pg.apelido}</strong> <br>
                            <small>${pg.tipo}</small> <br>
                            <span style="font-family:monospace; font-size:1.1em">${pg.info_mascarada}</span>
                        </div>
                        <i class="fa-brands fa-cc-visa" style="font-size:2em; color:#555;"></i>
                    </div>
                    <button class="remover-pag" data-id="${pg.id}" style="margin-top:10px; background:none; border:none; color:red; cursor:pointer;">
                        <i class="fa-solid fa-trash"></i> Remover
                    </button>
                `;
                listaPagamentos.appendChild(div);
            });

            // Eventos de remover
            document.querySelectorAll(".remover-pag").forEach(btn => {
                btn.addEventListener("click", async () => {
                    if (!confirm("Remover este cartão?")) return;
                    await fetch(`/pagamento/${btn.dataset.id}`, { method: "DELETE" });
                    carregarPagamentos();
                });
            });

        } catch (e) {
            console.error(e);
            listaPagamentos.innerHTML = "<p>Erro ao carregar pagamentos.</p>";
        }
    }

    // Salvar Pagamento
    if (formPagamento) {
        formPagamento.addEventListener("submit", async (e) => {
            e.preventDefault();

            const numeroRaw = document.getElementById("pg-numero").value.replace(/\s/g, "");

            const payload = {
                tipo: "Cartão de Crédito",
                apelido: document.getElementById("pg-apelido").value,
                numero_cartao: numeroRaw, // O backend vai mascarar e salvar só o final
                titular: document.getElementById("pg-titular").value
            };

            try {
                const resp = await fetch(`/cliente/${clienteId}/pagamentos`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (resp.ok) {
                    alert("Cartão adicionado com sucesso!");
                    closePagModal();
                    carregarPagamentos();
                } else {
                    alert("Erro ao salvar cartão.");
                }
            } catch (err) {
                alert("Erro de conexão.");
            }
        });
    }

    // Inicializar
    if (document.getElementById("pagamentos")) {
        carregarPagamentos();
    }

    // --- ATUALIZAÇÃO SEGURANÇA (Conectar com formulário criado no HTML) ---
    const formSenhaNova = document.getElementById("form-alterar-senha");
    if (formSenhaNova) {
        formSenhaNova.addEventListener("submit", async e => {
            e.preventDefault();
            // Reutilizando a lógica existente, mas apontando para os novos IDs
            const payload = {
                id: window.perfilId,
                senha_atual: document.getElementById("senha-atual").value,
                senha_nova: document.getElementById("senha-nova").value
            };

            const resp = await fetch("/perfil/alterar-senha", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await resp.json();
            alert(data.sucesso ? "Senha alterada com sucesso!" : "Erro: " + data.erro);
            if (data.sucesso) formSenhaNova.reset();
        });
    }
});

async function salvarPerfil() {
    const telefone = document.getElementById("telefone").value.trim();
    const dataNasc = document.getElementById("data_nasc").value.trim();

    if (!telefone || !dataNasc) {
        alert("Preencha telefone e data de nascimento.");
        return;
    }

    try {
        const resp = await fetch(`/cliente/${clienteId}/perfil`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                telefone: telefone,
                data_nasc: dataNasc
            })
        });

        const json = await resp.json();

        if (!resp.ok) {
            alert(json.erro || "Erro ao salvar.");
            return;
        }

        alert("Dados salvos com sucesso!");

    } catch (err) {
        alert("Erro ao conectar ao servidor.");
    }
}