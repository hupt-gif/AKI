document.addEventListener("DOMContentLoaded", () => {

    /* -------------- BUSCA NA TABELA ---------------- */
    document.getElementById("campoBusca").addEventListener("keyup", function () {
        const termo = this.value.toLowerCase();
        const linhas = document.querySelectorAll(".admin-table tbody tr");

        linhas.forEach(linha => {
            const texto = linha.innerText.toLowerCase();
            linha.style.display = texto.includes(termo) ? "" : "none";
        });
    });

    /* -------------- MODAL --------------------------- */
    const modal = document.getElementById("modalFiltros");
    const btnAbrir = document.getElementById("btnAbrirFiltros");
    const btnFechar = document.getElementById("fecharModal");

    btnAbrir.onclick = () => modal.style.display = "block";
    btnFechar.onclick = () => modal.style.display = "none";
    window.onclick = e => { if (e.target == modal) modal.style.display = "none"; };

    /* -------------- FILTROS ------------------------- */
    document.getElementById("btnAplicarFiltros").onclick = () => {
        const status = document.getElementById("filtroStatus").value.toLowerCase();
        const dataInicio = document.getElementById("filtroDataInicio").value;
        const dataFim = document.getElementById("filtroDataFim").value;

        const linhas = document.querySelectorAll(".admin-table tbody tr");

        linhas.forEach(linha => {
            const tds = linha.querySelectorAll("td");
            const dataPedido = tds[4].innerText.substring(0, 10);
            const statusPedido = tds[5].innerText.toLowerCase();

            let mostrar = true;

            if (status && statusPedido !== status) mostrar = false;

            if (dataInicio && dataPedido < dataInicio) mostrar = false;
            if (dataFim && dataPedido > dataFim) mostrar = false;

            linha.style.display = mostrar ? "" : "none";
        });

        modal.style.display = "none";
    };

    /* -------------- LIMPAR FILTROS ------------------ */
    document.getElementById("btnLimparFiltros").onclick = () => {
        window.location.reload();
    };

    /* -------------- EXPORTAR CSV -------------------- */
    document.getElementById("btnExportarCSV").onclick = () => {
        const linhas = [...document.querySelectorAll(".admin-table tr")];
        const texto = linhas.map(l =>
            [...l.children].map(td => `"${td.innerText}"`).join(",")
        ).join("\n");

        const blob = new Blob([texto], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "relatorio_vendas.csv";
        a.click();

        URL.revokeObjectURL(url);
    };

    // =============================
    // Helper para buscar JSON
    // =============================
    async function fetchJSON(url) {
        const resp = await fetch(url);
        return await resp.json();
    }

    // =============================
    // 1. Gráfico: Faturamento por Dia
    // =============================
    async function graficoVendasDia() {
        const data = await fetchJSON("/api/grafico/vendas-dia");

        const labels = Object.keys(data);
        const valores = Object.values(data);

        new Chart(document.getElementById("graficoVendasDia"), {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Faturamento (R$)",
                    data: valores,
                    tension: 0.4,
                    borderWidth: 3
                }]
            }
        });
    }

    // =============================
    // 2. Gráfico: Pedidos por Status
    // =============================
    async function graficoStatus() {
        const data = await fetchJSON("/api/grafico/pedidos-status");

        const labels = Object.keys(data);
        const valores = Object.values(data);

        new Chart(document.getElementById("graficoStatus"), {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    data: valores
                }]
            }
        });
    }

    // =============================
    // 3. Gráfico: Produtos Mais Vendidos
    // =============================
    async function graficoProdutos() {
        const data = await fetchJSON("/api/grafico/produtos-mais-vendidos");

        const labels = Object.keys(data);
        const valores = Object.values(data);

        new Chart(document.getElementById("graficoProdutos"), {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Vendas",
                    data: valores
                }]
            }
        });
    }

    // =============================
    // Executar gráficos
    // =============================
    graficoVendasDia();
    graficoStatus();
    graficoProdutos();
});

// ============== ABRIR MODAIS ==============
function abrirModal(id) {
    document.getElementById(id).style.display = "block";
}
function fecharModal(id) {
    document.getElementById(id).style.display = "none";
}

// TABELA
document.getElementById("btnAbrirTabela").onclick = () => abrirModal("modalTabela");
document.querySelector(".fecharTabela").onclick = () => fecharModal("modalTabela");

// GRÁFICO DIA
document.getElementById("btnAbrirGraficoDia").onclick = () => abrirModal("modalGraficoDia");
document.querySelector(".fecharGraficoDia").onclick = () => fecharModal("modalGraficoDia");

// GRÁFICO STATUS
document.getElementById("btnAbrirGraficoStatus").onclick = () => abrirModal("modalGraficoStatus");
document.querySelector(".fecharGraficoStatus").onclick = () => fecharModal("modalGraficoStatus");

// GRÁFICO PRODUTOS
document.getElementById("btnAbrirGraficoProdutos").onclick = () => abrirModal("modalGraficoProdutos");
document.querySelector(".fecharGraficoProdutos").onclick = () => fecharModal("modalGraficoProdutos");

// Fechar clicando fora
window.onclick = e => {
    document.querySelectorAll(".modal").forEach(modal => {
        if (e.target === modal) modal.style.display = "none";
    });
};

document.querySelector('.close').addEventListener('click', () => {
  document.querySelector('.modal').classList.remove('open');
});