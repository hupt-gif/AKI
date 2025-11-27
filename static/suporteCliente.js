document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formChamado");
    const lista = document.getElementById("listaChamados");
    const msgRetorno = document.getElementById("msgRetorno");
    const contador = document.getElementById("contadorChamados");

    const chamados = JSON.parse(localStorage.getItem("chamados")) || [];

    // Função para renderizar a lista de chamados
    function renderChamados() {
        lista.innerHTML = "";
        contador.textContent = `Você tem ${chamados.length} chamado(s) aberto(s).`;

        if (chamados.length === 0) {
            lista.innerHTML = "<li>Nenhum chamado aberto ainda.</li>";
            return;
        }

        chamados.forEach((c, i) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>ID:</strong> ${c.id} <br>
                <strong>${c.assunto}</strong> (${c.categoria})<br>
                ${c.mensagem}<br>
                <small>Status: ${c.status} | Aberto em: ${c.dataHora}</small>
            `;

            const btnExcluir = document.createElement("button");
            btnExcluir.textContent = "Excluir";
            btnExcluir.className = "btn-excluir";
            btnExcluir.addEventListener("click", () => {
                chamados.splice(i, 1);
                localStorage.setItem("chamados", JSON.stringify(chamados));
                renderChamados();
            });

            li.appendChild(btnExcluir);
            lista.appendChild(li);
        });
    }

    // Função para criar um novo chamado
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const assunto = document.getElementById("assunto").value.trim();
        const categoria = document.getElementById("categoria").value;
        const mensagem = document.getElementById("mensagem").value.trim();

        if (!assunto || !categoria || !mensagem) {
            msgRetorno.textContent = "Por favor, preencha todos os campos.";
            msgRetorno.style.color = "red";
            return;
        }

        const dataHora = new Date().toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        });

        const id = `CH-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // ID único
        const status = "Aberto";

        chamados.push({ id, assunto, categoria, mensagem, dataHora, status });
        localStorage.setItem("chamados", JSON.stringify(chamados));

        // Dispara evento para atualizar outras abas
        window.dispatchEvent(new Event("storage"));

        msgRetorno.textContent = "Chamado enviado com sucesso!";
        msgRetorno.style.color = "green";
        form.reset();

        renderChamados();
    });

    // Renderiza os chamados na carga inicial da página
    renderChamados();

    // Atualiza a lista se houver alterações no localStorage (outras abas)
    window.addEventListener("storage", () => {
        const novosChamados = JSON.parse(localStorage.getItem("chamados")) || [];
        chamados.length = 0;
        chamados.push(...novosChamados);
        renderChamados();
    });
});
