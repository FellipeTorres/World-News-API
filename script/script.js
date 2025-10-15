const ui = {
    chaveApi: document.getElementById('chaveApi'),
    consulta: document.getElementById('consulta'),
    idioma: document.getElementById('idioma'),
    quantidade: document.getElementById('quantidade'),
    ordenacao: document.getElementById('ordenacao'),
    botaoBuscar: document.getElementById('botaoBuscar'),
    endpoint: document.getElementById('endpoint'),
    resultados: document.getElementById('resultados'),
    jsonBruto: document.getElementById('jsonBruto'),
    botaoMenu: document.getElementById('botaoMenu'),
    controles: document.getElementById('controles'),
    iconeMenu: document.getElementById('iconeMenu'),
    secaoResultados: document.getElementById('secao-resultados')
};

ui.secaoResultados.style.display = 'none';

function montarUrl() {
    const base = 'https://api.worldnewsapi.com/search-news';
    const p = new URLSearchParams();
    const texto = ui.consulta.value.trim();
    if (texto) p.set('text', texto);
    if (ui.idioma.value) p.set('language', ui.idioma.value);
    if (ui.quantidade.value) p.set('number', ui.quantidade.value);
    if (ui.ordenacao.value) p.set('sort', ui.ordenacao.value);
    return `${base}?${p.toString()}`;
}

function renderizarNoticias(lista) {
    ui.resultados.innerHTML = '';
    if (!Array.isArray(lista) || lista.length === 0) {
        ui.resultados.innerHTML = '<div class="suave">Sem resultados.</div>';
        return;
    }
    for (const noticia of lista) {
        const cartao = document.createElement('div');
        cartao.className = 'item';

        const titulo = document.createElement('h3');
        const link = document.createElement('a');
        link.href = noticia.url || '#';
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = noticia.title || 'Sem título';
        titulo.appendChild(link);

        const meta = document.createElement('div');
        const fonte = noticia.source_name || noticia.source || 'Fonte desconhecida';
        const quando = noticia.publish_date
            ? new Date(noticia.publish_date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })
            : '';
        meta.className = 'meta';
        meta.textContent = [fonte, quando].filter(Boolean).join(' • ');

        const texto = document.createElement('div');
        texto.className = 'texto';
        const conteudo = noticia.text || noticia.summary || '';
        const limite = 250;

        if (conteudo.length > limite) {
            texto.textContent = conteudo.substring(0, limite) + '...';
            const lerMais = document.createElement('button');
            lerMais.className = 'botao-ler-mais';
            lerMais.textContent = 'Ler mais';
            lerMais.addEventListener('click', () => {
                if (texto.classList.contains('expandido')) {
                    texto.classList.remove('expandido');
                    texto.textContent = conteudo.substring(0, limite) + '...';
                    lerMais.textContent = 'Ler mais';
                } else {
                    texto.classList.add('expandido');
                    texto.textContent = conteudo;
                    lerMais.textContent = 'Ler menos';
                }
            });
            cartao.appendChild(titulo);
            cartao.appendChild(meta);
            cartao.appendChild(texto);
            cartao.appendChild(lerMais);
        } else {
            texto.textContent = conteudo;
            cartao.appendChild(titulo);
            cartao.appendChild(meta);
            if (texto.textContent) cartao.appendChild(texto);
        }

        ui.resultados.appendChild(cartao);
    }
}

async function buscarNoticias() {
    ui.secaoResultados.style.display = 'block';
    const url = montarUrl();
    ui.endpoint.textContent = url;
    ui.botaoBuscar.disabled = true;
    ui.resultados.innerHTML = '<div class="carregando"></div>';
    ui.jsonBruto.textContent = '—';
    try {
        const resposta = await fetch(url, {
            headers: { 'X-API-KEY': ui.chaveApi.value.trim() }
        });
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        const dados = await resposta.json();
        ui.jsonBruto.textContent = JSON.stringify(dados, null, 2);
        const lista = dados.news || dados.results || [];
        renderizarNoticias(lista);
    } catch (erro) {
        ui.resultados.innerHTML = '<div class="suave">Erro ao buscar notícias: ' + erro.message + '</div>';
        ui.jsonBruto.textContent = `Erro: ${erro.message}`;
    } finally {
        ui.botaoBuscar.disabled = false;
    }
}

ui.botaoBuscar.addEventListener('click', buscarNoticias);

ui.botaoMenu.addEventListener('click', () => {
    ui.controles.classList.toggle('visivel');
    ui.iconeMenu.textContent = ui.controles.classList.contains('visivel') ? '✕' : '☰';
});