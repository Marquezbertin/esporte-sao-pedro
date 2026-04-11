// ===== ESPORTE SAO PEDRO - Portal Esportivo =====
// Dados locais com localStorage | Zero backend | GitHub Pages

// ===== UTILIDADES =====
function esc(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Galeria de fotos inline (para noticias)
var _galeriaFotos = {};

function adicionarFotoGaleria(inputId, containerId) {
    var input = document.getElementById(inputId);
    var url = input.value.trim();
    if (!url) return;

    if (!_galeriaFotos[containerId]) _galeriaFotos[containerId] = [];
    _galeriaFotos[containerId].push(url);
    input.value = "";
    renderGaleriaItems(containerId);
}

function removerFotoGaleria(containerId, index) {
    if (!_galeriaFotos[containerId]) return;
    _galeriaFotos[containerId].splice(index, 1);
    renderGaleriaItems(containerId);
}

function renderGaleriaItems(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var fotos = _galeriaFotos[containerId] || [];
    container.innerHTML = "";
    fotos.forEach(function (url, i) {
        container.innerHTML +=
            '<div class="galeria-thumb">' +
                '<img src="' + esc(url) + '" alt="Foto ' + (i + 1) + '">' +
                '<button type="button" onclick="removerFotoGaleria(\'' + containerId + '\',' + i + ')">&times;</button>' +
            '</div>';
    });
}

function getGaleriaFotos(containerId) {
    return (_galeriaFotos[containerId] || []).slice();
}

function setGaleriaFotos(containerId, fotos) {
    _galeriaFotos[containerId] = (fotos || []).slice();
    renderGaleriaItems(containerId);
}

function richCmd(command) {
    document.execCommand(command, false, null);
}

function sanitizeHtml(html) {
    if (!html) return "";
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    // Remove scripts and event handlers
    var scripts = tmp.querySelectorAll("script,style,iframe,object,embed");
    for (var i = 0; i < scripts.length; i++) scripts[i].remove();
    var all = tmp.querySelectorAll("*");
    for (var j = 0; j < all.length; j++) {
        var attrs = all[j].attributes;
        for (var k = attrs.length - 1; k >= 0; k--) {
            if (attrs[k].name.indexOf("on") === 0) all[j].removeAttribute(attrs[k].name);
        }
    }
    return tmp.innerHTML;
}

function stripHtml(html) {
    if (!html) return "";
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatarData(dateStr) {
    if (!dateStr) return "";
    var d = new Date(dateStr + "T12:00:00");
    var meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return d.getDate() + " " + meses[d.getMonth()] + " " + d.getFullYear();
}

function formatarDataCurta(dateStr) {
    if (!dateStr) return { dia: "--", mes: "---" };
    var d = new Date(dateStr + "T12:00:00");
    var meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    return { dia: d.getDate(), mes: meses[d.getMonth()] };
}

var CIDADES = {
    "sao-pedro": "Sao Pedro",
    "rio-das-pedras": "Rio das Pedras",
    "charqueada": "Charqueada",
    "piracicaba": "Piracicaba",
    "aguas-de-sao-pedro": "Aguas de Sao Pedro",
    "regiao": "Regiao"
};

function nomeCidade(id) {
    return CIDADES[id] || "Sao Pedro";
}

var MESES_FULL = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
var DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

// ===== STORAGE (Supabase na nuvem + localStorage como cache) =====
function getData(key) {
    // Primeiro tenta do cache do Supabase (carregado no init)
    var cached = SupaDB.getCache()[key];
    if (cached !== undefined && cached !== null) return cached;
    // Fallback localStorage
    try { return JSON.parse(localStorage.getItem("esp_" + key) || "[]"); }
    catch (e) { return []; }
}

function setData(key, data) {
    // Salvar na nuvem (Supabase) + localStorage como cache
    SupaDB.setItem(key, data);
}

// ===== ESPORTES =====
var ESPORTES = [
    { id: "futebol", nome: "Futebol", icon: "\u26BD", cor: "#16a34a" },
    { id: "volei", nome: "Volei", icon: "\uD83C\uDFD0", cor: "#2563eb" },
    { id: "basquete", nome: "Basquete", icon: "\uD83C\uDFC0", cor: "#d97706" },
    { id: "corrida", nome: "Corrida", icon: "\uD83C\uDFC3", cor: "#db2777" },
    { id: "ciclismo", nome: "Ciclismo", icon: "\uD83D\uDEB4", cor: "#4f46e5" },
    { id: "artes-marciais", nome: "Artes Marciais", icon: "\uD83E\uDD4B", cor: "#dc2626" },
    { id: "skate-radicais", nome: "Skate e Radicais", icon: "\uD83D\uDEF9", cor: "#7c3aed" }
];

// ===== MODO ADMIN (senha para editor/jornalista) =====
var ADMIN_SENHA = "sp2026";
var _isAdmin = false;

function isAdmin() { return _isAdmin; }

function loginAdmin() {
    document.getElementById("adminModal").classList.add("active");
    document.getElementById("adminSenhaInput").value = "";
    document.getElementById("adminError").style.display = "none";
    setTimeout(function () { document.getElementById("adminSenhaInput").focus(); }, 100);
}

function confirmarLoginAdmin() {
    var senha = document.getElementById("adminSenhaInput").value;
    if (senha === ADMIN_SENHA) {
        _isAdmin = true;
        sessionStorage.setItem("esp_admin", "1");
        document.body.classList.add("admin-mode");
        fecharModalAdmin();
        renderPaginaAtual();
        atualizarLiveNav();
        CloudUpload.init();
    } else {
        document.getElementById("adminError").style.display = "block";
        document.getElementById("adminSenhaInput").value = "";
        document.getElementById("adminSenhaInput").focus();
    }
}

function fecharModalAdmin() {
    document.getElementById("adminModal").classList.remove("active");
}

function logoutAdmin() {
    _isAdmin = false;
    sessionStorage.removeItem("esp_admin");
    document.body.classList.remove("admin-mode");
    renderPaginaAtual();
    atualizarLiveNav();
}

function checkAdminSession() {
    if (sessionStorage.getItem("esp_admin") === "1") {
        _isAdmin = true;
        document.body.classList.add("admin-mode");
        setTimeout(function () { CloudUpload.init(); }, 500);
    }
}

function renderPaginaAtual() {
    var ativa = document.querySelector(".secao-page.active");
    if (ativa) {
        var id = ativa.id.replace("secao-", "");
        navegar(id, null);
    }
}

// ===== YOUTUBE EMBED HELPER =====
function extrairYoutubeId(url) {
    if (!url) return null;
    var match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function renderMidia(imagem, video, alt) {
    // Video do YouTube
    if (video) {
        var ytId = extrairYoutubeId(video);
        if (ytId) {
            return '<div class="news-card-video"><iframe src="https://www.youtube.com/embed/' + ytId + '" frameborder="0" allowfullscreen loading="lazy"></iframe></div>';
        }
        // Outro video (url direta)
        return '<div class="news-card-video"><video src="' + esc(video) + '" controls preload="metadata"></video></div>';
    }
    // Imagem
    if (imagem) {
        return '<div class="news-card-img"><img src="' + esc(imagem) + '" alt="' + esc(alt || "") + '" loading="lazy"></div>';
    }
    return '';
}

// ===== LIMPAR DADOS DEMO (forca limpeza v2) =====
function limparDadosDemo() {
    if (localStorage.getItem("esp_demo_cleaned_v2")) return;
    // Forcar remocao de TODOS os dados fake antigos
    var keys = ["esp_noticias","esp_resultados","esp_jogos","esp_classificacao_futebol","esp_classificacao_volei","esp_classificacao_basquete","esp_artilheiros","esp_atletas","esp_galeria"];
    keys.forEach(function (k) { localStorage.removeItem(k); });
    localStorage.removeItem("esp_demo_loaded");
    localStorage.removeItem("esp_demo_cleaned");
    localStorage.setItem("esp_demo_cleaned_v2", "1");
}

// ===== EDITAR ABA SOBRE =====
function getSobreTextos() {
    var cached = SupaDB.getCache()["sobre"];
    if (cached !== undefined) return cached;
    try { return JSON.parse(localStorage.getItem("esp_sobre") || "null"); }
    catch(e) { return null; }
}

// ===== LOGO DO SITE =====
function carregarSiteLogo() {
    SupaDB.getItem("site_logo").then(function (data) {
        if (!data) return;
        // Compatibilidade: aceita string (url) ou objeto {url, size}
        var url = typeof data === "string" ? data : data.url;
        var size = (typeof data === "object" && data.size) ? data.size : 48;
        if (url) aplicarSiteLogo(url, size);
    });
}

function aplicarSiteLogo(url, size) {
    size = size || 48;
    var els = [
        { img: document.getElementById("siteLogo"), fallback: document.getElementById("siteLogoFallback") },
        { img: document.getElementById("siteLogoFooter"), fallback: document.getElementById("siteLogoFallbackFooter") }
    ];
    els.forEach(function (pair) {
        if (pair.img && url) {
            pair.img.src = url;
            pair.img.style.height = size + "px";
            pair.img.style.display = "block";
            if (pair.fallback) pair.fallback.style.display = "none";
        }
    });
    // Preview e controles no admin
    var preview = document.getElementById("siteLogoPreviewAdmin");
    if (preview && url) { preview.src = url; preview.style.display = "block"; }
    var input = document.getElementById("siteLogoUrl");
    if (input && url) input.value = url;
    var slider = document.getElementById("siteLogoSize");
    if (slider) slider.value = size;
    var label = document.getElementById("siteLogoSizeLabel");
    if (label) label.textContent = size;
}

function previewLogoSize(size) {
    var label = document.getElementById("siteLogoSizeLabel");
    if (label) label.textContent = size;
    var imgs = [document.getElementById("siteLogo"), document.getElementById("siteLogoFooter")];
    imgs.forEach(function (img) {
        if (img) img.style.height = size + "px";
    });
}

function salvarSiteLogo() {
    var url = document.getElementById("siteLogoUrl").value.trim();
    if (!url) return alert("Envie ou cole a URL de uma imagem primeiro.");
    var size = parseInt(document.getElementById("siteLogoSize").value) || 48;
    SupaDB.setItem("site_logo", { url: url, size: size }).then(function () {
        aplicarSiteLogo(url, size);
        alert("Logo salvo com sucesso!");
    });
}

function removerSiteLogo() {
    if (!confirm("Remover o logo do site?")) return;
    SupaDB.removeItem("site_logo").then(function () {
        var els = [
            { img: document.getElementById("siteLogo"), fallback: document.getElementById("siteLogoFallback") },
            { img: document.getElementById("siteLogoFooter"), fallback: document.getElementById("siteLogoFallbackFooter") }
        ];
        els.forEach(function (pair) {
            if (pair.img) { pair.img.src = ""; pair.img.style.display = "none"; }
            if (pair.fallback) pair.fallback.style.display = "block";
        });
        var preview = document.getElementById("siteLogoPreviewAdmin");
        if (preview) { preview.src = ""; preview.style.display = "none"; }
        document.getElementById("siteLogoUrl").value = "";
        document.getElementById("siteLogoSize").value = 48;
        document.getElementById("siteLogoSizeLabel").textContent = "48";
        alert("Logo removido.");
    });
}

function renderSobreEditavel() {
    var saved = getSobreTextos();
    if (saved) {
        var t1 = document.getElementById("sobreTexto1");
        var t2 = document.getElementById("sobreTexto2");
        if (t1 && saved.texto1) t1.innerHTML = saved.texto1;
        if (t2 && saved.texto2) t2.innerHTML = saved.texto2;
    }
    // Ativar edicao inline se admin
    if (isAdmin()) {
        var campos = document.querySelectorAll(".sobre-editavel");
        campos.forEach(function (el) {
            el.setAttribute("contenteditable", "true");
            el.classList.add("editavel-ativo");
        });
    }
}

function salvarSobre() {
    var t1 = document.getElementById("sobreTexto1").innerHTML;
    var t2 = document.getElementById("sobreTexto2").innerHTML;
    SupaDB.setItem("sobre", { texto1: t1, texto2: t2 });
    alert("Textos da pagina Sobre salvos com sucesso!");
}

// ===== INICIALIZACAO =====
document.addEventListener("DOMContentLoaded", function () {
    limparDadosDemo();
    checkAdminSession();

    // Carregar dados do Supabase e depois renderizar
    SupaDB.loadAll().then(function () {
        atualizarData();
        renderTicker();
        renderSportsGrid();
        renderInicio();
        renderHeroStats();
        initScrollTop();
        atualizarLiveNav();
        atualizarLiveStatus();
        carregarSiteLogo();
        renderSobreEditavel();
        renderPatrocinadoresPublico();

        // Esconder loading
        var loadEl = document.getElementById("supaLoading");
        if (loadEl) loadEl.style.display = "none";
    });
});

function atualizarData() {
    var hoje = new Date();
    var dias = ["Domingo", "Segunda-feira", "Terca-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sabado"];
    var meses = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    var el = document.getElementById("headerDate");
    if (el) el.textContent = dias[hoje.getDay()] + ", " + hoje.getDate() + " de " + meses[hoje.getMonth()] + " de " + hoje.getFullYear();
}

// ===== NAVEGACAO =====
function navegar(secao, e) {
    if (e) e.preventDefault();

    document.querySelectorAll(".secao-page").forEach(function (s) { s.classList.remove("active"); });
    var el = document.getElementById("secao-" + secao);
    if (el) el.classList.add("active");

    document.querySelectorAll(".nav-link").forEach(function (l) { l.classList.remove("active"); });
    document.querySelectorAll(".nav-link").forEach(function (l) {
        var onclick = l.getAttribute("onclick") || "";
        if (onclick.indexOf("'" + secao + "'") !== -1) l.classList.add("active");
    });

    // Fechar menu mobile
    document.getElementById("mainNav").classList.remove("open");

    // Render da secao
    switch (secao) {
        case "inicio": renderInicio(); break;
        case "noticias": renderNoticias(); break;
        case "campeonatos": renderCampeonatos("futebol"); break;
        case "calendario": renderCalendario(); break;
        case "atletas": renderAtletas(); break;
        case "galeria": renderGaleria(); break;
        case "videos": renderVideos(); break;
        case "opiniao": renderOpinioes(); break;
        case "conquistas": renderConquistas(); break;
        case "redacao": if (!isAdmin()) { navegar("inicio", null); return; } renderTemplatesPauta(); renderAdminPautas(); break;
        case "sobre": atualizarStorageInfo(); renderSobreEditavel(); atualizarLiveStatus(); renderAdminPatrocinadores(); renderAdminEnquetes(); renderAdminResumos(); renderAdminTimes(); renderNewsletterAdmin(); break;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleMobileMenu() {
    document.getElementById("mainNav").classList.toggle("open");
}

// ===== TICKER =====
function renderTicker() {
    var noticias = getData("noticias").slice(0, 5);
    var jogos = getData("jogos").slice(0, 3);
    var textos = [];

    noticias.forEach(function (n) { textos.push("\u26A1 " + n.titulo); });
    jogos.forEach(function (j) {
        var txt = "\uD83D\uDCC5 " + j.timeCasa;
        if (j.timeFora) txt += " x " + j.timeFora;
        txt += " - " + formatarData(j.data) + " " + (j.hora || "");
        textos.push(txt);
    });

    var el = document.getElementById("tickerText");
    if (el) el.textContent = textos.join("     \u2022     ");
}

// ===== HERO STATS =====
function renderHeroStats() {
    var campeonatos = getCampeonatos();
    var jogos = getData("jogos");
    var totalTimes = 0;
    var totalResultados = 0;
    var totalGols = 0;

    campeonatos.forEach(function (c) {
        totalTimes += (c.times || []).length;
        (c.resultados || []).forEach(function (r) {
            totalResultados++;
            totalGols += (parseInt(r.placarCasa) || 0) + (parseInt(r.placarFora) || 0);
        });
    });

    animateCounter("statTimes", totalTimes);
    animateCounter("statJogos", jogos.length + totalResultados);
    animateCounter("statGols", totalGols);
}

function animateCounter(id, target) {
    var el = document.getElementById(id);
    if (!el) return;
    var start = 0;
    var duration = 1500;
    var startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var current = Math.floor(progress * target);
        el.textContent = current;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
    }

    requestAnimationFrame(step);
}

// ===== SPORTS GRID =====
function renderSportsGrid() {
    var grid = document.getElementById("sportsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    ESPORTES.forEach(function (esporte) {
        var count = getData("resultados").filter(function (r) { return r.esporte === esporte.id; }).length;
        var div = document.createElement("div");
        div.className = "sport-card";
        div.onclick = function () {
            if (["futebol", "volei", "basquete"].indexOf(esporte.id) !== -1) {
                navegar("campeonatos", null);
                setTimeout(function () { selectCampTab(esporte.id, null); }, 100);
            } else {
                navegar("noticias", null);
                setTimeout(function () { filtrarNoticias(esporte.id, null); }, 100);
            }
        };
        div.innerHTML =
            '<span class="sport-card-icon">' + esporte.icon + '</span>' +
            '<div class="sport-card-name">' + esc(esporte.nome) + '</div>' +
            '<div class="sport-card-count">' + count + ' resultado' + (count !== 1 ? 's' : '') + '</div>';
        grid.appendChild(div);
    });
}

// ===== PAGINA INICIO =====
function renderInicio() {
    renderNoticiasHome();
    renderPlacarAoVivo();
    renderProximosJogos();
    renderArtilheirosHome();
    renderEnqueteHome();
    renderResumoSemana();
}

function renderNoticiasHome() {
    var noticias = getData("noticias").filter(function (n) { return !n.rascunho; }).sort(function (a, b) {
        if (a.destaque && !b.destaque) return -1;
        if (!a.destaque && b.destaque) return 1;
        return b.data.localeCompare(a.data);
    }).slice(0, 3);
    var grid = document.getElementById("newsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (noticias.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\uD83D\uDCF0</div><div class="empty-state-text">Nenhuma noticia publicada ainda.</div></div>';
        return;
    }

    noticias.forEach(function (n) {
        grid.innerHTML += renderNewsCard(n);
    });
}

function renderNewsCard(n) {
    var esporte = ESPORTES.find(function (e) { return e.id === n.categoria; });
    var icon = esporte ? esporte.icon : "\uD83D\uDCF0";
    var midiaHtml = renderMidia(n.imagem, n.video, n.titulo);
    if (!midiaHtml) midiaHtml = '<div class="news-card-img">' + icon + '</div>';

    var temFonteUrl = n.fonte && /^https?:\/\//i.test(n.fonte.trim());
    var fonteHtml = temFonteUrl
        ? '<div class="news-card-fonte"><a href="' + esc(n.fonte) + '" target="_blank" rel="noopener" onclick="event.stopPropagation();">Ver fonte original &rarr;</a></div>'
        : '';

    var rascunhoLabel = n.rascunho ? ' <span class="news-card-rascunho">RASCUNHO</span>' : '';
    var destaqueLabel = n.destaque ? ' <span class="news-card-destaque">&#9733; DESTAQUE</span>' : '';
    var destaqueBtnText = n.destaque ? 'Remover Destaque' : 'Destacar';
    var cidadeNome = nomeCidade(n.cidade);
    var cidadeHtml = (n.cidade && n.cidade !== 'sao-pedro')
        ? ' <span class="news-card-cidade">' + esc(cidadeNome) + '</span>'
        : '';

    var adminHtml = isAdmin()
        ? '<div class="news-card-actions admin-only">' +
                '<button onclick="event.stopPropagation();editarNoticia(\'' + n.id + '\')">Editar</button>' +
                '<button onclick="event.stopPropagation();toggleDestaque(\'' + n.id + '\')">' + destaqueBtnText + '</button>' +
                '<button onclick="event.stopPropagation();deletarNoticia(\'' + n.id + '\')">Excluir</button>' +
            '</div>'
        : '';

    return '<div class="news-card' + (n.destaque ? ' news-card-featured' : '') + '" onclick="abrirNoticia(\'' + n.id + '\')">' +
        midiaHtml +
        '<div class="news-card-body">' +
            '<span class="news-card-cat ' + esc(n.categoria) + '">' + esc(n.categoria) + '</span>' + cidadeHtml + destaqueLabel + rascunhoLabel +
            '<h3 class="news-card-title">' + esc(n.titulo) + '</h3>' +
            '<p class="news-card-excerpt">' + esc(stripHtml(n.corpo)) + '</p>' +
            '<div class="news-card-date">' + formatarData(n.data) +
                (isAdmin() ? ' &middot; ' + getViews(n.id) + ' views' : '') +
            '</div>' +
            fonteHtml +
            adminHtml +
        '</div></div>';
}

function abrirNoticia(id) {
    var noticias = getData("noticias");
    var n = noticias.find(function (x) { return x.id === id; });
    if (!n) return;

    var esporte = ESPORTES.find(function (e) { return e.id === n.categoria; });
    var catClass = esc(n.categoria);

    var midiaHtml = '';
    if (n.video) {
        var ytId = extrairYoutubeId(n.video);
        if (ytId) {
            midiaHtml = '<div class="news-modal-video"><iframe src="https://www.youtube.com/embed/' + ytId + '" frameborder="0" allowfullscreen></iframe></div>';
        } else {
            midiaHtml = '<div class="news-modal-video"><video src="' + esc(n.video) + '" controls></video></div>';
        }
    } else if (n.imagem) {
        midiaHtml = '<img class="news-modal-img" src="' + esc(n.imagem) + '" alt="' + esc(n.titulo) + '">';
    }

    var galeriaHtml = '';
    if (n.galeria && n.galeria.length > 0) {
        galeriaHtml = '<div class="news-modal-galeria">';
        n.galeria.forEach(function (url) {
            galeriaHtml += '<img src="' + esc(url) + '" alt="Foto" class="news-modal-galeria-img" onclick="event.stopPropagation();abrirLightboxUrl(\'' + esc(url) + '\')">';
        });
        galeriaHtml += '</div>';
    }

    var temFonteUrl = n.fonte && /^https?:\/\//i.test(n.fonte.trim());
    var fonteHtml = temFonteUrl
        ? '<div class="news-modal-fonte"><a href="' + esc(n.fonte) + '" target="_blank" rel="noopener">Ver fonte original &rarr;</a></div>'
        : '';

    var resumo = stripHtml(n.corpo).substring(0, 150);
    var shareText = encodeURIComponent(n.titulo + "\n\n" + resumo + "...\n\nLeia mais no Esporte Sao Pedro:");
    var shareUrl = encodeURIComponent(window.location.origin + window.location.pathname);

    var shareHtml = '<div class="news-modal-share">' +
        '<span class="share-label">Compartilhar:</span>' +
        '<a href="https://wa.me/?text=' + shareText + '%20' + shareUrl + '" target="_blank" rel="noopener" class="share-btn share-whatsapp" title="WhatsApp">WhatsApp</a>' +
        '<a href="https://www.facebook.com/sharer/sharer.php?u=' + shareUrl + '&quote=' + encodeURIComponent(n.titulo) + '" target="_blank" rel="noopener" class="share-btn share-facebook" title="Facebook">Facebook</a>' +
        '<button class="share-btn share-copy" onclick="copiarLinkNoticia(\'' + esc(n.titulo) + '\')" title="Copiar texto">Copiar</button>' +
        '</div>';

    var content = document.getElementById("noticiaModalContent");
    content.innerHTML =
        midiaHtml +
        '<span class="news-modal-cat news-card-cat ' + catClass + '">' + esc(n.categoria) + '</span>' +
        '<h2 class="news-modal-title">' + esc(n.titulo) + '</h2>' +
        '<div class="news-modal-date">' + formatarData(n.data) + '</div>' +
        '<div class="news-modal-text">' + sanitizeHtml(n.corpo) + '</div>' +
        galeriaHtml +
        fonteHtml +
        shareHtml;

    document.getElementById("noticiaModal").classList.add("active");

    // Contar visualizacao
    var views = getData("views") || {};
    views[id] = (views[id] || 0) + 1;
    setData("views", views);
}

function getViews(id) {
    var views = getData("views") || {};
    return views[id] || 0;
}

function copiarLinkNoticia(titulo) {
    var texto = titulo + "\n\nLeia mais: " + window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(function () { alert("Link copiado!"); });
    } else {
        prompt("Copie o link:", texto);
    }
}

function fecharNoticiaModal() {
    document.getElementById("noticiaModal").classList.remove("active");
}

function renderProximosJogos() {
    var hoje = new Date().toISOString().split("T")[0];
    var jogos = getData("jogos")
        .filter(function (j) { return j.data >= hoje; })
        .sort(function (a, b) { return a.data.localeCompare(b.data); })
        .slice(0, 5);

    var list = document.getElementById("nextGamesList");
    if (!list) return;
    list.innerHTML = "";

    if (jogos.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\uD83D\uDCC5</div><div class="empty-state-text">Nenhum jogo agendado.</div></div>';
        return;
    }

    jogos.forEach(function (j) {
        list.innerHTML += renderGameCard(j);
    });
}

function renderGameCard(j) {
    var dc = formatarDataCurta(j.data);
    var teams = j.timeCasa;
    if (j.timeFora) teams += " x " + j.timeFora;
    var esporte = ESPORTES.find(function (e) { return e.id === j.esporte; });

    return '<div class="game-card">' +
        '<div class="game-date">' +
            '<div class="game-date-day">' + dc.dia + '</div>' +
            '<div class="game-date-month">' + dc.mes + '</div>' +
        '</div>' +
        '<div class="game-info">' +
            '<div class="game-teams">' + esc(teams) + '</div>' +
            '<div class="game-meta">' + (j.hora || "") + ' - ' + esc(j.local || "") + '</div>' +
        '</div>' +
        '<span class="game-sport-badge">' + (esporte ? esporte.icon + " " + esporte.nome : esc(j.esporte)) + '</span>' +
    '</div>';
}

function renderArtilheirosHome() {
    // Pegar artilheiros de todos os campeonatos
    var todos = [];
    getCampeonatos().forEach(function (c) {
        (c.artilheiros || []).forEach(function (a) {
            todos.push({ nome: a.nome, time: a.time, gols: a.gols });
        });
    });
    todos.sort(function (a, b) { return b.gols - a.gols; });
    var top5 = todos.slice(0, 5);

    var container = document.getElementById("scorersTable");
    if (!container) return;
    container.innerHTML = "";

    if (top5.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\u26BD</div><div class="empty-state-text">Nenhum artilheiro registrado.</div></div>';
        return;
    }

    top5.forEach(function (a, i) {
        var rankClass = i === 0 ? "gold" : (i === 1 ? "silver" : (i === 2 ? "bronze" : ""));
        var initials = a.nome.split(" ").map(function (w) { return w[0]; }).join("").substr(0, 2);
        container.innerHTML +=
            '<div class="scorer-row">' +
                '<span class="scorer-rank ' + rankClass + '">' + (i + 1) + '</span>' +
                '<div class="scorer-avatar">' + initials + '</div>' +
                '<div class="scorer-info">' +
                    '<div class="scorer-name">' + esc(a.nome) + '</div>' +
                    '<div class="scorer-team">' + esc(a.time) + '</div>' +
                '</div>' +
                '<div class="scorer-goals">' + a.gols + '</div>' +
            '</div>';
    });
}

// ===== NOTICIAS (PAGINA COMPLETA) =====
var _filtroNoticia = "todas";

function renderNoticias() {
    var noticias = getData("noticias");
    if (!isAdmin()) {
        noticias = noticias.filter(function (n) { return !n.rascunho; });
    }
    noticias.sort(function (a, b) {
        if (a.destaque && !b.destaque) return -1;
        if (!a.destaque && b.destaque) return 1;
        return b.data.localeCompare(a.data);
    });
    if (_filtroNoticia !== "todas") {
        noticias = noticias.filter(function (n) { return n.categoria === _filtroNoticia; });
    }
    if (_buscaNoticia) {
        noticias = noticias.filter(function (n) {
            var texto = (n.titulo + " " + stripHtml(n.corpo) + " " + n.categoria + " " + nomeCidade(n.cidade)).toLowerCase();
            return texto.indexOf(_buscaNoticia) !== -1;
        });
    }

    var grid = document.getElementById("newsFullGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (noticias.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\uD83D\uDCF0</div><div class="empty-state-text">Nenhuma noticia nesta categoria.</div></div>';
        return;
    }

    noticias.forEach(function (n) { grid.innerHTML += renderNewsCard(n); });
}

var _buscaNoticia = "";

function buscarNoticias(termo) {
    _buscaNoticia = termo.toLowerCase().trim();
    renderNoticias();
}

function filtrarNoticias(cat, btn) {
    _filtroNoticia = cat;
    _buscaNoticia = "";
    var searchInput = document.getElementById("newsSearchInput");
    if (searchInput) searchInput.value = "";
    document.querySelectorAll(".news-filters .chip, #secao-noticias .chip").forEach(function (c) { c.classList.remove("active"); });
    if (btn) btn.classList.add("active");
    renderNoticias();
}

function salvarNoticia() {
    var titulo = document.getElementById("noticiaTitle").value.trim();
    var corpo = sanitizeHtml(document.getElementById("noticiaBody").innerHTML.trim());
    var cat = document.getElementById("noticiaCategoria").value;
    var cidade = document.getElementById("noticiaCidade").value;
    var img = document.getElementById("noticiaImg").value.trim();
    var video = document.getElementById("noticiaVideo").value.trim();
    var fonte = document.getElementById("noticiaFonte").value.trim();
    if (!titulo) return alert("Preencha o titulo.");
    var ehRascunho = document.getElementById("noticiaRascunho").checked;

    var noticias = getData("noticias");
    noticias.push({
        id: gerarId(),
        titulo: titulo,
        corpo: corpo,
        categoria: cat,
        cidade: cidade,
        imagem: img,
        galeria: getGaleriaFotos("noticiaGaleriaItems"),
        video: video,
        fonte: fonte,
        rascunho: ehRascunho,
        data: new Date().toISOString().split("T")[0]
    });
    setData("noticias", noticias);

    document.getElementById("noticiaTitle").value = "";
    document.getElementById("noticiaBody").innerHTML = "";
    document.getElementById("noticiaImg").value = "";
    document.getElementById("noticiaVideo").value = "";
    document.getElementById("noticiaFonte").value = "";
    setGaleriaFotos("noticiaGaleriaItems", []);
    document.getElementById("noticiaRascunho").checked = false;
    document.getElementById("adminNoticia").style.display = "none";

    renderNoticias();
    renderTicker();
    alert(ehRascunho ? "Rascunho salvo!" : "Noticia publicada!");
}

function editarNoticia(id) {
    var noticias = getData("noticias");
    var n = noticias.find(function (x) { return x.id === id; });
    if (!n) return;

    document.getElementById("editNoticiaId").value = n.id;
    document.getElementById("editNoticiaTitle").value = n.titulo || "";
    document.getElementById("editNoticiaBody").innerHTML = n.corpo || "";
    document.getElementById("editNoticiaCategoria").value = n.categoria || "geral";
    document.getElementById("editNoticiaImg").value = n.imagem || "";
    setGaleriaFotos("editNoticiaGaleriaItems", n.galeria || []);
    document.getElementById("editNoticiaVideo").value = n.video || "";
    document.getElementById("editNoticiaFonte").value = n.fonte || "";
    document.getElementById("editNoticiaCidade").value = n.cidade || "sao-pedro";
    document.getElementById("editNoticiaRascunho").checked = !!n.rascunho;
    document.getElementById("editNoticiaData").value = n.data || "";

    document.getElementById("editarNoticiaModal").classList.add("active");

    // Re-init upload buttons for the edit modal
    if (typeof CloudUpload !== "undefined" && CloudUpload.init) {
        setTimeout(function () { CloudUpload.init(); }, 100);
    }
}

function salvarEdicaoNoticia() {
    var id = document.getElementById("editNoticiaId").value;
    var noticias = getData("noticias");
    var n = noticias.find(function (x) { return x.id === id; });
    if (!n) return;

    var titulo = document.getElementById("editNoticiaTitle").value.trim();
    if (!titulo) return alert("Preencha o titulo.");

    n.titulo = titulo;
    n.corpo = sanitizeHtml(document.getElementById("editNoticiaBody").innerHTML.trim());
    n.categoria = document.getElementById("editNoticiaCategoria").value;
    n.imagem = document.getElementById("editNoticiaImg").value.trim();
    n.galeria = getGaleriaFotos("editNoticiaGaleriaItems");
    n.video = document.getElementById("editNoticiaVideo").value.trim();
    n.fonte = document.getElementById("editNoticiaFonte").value.trim();
    n.cidade = document.getElementById("editNoticiaCidade").value;
    n.rascunho = document.getElementById("editNoticiaRascunho").checked;
    n.data = document.getElementById("editNoticiaData").value || n.data;

    setData("noticias", noticias);
    fecharEditarNoticia();
    renderNoticias();
    renderInicio();
    renderTicker();
    alert("Noticia atualizada!");
}

function fecharEditarNoticia() {
    document.getElementById("editarNoticiaModal").classList.remove("active");
}

function toggleDestaque(id) {
    var noticias = getData("noticias");
    var n = noticias.find(function (x) { return x.id === id; });
    if (!n) return;
    n.destaque = !n.destaque;
    setData("noticias", noticias);
    renderNoticias();
    renderInicio();
}

function deletarNoticia(id) {
    if (!confirm("Excluir esta noticia?")) return;
    var noticias = getData("noticias").filter(function (n) { return n.id !== id; });
    setData("noticias", noticias);
    renderNoticias();
    renderInicio();
    renderTicker();
}

// ===== POPUP COBERTURA ESPECIAL =====
function verificarPopupCobertura() {
    var agora = new Date();
    var limite = new Date("2026-04-04T23:59:59");
    if (agora > limite) return;

    var popup = document.getElementById("popupCobertura");
    if (popup) popup.classList.add("active");
}

function fecharPopupCobertura() {
    var popup = document.getElementById("popupCobertura");
    if (popup) popup.classList.remove("active");
}

// Exibir popup ao carregar
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(verificarPopupCobertura, 800);
});

// ===== PAUTAS DA REDACAO =====
var TEMPLATES_PAUTA = [
    {
        titulo: "Resultado de jogo / rodada",
        categoria: "futebol",
        template: "RESULTADO: [Time A] [X] x [X] [Time B]\n\nData: [data]\nLocal: [local]\nCampeonato: [nome do campeonato]\n\nDestaques da partida:\n- Gols: [jogador] aos [min]\n- Cartoes: [detalhes]\n\nClassificacao atualizada:\n1o - [time] - [pts] pontos\n2o - [time] - [pts] pontos\n\nProximo jogo: [data] - [adversario]"
    },
    {
        titulo: "Cobertura de corrida / prova de atletismo",
        categoria: "corrida",
        template: "CORRIDA: [Nome do evento]\n\nData: [data]\nLocal: [cidade]\nPercurso: [distancia] km\nParticipantes de Sao Pedro: [numero]\n\nResultados - Podio por categoria:\n\nCategoria [faixa etaria]:\n1o - [nome] - [tempo]\n2o - [nome] - [tempo]\n3o - [nome] - [tempo]\n\nEquipe de Sao Pedro recebeu: [trofeu/resultado geral]\n\nAtletas que representaram SP:\n[lista de nomes]\n\nFonte: [organizacao/site do evento]"
    },
    {
        titulo: "Resultado CRV Voleibol",
        categoria: "volei",
        template: "CIRCUITO REGIONAL DE VOLEIBOL - [Etapa/Rodada]\n\nData: [data]\nLocal: [ginasio] - [cidade]\n\nCategoria Adulto:\nSao Pedro [X] x [X] [Adversario]\nSets: [detalhes]\nMelhor jogador: [nome]\n\nCategoria Sub-21 Masculino:\nSao Pedro [X] x [X] [Adversario]\nMelhor jogador: [nome]\n\nCategoria Sub-21 Feminino:\nSao Pedro [X] x [X] [Adversario]\n\nProxima etapa: [data] em [cidade]"
    },
    {
        titulo: "Campeonato de Futsal / Society",
        categoria: "futebol",
        template: "CAMPEONATO MUNICIPAL DE [FUTSAL/SOCIETY] 2026\n\nCategoria: [Sub-9/Sub-11/Sub-13/Sub-15]\nRodada: [numero]\nData: [data]\nLocal: [local]\n\nResultados:\n[Time A] [X] x [X] [Time B]\n[Time C] [X] x [X] [Time D]\n\nClassificacao do grupo:\n[tabela]\n\nDestaques: [gols bonitos, jogadores, publico]"
    },
    {
        titulo: "Evento esportivo / Premiacao",
        categoria: "geral",
        template: "EVENTO: [Nome do evento]\n\nData: [data]\nLocal: [local]\nOrganizacao: Secretaria de Esporte e Lazer\n\nO que aconteceu:\n[descricao]\n\nParticipantes/Premiados:\n- [nome] - [conquista]\n- [nome] - [conquista]\n\nFotos: [coletar no local]\nContato: Marcelo Vieira - (19) 3481-9393"
    },
    {
        titulo: "Perfil de atleta destaque",
        categoria: "geral",
        template: "ATLETA: [Nome completo]\nIdade: [idade]\nEsporte: [modalidade]\nEquipe: [time/EMA]\n\nTrajetoria:\n[como comecou, ha quanto tempo pratica]\n\nPrincipais conquistas:\n- [ano] - [conquista]\n- [ano] - [conquista]\n\nProximos objetivos:\n[metas, competicoes]\n\nFrase do atleta:\n\"[depoimento]\"\n\nFoto: [coletar]"
    },
    {
        titulo: "Resumo semanal do esporte",
        categoria: "geral",
        template: "RESUMO DA SEMANA - [data inicio] a [data fim]\n\nFUTEBOL/FUTSAL:\n- [resultado ou novidade]\n\nVOLEI:\n- [resultado ou novidade]\n\nCORRIDA/ATLETISMO:\n- [resultado ou novidade]\n\nAGENDA DA SEMANA:\n- [dia] - [evento] - [local] - [horario]\n- [dia] - [evento] - [local] - [horario]\n\nDESTAQUE DA SEMANA:\n[atleta ou equipe que se destacou]"
    },
    {
        titulo: "XV Copa Voleibol Adaptado - Proxima rodada",
        categoria: "volei",
        template: "XV COPA DE VOLEIBOL ADAPTADO - [Rodada X]\n\nData: [data]\nLocal: [cidade sede]\nCidades: Sao Pedro, Jundiai, Lencois Paulista, Limeira, Mogi Guacu, Piracicaba, Tatui\n\nResultados Sao Pedro:\nFeminino 58+: SP [X] x [X] [adversario]\nMasculino 58+: SP [X] x [X] [adversario]\nFeminino 68+: SP [X] x [X] [adversario]\nMasculino 68+: SP [X] x [X] [adversario]\n\nClassificacao geral: [posicao]"
    },
    {
        titulo: "Triathlon / Duathlon / Aquathlon",
        categoria: "corrida",
        template: "COPA INTERIOR DE [TRIATHLON/DUATHLON/AQUATHLON]\n\nEtapa: [numero/cidade]\nData: [data]\n\nAtletas de Sao Pedro:\n- [nome] - [categoria] - [colocacao]\n\nResultado geral da equipe SP:\n[posicao entre X municipios]\n\nTrofeus conquistados: [numero]\nAcumulado na temporada: [X] trofeus\n\nSao Pedro ocupa a [X]a posicao geral (de 223 municipios)"
    }
];

function renderTemplatesPauta() {
    var container = document.getElementById("pautasTemplateList");
    if (!container) return;
    container.innerHTML = '<h4 style="font-size:0.85rem;margin-bottom:12px;">Templates prontos</h4>';
    TEMPLATES_PAUTA.forEach(function (t, i) {
        container.innerHTML +=
            '<div class="pauta-template-card">' +
                '<div class="pauta-template-header">' +
                    '<span class="news-card-cat ' + t.categoria + '" style="font-size:0.65rem;">' + t.categoria + '</span>' +
                    '<strong style="font-size:0.85rem;">' + esc(t.titulo) + '</strong>' +
                '</div>' +
                '<div class="pauta-template-actions">' +
                    '<button class="btn btn-sm" onclick="usarTemplate(' + i + ')">Usar como base</button>' +
                    '<button class="btn btn-sm" onclick="copiarTemplate(' + i + ')">Copiar texto</button>' +
                '</div>' +
            '</div>';
    });
}

function usarTemplate(idx) {
    var t = TEMPLATES_PAUTA[idx];
    if (!t) return;
    // Preencher o form de nova noticia
    document.getElementById("noticiaTitle").value = t.titulo;
    document.getElementById("noticiaBody").innerHTML = esc(t.template).replace(/\n/g, '<br>');
    document.getElementById("noticiaCategoria").value = t.categoria;
    // Navegar para noticias e abrir form
    navegar("noticias", null);
    var form = document.getElementById("adminNoticia");
    if (form) form.style.display = "block";
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function copiarTemplate(idx) {
    var t = TEMPLATES_PAUTA[idx];
    if (!t) return;
    var texto = t.titulo + "\n\n" + t.template;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(function () { alert("Template copiado!"); });
    } else {
        prompt("Copie:", texto);
    }
}

function salvarPauta() {
    var titulo = document.getElementById("pautaTitulo").value.trim();
    var categoria = document.getElementById("pautaCategoria").value;
    var prioridade = document.getElementById("pautaPrioridade").value;
    var notas = document.getElementById("pautaNotas").value.trim();
    var prazo = document.getElementById("pautaPrazo").value;
    if (!titulo) return alert("Preencha o titulo da pauta.");

    var pautas = getData("pautas");
    pautas.push({
        id: gerarId(),
        titulo: titulo,
        categoria: categoria,
        prioridade: prioridade,
        notas: notas,
        prazo: prazo,
        status: "pendente",
        data: new Date().toISOString().split("T")[0]
    });
    setData("pautas", pautas);

    document.getElementById("pautaTitulo").value = "";
    document.getElementById("pautaNotas").value = "";
    document.getElementById("pautaPrazo").value = "";
    renderAdminPautas();
    alert("Pauta salva!");
}

function marcarPautaFeita(id) {
    var pautas = getData("pautas");
    var p = pautas.find(function (x) { return x.id === id; });
    if (p) p.status = (p.status === "pendente") ? "feita" : "pendente";
    setData("pautas", pautas);
    renderAdminPautas();
}

function deletarPauta(id) {
    if (!confirm("Excluir pauta?")) return;
    var pautas = getData("pautas").filter(function (x) { return x.id !== id; });
    setData("pautas", pautas);
    renderAdminPautas();
}

function usarPautaComoNoticia(id) {
    var pautas = getData("pautas");
    var p = pautas.find(function (x) { return x.id === id; });
    if (!p) return;
    document.getElementById("noticiaTitle").value = p.titulo;
    document.getElementById("noticiaBody").innerHTML = esc(p.notas || "").replace(/\n/g, '<br>');
    document.getElementById("noticiaCategoria").value = p.categoria;
    navegar("noticias", null);
    var form = document.getElementById("adminNoticia");
    if (form) form.style.display = "block";
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function renderAdminPautas() {
    var container = document.getElementById("adminPautasList");
    if (!container) return;
    var pautas = getData("pautas").sort(function (a, b) {
        var prioOrder = { alta: 0, media: 1, baixa: 2 };
        if (a.status !== b.status) return a.status === "pendente" ? -1 : 1;
        return (prioOrder[a.prioridade] || 1) - (prioOrder[b.prioridade] || 1);
    });

    if (pautas.length === 0) {
        container.innerHTML = "<p style='color:#8892a4;font-size:0.85rem;'>Nenhuma pauta criada.</p>";
        return;
    }

    container.innerHTML = "";
    pautas.forEach(function (p) {
        var prioColor = { alta: "#ef4444", media: "#d97706", baixa: "#16a34a" };
        var isDone = p.status === "feita";
        var prazoTxt = p.prazo ? " | Prazo: " + formatarData(p.prazo) : "";

        container.innerHTML +=
            '<div class="pauta-item' + (isDone ? ' pauta-feita' : '') + '">' +
                '<div class="pauta-item-header">' +
                    '<span class="pauta-prio" style="background:' + (prioColor[p.prioridade] || "#999") + ';">' + esc(p.prioridade) + '</span>' +
                    '<span class="news-card-cat ' + p.categoria + '" style="font-size:0.6rem;">' + esc(p.categoria) + '</span>' +
                    '<strong style="font-size:0.85rem;' + (isDone ? 'text-decoration:line-through;color:#9ca3af;' : '') + '">' + esc(p.titulo) + '</strong>' +
                '</div>' +
                (p.notas ? '<p style="font-size:0.8rem;color:#64748b;margin:4px 0;white-space:pre-line;">' + esc(p.notas).substring(0, 150) + '</p>' : '') +
                '<div style="font-size:0.7rem;color:#9ca3af;">' + formatarData(p.data) + prazoTxt + '</div>' +
                '<div style="display:flex;gap:6px;margin-top:6px;">' +
                    '<button class="btn btn-sm" onclick="marcarPautaFeita(\'' + p.id + '\')">' + (isDone ? 'Reabrir' : 'Concluir') + '</button>' +
                    '<button class="btn btn-sm" onclick="usarPautaComoNoticia(\'' + p.id + '\')">Criar noticia</button>' +
                    '<button class="btn btn-sm" onclick="deletarPauta(\'' + p.id + '\')">Excluir</button>' +
                '</div>' +
            '</div>';
    });
}

// ===== ENQUETES / VOTACOES =====
function renderEnqueteHome() {
    var container = document.getElementById("enqueteHome");
    if (!container) return;
    var enquetes = getData("enquetes").filter(function (e) { return e.ativa; });
    if (enquetes.length === 0) { container.innerHTML = ""; return; }

    var e = enquetes[enquetes.length - 1]; // ultima enquete ativa
    var totalVotos = 0;
    e.opcoes.forEach(function (o) { totalVotos += (o.votos || 0); });
    var jaVotou = localStorage.getItem("esp_voto_" + e.id);

    var html = '<div class="section-header"><h2 class="section-title">Enquete</h2></div>';
    html += '<div class="enquete-card">';
    html += '<h3 class="enquete-pergunta">' + esc(e.pergunta) + '</h3>';

    e.opcoes.forEach(function (o, i) {
        var pct = totalVotos > 0 ? Math.round((o.votos || 0) / totalVotos * 100) : 0;
        if (jaVotou) {
            var isVoted = (jaVotou == i) ? ' enquete-voted' : '';
            html += '<div class="enquete-opcao enquete-resultado' + isVoted + '">' +
                '<div class="enquete-barra" style="width:' + pct + '%"></div>' +
                '<span class="enquete-texto">' + esc(o.texto) + '</span>' +
                '<span class="enquete-pct">' + pct + '%</span>' +
            '</div>';
        } else {
            html += '<button class="enquete-opcao enquete-btn" onclick="votarEnquete(\'' + e.id + '\',' + i + ')">' +
                esc(o.texto) + '</button>';
        }
    });

    html += '<div class="enquete-total">' + totalVotos + ' voto' + (totalVotos !== 1 ? 's' : '') + '</div>';
    html += '</div>';
    container.innerHTML = html;
}

function votarEnquete(id, opcaoIdx) {
    var enquetes = getData("enquetes");
    var e = enquetes.find(function (x) { return x.id === id; });
    if (!e) return;
    e.opcoes[opcaoIdx].votos = (e.opcoes[opcaoIdx].votos || 0) + 1;
    setData("enquetes", enquetes);
    localStorage.setItem("esp_voto_" + id, opcaoIdx);
    renderEnqueteHome();
}

function salvarEnquete() {
    var pergunta = document.getElementById("enquetePergunta").value.trim();
    var opcoesRaw = document.getElementById("enqueteOpcoes").value.trim();
    if (!pergunta || !opcoesRaw) return alert("Preencha pergunta e opcoes.");

    var opcoes = opcoesRaw.split("\n").filter(function (l) { return l.trim(); }).map(function (l) {
        return { texto: l.trim(), votos: 0 };
    });
    if (opcoes.length < 2) return alert("Minimo 2 opcoes.");

    var enquetes = getData("enquetes");
    enquetes.push({
        id: gerarId(),
        pergunta: pergunta,
        opcoes: opcoes,
        ativa: true,
        data: new Date().toISOString().split("T")[0]
    });
    setData("enquetes", enquetes);

    document.getElementById("enquetePergunta").value = "";
    document.getElementById("enqueteOpcoes").value = "";
    renderAdminEnquetes();
    renderEnqueteHome();
    alert("Enquete criada!");
}

function encerrarEnquete(id) {
    var enquetes = getData("enquetes");
    var e = enquetes.find(function (x) { return x.id === id; });
    if (e) e.ativa = false;
    setData("enquetes", enquetes);
    renderAdminEnquetes();
    renderEnqueteHome();
}

function deletarEnquete(id) {
    if (!confirm("Excluir enquete?")) return;
    var enquetes = getData("enquetes").filter(function (x) { return x.id !== id; });
    setData("enquetes", enquetes);
    renderAdminEnquetes();
    renderEnqueteHome();
}

function renderAdminEnquetes() {
    var container = document.getElementById("adminEnqueteList");
    if (!container) return;
    var enquetes = getData("enquetes").sort(function (a, b) { return b.data.localeCompare(a.data); });
    if (enquetes.length === 0) { container.innerHTML = "<p style='color:#8892a4;font-size:0.85rem;'>Nenhuma enquete.</p>"; return; }

    container.innerHTML = "";
    enquetes.forEach(function (e) {
        var total = 0;
        e.opcoes.forEach(function (o) { total += (o.votos || 0); });
        var status = e.ativa ? '<span style="color:#16a34a;font-weight:700;">Ativa</span>' : '<span style="color:#8892a4;">Encerrada</span>';
        container.innerHTML +=
            '<div style="padding:12px;border:1px solid var(--cinza-200);border-radius:8px;margin-bottom:8px;">' +
                '<strong>' + esc(e.pergunta) + '</strong> - ' + status + ' (' + total + ' votos)<br>' +
                (e.ativa ? '<button class="btn btn-sm" style="margin-top:6px;" onclick="encerrarEnquete(\'' + e.id + '\')">Encerrar</button> ' : '') +
                '<button class="btn btn-sm" style="margin-top:6px;" onclick="deletarEnquete(\'' + e.id + '\')">Excluir</button>' +
            '</div>';
    });
}

// ===== PLACAR AO VIVO =====
function atualizarPlacar() {
    var timeCasa = document.getElementById("placarTimeCasa").value.trim();
    var timeFora = document.getElementById("placarTimeFora").value.trim();
    var golsCasa = parseInt(document.getElementById("placarGolsCasa").value) || 0;
    var golsFora = parseInt(document.getElementById("placarGolsFora").value) || 0;
    var minuto = document.getElementById("placarMinuto").value.trim();
    var esporte = document.getElementById("placarEsporte").value;
    if (!timeCasa || !timeFora) return alert("Preencha os dois times.");

    setData("placar_vivo", {
        timeCasa: timeCasa,
        timeFora: timeFora,
        golsCasa: golsCasa,
        golsFora: golsFora,
        minuto: minuto,
        esporte: esporte,
        ativo: true
    });
    renderPlacarAoVivo();
    alert("Placar atualizado!");
}

function encerrarPlacar() {
    setData("placar_vivo", { ativo: false });
    renderPlacarAoVivo();
}

function renderPlacarAoVivo() {
    var container = document.getElementById("placarAoVivoHome");
    if (!container) return;
    var p = getData("placar_vivo");
    if (!p || !p.ativo) { container.innerHTML = ""; return; }

    container.innerHTML =
        '<div class="section-header" style="margin-top:50px;">' +
            '<h2 class="section-title">Placar ao Vivo</h2>' +
        '</div>' +
        '<div class="placar-vivo-card">' +
            '<div class="placar-badge-live">AO VIVO</div>' +
            '<div class="placar-times">' +
                '<div class="placar-time">' +
                    '<span class="placar-time-nome">' + esc(p.timeCasa) + '</span>' +
                    '<span class="placar-gols">' + p.golsCasa + '</span>' +
                '</div>' +
                '<div class="placar-vs">x</div>' +
                '<div class="placar-time">' +
                    '<span class="placar-gols">' + p.golsFora + '</span>' +
                    '<span class="placar-time-nome">' + esc(p.timeFora) + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="placar-minuto">' + esc(p.minuto || "") + '</div>' +
        '</div>';
}

// ===== RESUMO DA SEMANA =====
function salvarResumo() {
    var titulo = document.getElementById("resumoTitulo").value.trim();
    var corpo = sanitizeHtml(document.getElementById("resumoCorpo").innerHTML.trim());
    if (!titulo) return alert("Preencha o titulo.");

    var resumos = getData("resumos");
    resumos.push({
        id: gerarId(),
        titulo: titulo,
        corpo: corpo,
        data: new Date().toISOString().split("T")[0]
    });
    setData("resumos", resumos);

    document.getElementById("resumoTitulo").value = "";
    document.getElementById("resumoCorpo").innerHTML = "";
    renderResumoSemana();
    renderAdminResumos();
    alert("Resumo publicado!");
}

function deletarResumo(id) {
    if (!confirm("Excluir resumo?")) return;
    var resumos = getData("resumos").filter(function (r) { return r.id !== id; });
    setData("resumos", resumos);
    renderResumoSemana();
    renderAdminResumos();
}

function renderResumoSemana() {
    var container = document.getElementById("resumoSemanaHome");
    if (!container) return;
    var resumos = getData("resumos").sort(function (a, b) { return b.data.localeCompare(a.data); });
    if (resumos.length === 0) { container.innerHTML = ""; return; }

    var r = resumos[0]; // mais recente
    container.innerHTML =
        '<div class="section-header"><h2 class="section-title">Resumo da Semana</h2></div>' +
        '<div class="resumo-card">' +
            '<h3 class="resumo-titulo">' + esc(r.titulo) + '</h3>' +
            '<div class="resumo-data">' + formatarData(r.data) + '</div>' +
            '<div class="resumo-corpo">' + sanitizeHtml(r.corpo) + '</div>' +
        '</div>';
}

function renderAdminResumos() {
    var container = document.getElementById("adminResumoList");
    if (!container) return;
    var resumos = getData("resumos").sort(function (a, b) { return b.data.localeCompare(a.data); });
    if (resumos.length === 0) { container.innerHTML = ""; return; }

    container.innerHTML = "";
    resumos.forEach(function (r) {
        container.innerHTML +=
            '<div style="padding:8px 12px;border:1px solid var(--cinza-200);border-radius:6px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:0.85rem;">' + esc(r.titulo) + ' - ' + formatarData(r.data) + '</span>' +
                '<button class="btn btn-sm" onclick="deletarResumo(\'' + r.id + '\')">Excluir</button>' +
            '</div>';
    });
}

// ===== CONQUISTAS / QUADRO DE MEDALHAS =====
function renderConquistas() {
    var conquistas = getData("conquistas").sort(function (a, b) { return b.data.localeCompare(a.data); });
    var grid = document.getElementById("conquistasGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (conquistas.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">&#127942;</div><div class="empty-state-text">Nenhuma conquista registrada ainda.</div></div>';
        return;
    }

    conquistas.forEach(function (c) {
        var medalhaIcon = { ouro: "&#129351;", prata: "&#129352;", bronze: "&#129353;", destaque: "&#11088;" };
        var medalhaClass = c.medalha || "destaque";
        var icon = medalhaIcon[medalhaClass] || "&#11088;";

        var adminBtn = isAdmin()
            ? '<button class="btn btn-sm" style="margin-top:8px;font-size:0.7rem;" onclick="deletarConquista(\'' + c.id + '\')">Excluir</button>'
            : '';

        grid.innerHTML +=
            '<div class="conquista-card conquista-' + medalhaClass + '">' +
                '<div class="conquista-medalha">' + icon + '</div>' +
                '<div class="conquista-info">' +
                    '<h3 class="conquista-titulo">' + esc(c.titulo) + '</h3>' +
                    '<p class="conquista-atleta">' + esc(c.atleta) + '</p>' +
                    '<p class="conquista-detalhe">' + esc(c.evento || "") + (c.local ? " - " + esc(c.local) : "") + '</p>' +
                    '<span class="conquista-data">' + formatarData(c.data) + '</span>' +
                    adminBtn +
                '</div>' +
            '</div>';
    });
}

function salvarConquista() {
    var titulo = document.getElementById("conquistaTitulo").value.trim();
    var atleta = document.getElementById("conquistaAtleta").value.trim();
    var esporte = document.getElementById("conquistaEsporte").value;
    var medalha = document.getElementById("conquistaMedalha").value;
    var evento = document.getElementById("conquistaEvento").value.trim();
    var local = document.getElementById("conquistaLocal").value.trim();
    var data = document.getElementById("conquistaData").value;
    if (!titulo || !atleta) return alert("Preencha titulo e atleta.");

    var conquistas = getData("conquistas");
    conquistas.push({
        id: gerarId(),
        titulo: titulo,
        atleta: atleta,
        esporte: esporte,
        medalha: medalha,
        evento: evento,
        local: local,
        data: data || new Date().toISOString().split("T")[0]
    });
    setData("conquistas", conquistas);

    document.getElementById("conquistaTitulo").value = "";
    document.getElementById("conquistaAtleta").value = "";
    document.getElementById("conquistaEvento").value = "";
    document.getElementById("conquistaLocal").value = "";
    document.getElementById("conquistaData").value = "";
    document.getElementById("adminConquista").style.display = "none";
    renderConquistas();
    alert("Conquista registrada!");
}

function deletarConquista(id) {
    if (!confirm("Excluir conquista?")) return;
    var conquistas = getData("conquistas").filter(function (c) { return c.id !== id; });
    setData("conquistas", conquistas);
    renderConquistas();
}

// ===== TIMES / EQUIPES =====
function renderTimes() {
    var container = document.getElementById("timesGrid");
    if (!container) return;
    var times = getData("times");
    if (times.length === 0) { container.innerHTML = ""; return; }

    var html = '<div class="section-header" style="margin-bottom:20px;"><h2 class="section-title" style="font-size:1.1rem;">Times e Equipes</h2></div>';
    html += '<div class="times-grid">';
    times.forEach(function (t) {
        var esporte = ESPORTES.find(function (e) { return e.id === t.esporte; });
        var icon = esporte ? esporte.icon : "&#9917;";
        var logo = t.logo
            ? '<img src="' + esc(t.logo) + '" alt="' + esc(t.nome) + '" class="time-logo">'
            : '<div class="time-logo time-logo-placeholder">' + icon + '</div>';

        html +=
            '<div class="time-card">' +
                logo +
                '<div class="time-info">' +
                    '<h3 class="time-nome">' + esc(t.nome) + '</h3>' +
                    '<span class="time-esporte">' + (esporte ? esporte.nome : esc(t.esporte)) + '</span>' +
                    (t.descricao ? '<p class="time-desc">' + esc(t.descricao).substring(0, 120) + '</p>' : '') +
                '</div>' +
            '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

function salvarTime() {
    var nome = document.getElementById("timeNome").value.trim();
    var esporte = document.getElementById("timeEsporte").value;
    var logo = document.getElementById("timeLogo").value.trim();
    var descricao = document.getElementById("timeDescricao").value.trim();
    if (!nome) return alert("Preencha o nome do time.");

    var times = getData("times");
    times.push({
        id: gerarId(),
        nome: nome,
        esporte: esporte,
        logo: logo,
        descricao: descricao
    });
    setData("times", times);

    document.getElementById("timeNome").value = "";
    document.getElementById("timeLogo").value = "";
    document.getElementById("timeDescricao").value = "";
    renderTimes();
    renderAdminTimes();
    alert("Time cadastrado!");
}

function deletarTime(id) {
    if (!confirm("Excluir time?")) return;
    var times = getData("times").filter(function (t) { return t.id !== id; });
    setData("times", times);
    renderTimes();
    renderAdminTimes();
}

function renderAdminTimes() {
    var container = document.getElementById("adminTimesList");
    if (!container) return;
    var times = getData("times");
    if (times.length === 0) { container.innerHTML = "<p style='color:#8892a4;font-size:0.85rem;'>Nenhum time.</p>"; return; }

    container.innerHTML = "";
    times.forEach(function (t) {
        container.innerHTML +=
            '<div style="padding:8px 12px;border:1px solid var(--cinza-200);border-radius:6px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:0.85rem;"><strong>' + esc(t.nome) + '</strong> - ' + esc(t.esporte) + '</span>' +
                '<button class="btn btn-sm" onclick="deletarTime(\'' + t.id + '\')">Excluir</button>' +
            '</div>';
    });
}

// ===== OPINIAO / COLUNAS =====
function renderOpinioes() {
    var opinioes = getData("opinioes").sort(function (a, b) { return b.data.localeCompare(a.data); });
    var grid = document.getElementById("opiniaoGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (opinioes.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">&#9997;</div><div class="empty-state-text">Nenhuma coluna publicada ainda.</div></div>';
        return;
    }

    opinioes.forEach(function (o) {
        var autorImg = o.autorImg
            ? '<img src="' + esc(o.autorImg) + '" alt="' + esc(o.autor) + '" class="opiniao-avatar">'
            : '<div class="opiniao-avatar opiniao-avatar-placeholder">' + esc(o.autor.charAt(0).toUpperCase()) + '</div>';

        var adminBtns = isAdmin()
            ? '<div class="news-card-actions admin-only">' +
                '<button onclick="deletarOpiniao(\'' + o.id + '\')">Excluir</button>' +
              '</div>'
            : '';

        grid.innerHTML +=
            '<div class="opiniao-card" onclick="abrirOpiniao(\'' + o.id + '\')">' +
                '<div class="opiniao-header">' +
                    autorImg +
                    '<div class="opiniao-autor-info">' +
                        '<span class="opiniao-autor-nome">' + esc(o.autor) + '</span>' +
                        '<span class="opiniao-data">' + formatarData(o.data) + '</span>' +
                    '</div>' +
                '</div>' +
                '<h3 class="opiniao-titulo">' + esc(o.titulo) + '</h3>' +
                '<p class="opiniao-resumo">' + esc(stripHtml(o.corpo)).substring(0, 200) + '...</p>' +
                adminBtns +
            '</div>';
    });
}

function salvarOpiniao() {
    var autor = document.getElementById("opiniaoAutor").value.trim();
    var autorImg = document.getElementById("opiniaoAutorImg").value.trim();
    var titulo = document.getElementById("opiniaoTitulo").value.trim();
    var corpo = sanitizeHtml(document.getElementById("opiniaoCorpo").innerHTML.trim());
    if (!autor || !titulo) return alert("Preencha autor e titulo.");

    var opinioes = getData("opinioes");
    opinioes.push({
        id: gerarId(),
        autor: autor,
        autorImg: autorImg,
        titulo: titulo,
        corpo: corpo,
        data: new Date().toISOString().split("T")[0]
    });
    setData("opinioes", opinioes);

    document.getElementById("opiniaoAutor").value = "";
    document.getElementById("opiniaoAutorImg").value = "";
    document.getElementById("opiniaoTitulo").value = "";
    document.getElementById("opiniaoCorpo").innerHTML = "";
    document.getElementById("adminOpiniao").style.display = "none";
    renderOpinioes();
    alert("Coluna publicada!");
}

function deletarOpiniao(id) {
    if (!confirm("Excluir esta coluna?")) return;
    var opinioes = getData("opinioes").filter(function (o) { return o.id !== id; });
    setData("opinioes", opinioes);
    renderOpinioes();
}

function abrirOpiniao(id) {
    var opinioes = getData("opinioes");
    var o = opinioes.find(function (x) { return x.id === id; });
    if (!o) return;

    var autorImg = o.autorImg
        ? '<img src="' + esc(o.autorImg) + '" alt="' + esc(o.autor) + '" class="opiniao-avatar">'
        : '<div class="opiniao-avatar opiniao-avatar-placeholder">' + esc(o.autor.charAt(0).toUpperCase()) + '</div>';

    var content = document.getElementById("noticiaModalContent");
    content.innerHTML =
        '<div class="opiniao-header" style="margin-bottom:16px;">' +
            autorImg +
            '<div class="opiniao-autor-info">' +
                '<span class="opiniao-autor-nome">' + esc(o.autor) + '</span>' +
                '<span class="opiniao-data">' + formatarData(o.data) + '</span>' +
            '</div>' +
        '</div>' +
        '<h2 class="news-modal-title">' + esc(o.titulo) + '</h2>' +
        '<div class="news-modal-text">' + sanitizeHtml(o.corpo) + '</div>';

    document.getElementById("noticiaModal").classList.add("active");
}

// ===== CAMPEONATOS (SISTEMA EDITORIAL COMPLETO) =====
var _campAtivo = null; // id do campeonato selecionado

function getCampeonatos() { return getData("campeonatos"); }

function criarCampeonato() {
    var nome = document.getElementById("campNome").value.trim();
    var esporte = document.getElementById("campEsporte").value;
    var ano = document.getElementById("campAno").value.trim() || "2026";
    if (!nome) return alert("Preencha o nome do campeonato.");

    var lista = getCampeonatos();
    lista.push({ id: gerarId(), nome: nome, esporte: esporte, ano: ano, times: [], artilheiros: [], resultados: [] });
    setData("campeonatos", lista);

    document.getElementById("campNome").value = "";
    document.getElementById("adminCampeonato").style.display = "none";
    renderCampeonatos();
    alert("Campeonato criado!");
}

function deletarCampeonato(id) {
    if (!confirm("Excluir este campeonato e TODOS os seus dados?")) return;
    if (!confirm("Tem certeza? Isso apaga times, resultados e artilheiros.")) return;
    var lista = getCampeonatos().filter(function (c) { return c.id !== id; });
    setData("campeonatos", lista);
    _campAtivo = null;
    renderCampeonatos();
}

function renderCampeonatos() {
    var lista = getCampeonatos();
    var tabs = document.getElementById("campTabs");
    var conteudo = document.getElementById("campConteudo");
    if (!tabs || !conteudo) return;
    tabs.innerHTML = "";

    if (lista.length === 0) {
        conteudo.innerHTML = '<div class="empty-state"><div class="empty-state-icon">&#127942;</div><div class="empty-state-text">Nenhum campeonato criado.' + (isAdmin() ? ' Clique em "+ Criar Campeonato" acima.' : '') + '</div></div>';
        return;
    }

    // Se nao tem ativo, selecionar o primeiro
    if (!_campAtivo || !lista.find(function (c) { return c.id === _campAtivo; })) {
        _campAtivo = lista[0].id;
    }

    lista.forEach(function (c) {
        var esporte = ESPORTES.find(function (e) { return e.id === c.esporte; });
        var icon = esporte ? esporte.icon + " " : "";
        var active = c.id === _campAtivo ? " active" : "";
        tabs.innerHTML += '<button class="tab' + active + '" onclick="selecionarCampeonato(\'' + c.id + '\')">' + icon + esc(c.nome) + '</button>';
    });

    renderCampeonatoAtivo();
}

function selecionarCampeonato(id) {
    _campAtivo = id;
    document.querySelectorAll("#campTabs .tab").forEach(function (t) { t.classList.remove("active"); });
    // Ativar o tab correto
    var tabs = document.querySelectorAll("#campTabs .tab");
    var lista = getCampeonatos();
    lista.forEach(function (c, i) {
        if (c.id === id && tabs[i]) tabs[i].classList.add("active");
    });
    renderCampeonatoAtivo();
}

function getCampAtivo() {
    var lista = getCampeonatos();
    return lista.find(function (c) { return c.id === _campAtivo; }) || null;
}

function salvarCampAtivo(camp) {
    var lista = getCampeonatos();
    for (var i = 0; i < lista.length; i++) {
        if (lista[i].id === camp.id) { lista[i] = camp; break; }
    }
    setData("campeonatos", lista);
}

function renderCampeonatoAtivo() {
    var camp = getCampAtivo();
    var conteudo = document.getElementById("campConteudo");
    if (!conteudo || !camp) return;

    var esporte = ESPORTES.find(function (e) { return e.id === camp.esporte; });
    var esporteNome = esporte ? esporte.icon + " " + esporte.nome : camp.esporte;

    // Ordenar classificacao
    var times = (camp.times || []).slice();
    times.sort(function (a, b) { return b.p - a.p || (b.gp - b.gc) - (a.gp - a.gc); });

    // Ordenar artilheiros
    var artilheiros = (camp.artilheiros || []).slice();
    artilheiros.sort(function (a, b) { return b.gols - a.gols; });

    // Resultados
    var resultados = (camp.resultados || []).slice();
    resultados.sort(function (a, b) { return (b.data || "").localeCompare(a.data || ""); });

    var html = '';

    // HEADER DO CAMPEONATO
    html += '<div class="card-panel" style="margin-bottom:24px;">';
    html += '<div class="card-panel-header"><h3>' + esporteNome + ' - ' + esc(camp.nome) + '</h3><span class="badge">' + esc(camp.ano) + '</span></div>';
    if (isAdmin()) {
        html += '<button class="btn btn-danger" onclick="deletarCampeonato(\'' + camp.id + '\')" style="font-size:0.75rem;padding:4px 12px;">Excluir Campeonato</button>';
    }
    html += '</div>';

    // TABELA DE CLASSIFICACAO
    html += '<div class="card-panel" style="margin-bottom:24px;">';
    html += '<div class="card-panel-header"><h3>Classificacao</h3></div>';
    if (times.length === 0) {
        html += '<div class="empty-state"><div class="empty-state-icon">&#9917;</div><div class="empty-state-text">Nenhum time cadastrado.' + (isAdmin() ? ' Adicione times abaixo.' : '') + '</div></div>';
    } else {
        html += '<div class="table-responsive"><table class="standings-table"><thead><tr><th>#</th><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th>';
        if (isAdmin()) html += '<th>Acoes</th>';
        html += '</tr></thead><tbody>';
        times.forEach(function (t, i) {
            var sg = t.gp - t.gc;
            html += '<tr><td>' + (i + 1) + '</td><td>' + esc(t.nome) + '</td><td><strong>' + t.p + '</strong></td><td>' + t.j + '</td><td>' + t.v + '</td><td>' + t.e + '</td><td>' + t.d + '</td><td>' + t.gp + '</td><td>' + t.gc + '</td><td>' + (sg > 0 ? "+" : "") + sg + '</td>';
            if (isAdmin()) {
                html += '<td><button onclick="editarTimeClassificacao(\'' + t.id + '\')" style="font-size:0.7rem;padding:2px 6px;border:1px solid #cbd5e1;border-radius:3px;background:#fff;cursor:pointer;">Editar</button> <button onclick="removerTime(\'' + t.id + '\')" style="font-size:0.7rem;padding:2px 6px;border:1px solid #fca5a5;border-radius:3px;background:#fff;color:#dc2626;cursor:pointer;">X</button></td>';
            }
            html += '</tr>';
        });
        html += '</tbody></table></div>';
    }
    // Admin: adicionar time
    if (isAdmin()) {
        html += '<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">';
        html += '<input type="text" id="novoTimeNome" placeholder="Nome do time" style="flex:1;min-width:200px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.85rem;">';
        html += '<button class="btn btn-secondary" onclick="adicionarTime()" style="padding:8px 16px;">+ Adicionar Time</button>';
        html += '</div>';
    }
    html += '</div>';

    // ARTILHEIROS
    html += '<div class="card-panel" style="margin-bottom:24px;">';
    html += '<div class="card-panel-header"><h3>Artilheiros</h3></div>';
    if (artilheiros.length === 0) {
        html += '<div class="empty-state"><div class="empty-state-icon">&#127942;</div><div class="empty-state-text">Nenhum artilheiro.' + (isAdmin() ? ' Adicione abaixo.' : '') + '</div></div>';
    } else {
        artilheiros.forEach(function (a, i) {
            var rankClass = i === 0 ? "gold" : (i === 1 ? "silver" : (i === 2 ? "bronze" : ""));
            var initials = a.nome.split(" ").map(function (w) { return w[0]; }).join("").substr(0, 2);
            html += '<div class="scorer-row"><span class="scorer-rank ' + rankClass + '">' + (i + 1) + '</span><div class="scorer-avatar">' + initials + '</div><div class="scorer-info"><div class="scorer-name">' + esc(a.nome) + '</div><div class="scorer-team">' + esc(a.time) + '</div></div><div class="scorer-goals">' + a.gols + '</div>';
            if (isAdmin()) {
                html += '<div style="display:flex;gap:4px;margin-left:8px;"><button onclick="editarArtilheiro(\'' + a.id + '\')" style="font-size:0.7rem;padding:2px 6px;border:1px solid #cbd5e1;border-radius:3px;background:#fff;cursor:pointer;">Editar</button><button onclick="removerArtilheiro(\'' + a.id + '\')" style="font-size:0.7rem;padding:2px 6px;border:1px solid #fca5a5;border-radius:3px;background:#fff;color:#dc2626;cursor:pointer;">X</button></div>';
            }
            html += '</div>';
        });
    }
    // Admin: adicionar artilheiro
    if (isAdmin()) {
        html += '<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">';
        html += '<input type="text" id="novoArtNome" placeholder="Nome do jogador" style="flex:1;min-width:150px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.85rem;">';
        html += '<input type="text" id="novoArtTime" placeholder="Time" style="width:150px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.85rem;">';
        html += '<input type="number" id="novoArtGols" placeholder="Gols" min="0" style="width:80px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.85rem;">';
        html += '<button class="btn btn-secondary" onclick="adicionarArtilheiro()" style="padding:8px 16px;">+ Artilheiro</button>';
        html += '</div>';
    }
    html += '</div>';

    // RESULTADOS
    html += '<div class="card-panel" style="margin-bottom:24px;">';
    html += '<div class="card-panel-header"><h3>Resultados</h3></div>';
    if (resultados.length === 0) {
        html += '<div class="empty-state"><div class="empty-state-icon">&#128203;</div><div class="empty-state-text">Nenhum resultado.' + (isAdmin() ? ' Registre abaixo.' : '') + '</div></div>';
    } else {
        html += '<div class="results-list">';
        resultados.forEach(function (r) {
            html += '<div class="result-card"><div class="result-team">' + esc(r.timeCasa) + '</div><div style="text-align:center;"><div class="result-score">' + r.placarCasa + ' x ' + r.placarFora + '</div><div class="result-meta">' + formatarData(r.data) + ' - ' + esc(r.local || "") + '</div></div><div class="result-team away">' + esc(r.timeFora) + '</div>';
            if (isAdmin()) {
                html += '<div class="result-card-actions"><button onclick="deletarResultado(\'' + r.id + '\')" title="Excluir">X</button></div>';
            }
            html += '</div>';
        });
        html += '</div>';
    }
    // Admin: registrar resultado
    if (isAdmin()) {
        html += '<div style="margin-top:16px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">';
        html += '<h4 style="margin-bottom:12px;font-size:0.9rem;color:#1e293b;">Registrar Resultado</h4>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">';
        html += '<input type="text" id="resTimeCasa" placeholder="Time casa" style="flex:1;min-width:120px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.85rem;">';
        html += '<input type="number" id="resPlacarCasa" placeholder="Gols" min="0" style="width:60px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.85rem;text-align:center;">';
        html += '<span style="font-weight:800;color:#94a3b8;">X</span>';
        html += '<input type="number" id="resPlacarFora" placeholder="Gols" min="0" style="width:60px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.85rem;text-align:center;">';
        html += '<input type="text" id="resTimeFora" placeholder="Time fora" style="flex:1;min-width:120px;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.85rem;">';
        html += '</div>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">';
        html += '<input type="date" id="resData" style="padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.85rem;">';
        html += '<input type="text" id="resLocal" placeholder="Local" style="flex:1;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.85rem;">';
        html += '<button class="btn btn-primary" onclick="salvarResultado()" style="padding:8px 16px;">Salvar</button>';
        html += '</div></div>';
    }
    html += '</div>';

    conteudo.innerHTML = html;
}

// --- TIMES ---
function adicionarTime() {
    var nome = document.getElementById("novoTimeNome").value.trim();
    if (!nome) return alert("Preencha o nome do time.");
    var camp = getCampAtivo();
    if (!camp) return;
    if (!camp.times) camp.times = [];
    camp.times.push({ id: gerarId(), nome: nome, p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 });
    salvarCampAtivo(camp);
    renderCampeonatoAtivo();
    renderHeroStats();
}

function editarTimeClassificacao(timeId) {
    var camp = getCampAtivo();
    if (!camp) return;
    var t = camp.times.find(function (x) { return x.id === timeId; });
    if (!t) return;
    var p = prompt("Pontos (" + t.nome + "):", t.p); if (p === null) return;
    var j = prompt("Jogos:", t.j); if (j === null) return;
    var v = prompt("Vitorias:", t.v); if (v === null) return;
    var e = prompt("Empates:", t.e); if (e === null) return;
    var d = prompt("Derrotas:", t.d); if (d === null) return;
    var gp = prompt("Gols Pro:", t.gp); if (gp === null) return;
    var gc = prompt("Gols Contra:", t.gc); if (gc === null) return;
    t.p = parseInt(p) || 0; t.j = parseInt(j) || 0; t.v = parseInt(v) || 0;
    t.e = parseInt(e) || 0; t.d = parseInt(d) || 0; t.gp = parseInt(gp) || 0; t.gc = parseInt(gc) || 0;
    salvarCampAtivo(camp);
    renderCampeonatoAtivo();
}

function removerTime(timeId) {
    if (!confirm("Remover este time?")) return;
    var camp = getCampAtivo();
    if (!camp) return;
    camp.times = camp.times.filter(function (t) { return t.id !== timeId; });
    salvarCampAtivo(camp);
    renderCampeonatoAtivo();
    renderHeroStats();
}

// --- ARTILHEIROS ---
function adicionarArtilheiro() {
    var nome = document.getElementById("novoArtNome").value.trim();
    var time = document.getElementById("novoArtTime").value.trim();
    var gols = parseInt(document.getElementById("novoArtGols").value) || 0;
    if (!nome) return alert("Preencha o nome do jogador.");
    var camp = getCampAtivo();
    if (!camp) return;
    if (!camp.artilheiros) camp.artilheiros = [];
    camp.artilheiros.push({ id: gerarId(), nome: nome, time: time, gols: gols });
    salvarCampAtivo(camp);
    renderCampeonatoAtivo();
}

function editarArtilheiro(artId) {
    var camp = getCampAtivo();
    if (!camp) return;
    var a = camp.artilheiros.find(function (x) { return x.id === artId; });
    if (!a) return;
    var gols = prompt("Gols de " + a.nome + ":", a.gols);
    if (gols === null) return;
    a.gols = parseInt(gols) || 0;
    salvarCampAtivo(camp);
    renderCampeonatoAtivo();
}

function removerArtilheiro(artId) {
    if (!confirm("Remover este artilheiro?")) return;
    var camp = getCampAtivo();
    if (!camp) return;
    camp.artilheiros = camp.artilheiros.filter(function (a) { return a.id !== artId; });
    salvarCampAtivo(camp);
    renderCampeonatoAtivo();
}

// --- RESULTADOS ---
function salvarResultado() {
    var timeCasa = document.getElementById("resTimeCasa").value.trim();
    var placarCasa = parseInt(document.getElementById("resPlacarCasa").value) || 0;
    var placarFora = parseInt(document.getElementById("resPlacarFora").value) || 0;
    var timeFora = document.getElementById("resTimeFora").value.trim();
    var data = document.getElementById("resData").value;
    var local = document.getElementById("resLocal").value.trim();
    if (!timeCasa || !timeFora) return alert("Preencha os dois times.");
    if (!data) return alert("Preencha a data.");
    var camp = getCampAtivo();
    if (!camp) return;
    if (!camp.resultados) camp.resultados = [];
    camp.resultados.push({ id: gerarId(), timeCasa: timeCasa, placarCasa: placarCasa, placarFora: placarFora, timeFora: timeFora, data: data, local: local });
    salvarCampAtivo(camp);
    renderCampeonatoAtivo();
    renderHeroStats();
    alert("Resultado salvo!");
}

function deletarResultado(resId) {
    if (!confirm("Excluir este resultado?")) return;
    var camp = getCampAtivo();
    if (!camp) return;
    camp.resultados = camp.resultados.filter(function (r) { return r.id !== resId; });
    salvarCampAtivo(camp);
    renderCampeonatoAtivo();
    renderHeroStats();
}

// ===== CALENDARIO =====
var _calMes = new Date().getMonth();
var _calAno = new Date().getFullYear();

function renderCalendario() {
    renderCalendarGrid();
    renderCalendarGames();
    renderEventos();
}

function mesCalendario(delta) {
    _calMes += delta;
    if (_calMes > 11) { _calMes = 0; _calAno++; }
    if (_calMes < 0) { _calMes = 11; _calAno--; }
    renderCalendario();
}

function renderCalendarGrid() {
    var grid = document.getElementById("calendarGrid");
    var monthLabel = document.getElementById("calendarMonth");
    if (!grid || !monthLabel) return;

    monthLabel.textContent = MESES_FULL[_calMes] + " " + _calAno;

    var jogos = getData("jogos");
    var jogosDates = {};
    jogos.forEach(function (j) {
        if (j.data) jogosDates[j.data] = true;
    });

    var hoje = new Date();
    var hojeStr = hoje.getFullYear() + "-" + String(hoje.getMonth() + 1).padStart(2, "0") + "-" + String(hoje.getDate()).padStart(2, "0");

    var primeiro = new Date(_calAno, _calMes, 1);
    var ultimoDia = new Date(_calAno, _calMes + 1, 0).getDate();
    var startDay = primeiro.getDay();

    grid.innerHTML = "";

    // Cabeçalho
    DIAS_SEMANA.forEach(function (d) {
        grid.innerHTML += '<div class="calendar-header">' + d + '</div>';
    });

    // Dias vazios
    for (var i = 0; i < startDay; i++) {
        grid.innerHTML += '<div class="calendar-day empty"></div>';
    }

    // Dias do mes
    for (var d = 1; d <= ultimoDia; d++) {
        var dateStr = _calAno + "-" + String(_calMes + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
        var classes = "calendar-day";
        if (dateStr === hojeStr) classes += " today";
        if (jogosDates[dateStr]) classes += " has-game";
        grid.innerHTML += '<div class="' + classes + '">' + d + '</div>';
    }
}

function renderCalendarGames() {
    var jogos = getData("jogos")
        .filter(function (j) {
            if (!j.data) return false;
            var d = new Date(j.data + "T12:00:00");
            return d.getMonth() === _calMes && d.getFullYear() === _calAno;
        })
        .sort(function (a, b) { return a.data.localeCompare(b.data); });

    var list = document.getElementById("calendarGamesList");
    if (!list) return;
    list.innerHTML = "";

    if (jogos.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\uD83D\uDCC5</div><div class="empty-state-text">Nenhum jogo neste mes.</div></div>';
        return;
    }

    jogos.forEach(function (j) {
        var dc = formatarDataCurta(j.data);
        var teams = j.timeCasa;
        if (j.timeFora) teams += " x " + j.timeFora;
        var esporte = ESPORTES.find(function (e) { return e.id === j.esporte; });

        list.innerHTML +=
            '<div class="game-card">' +
                '<div class="game-date">' +
                    '<div class="game-date-day">' + dc.dia + '</div>' +
                    '<div class="game-date-month">' + dc.mes + '</div>' +
                '</div>' +
                '<div class="game-info">' +
                    '<div class="game-teams">' + esc(teams) + '</div>' +
                    '<div class="game-meta">' + (j.hora || "") + ' - ' + esc(j.local || "") + '</div>' +
                '</div>' +
                '<span class="game-sport-badge">' + (esporte ? esporte.icon + " " + esporte.nome : "") + '</span>' +
                '<div class="result-card-actions">' +
                    '<button onclick="deletarJogo(\'' + j.id + '\')" title="Excluir">X</button>' +
                '</div>' +
            '</div>';
    });
}

function salvarJogo() {
    var esporte = document.getElementById("jogoEsporte").value;
    var timeCasa = document.getElementById("jogoTimeCasa").value.trim();
    var timeFora = document.getElementById("jogoTimeFora").value.trim();
    var data = document.getElementById("jogoData").value;
    var hora = document.getElementById("jogoHora").value;
    var local = document.getElementById("jogoLocal").value.trim();

    if (!timeCasa) return alert("Preencha o time/evento.");
    if (!data) return alert("Preencha a data.");

    var jogos = getData("jogos");
    jogos.push({ id: gerarId(), esporte: esporte, timeCasa: timeCasa, timeFora: timeFora, data: data, hora: hora, local: local });
    setData("jogos", jogos);

    document.getElementById("jogoTimeCasa").value = "";
    document.getElementById("jogoTimeFora").value = "";
    document.getElementById("jogoData").value = "";
    document.getElementById("jogoHora").value = "";
    document.getElementById("jogoLocal").value = "";
    document.getElementById("adminJogo").style.display = "none";

    renderCalendario();
    renderTicker();
    renderInicio();
    alert("Jogo agendado!");
}

function deletarJogo(id) {
    if (!confirm("Excluir este jogo?")) return;
    var jogos = getData("jogos").filter(function (j) { return j.id !== id; });
    setData("jogos", jogos);
    renderCalendario();
    renderInicio();
    renderTicker();
}

// ===== EVENTOS ESPORTIVOS =====
var TIPOS_EVENTO = {
    "corrida": "Corrida de Rua",
    "torneio": "Torneio",
    "premiacao": "Premiacao",
    "peneira": "Peneira",
    "inscricao": "Inscricoes",
    "outro": "Evento"
};

function renderEventos() {
    var eventos = getData("eventos").sort(function (a, b) { return a.data.localeCompare(b.data); });
    var hoje = new Date().toISOString().split("T")[0];
    var futuros = eventos.filter(function (e) { return e.data >= hoje; });

    var list = document.getElementById("eventsList");
    if (!list) return;
    list.innerHTML = "";

    if (futuros.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">&#127941;</div><div class="empty-state-text">Nenhum evento agendado.</div></div>';
        return;
    }

    futuros.forEach(function (ev) {
        var dt = formatarDataCurta(ev.data);
        var tipo = TIPOS_EVENTO[ev.tipo] || ev.tipo;
        var adminBtn = isAdmin()
            ? '<button class="btn btn-sm" style="margin-left:auto;font-size:0.7rem;" onclick="deletarEvento(\'' + ev.id + '\')">Excluir</button>'
            : '';

        list.innerHTML +=
            '<div class="game-card">' +
                '<div class="game-date-badge"><span class="game-day">' + dt.dia + '</span><span class="game-month">' + dt.mes + '</span></div>' +
                '<div class="game-info">' +
                    '<div class="game-teams">' + esc(ev.nome) + '</div>' +
                    '<div class="game-meta">' + (ev.hora || "") + ' - ' + esc(ev.local || "") + '</div>' +
                    (ev.descricao ? '<div class="game-meta" style="margin-top:4px;font-style:italic;">' + esc(ev.descricao).substring(0, 100) + '</div>' : '') +
                '</div>' +
                '<span class="game-sport-badge" style="font-size:0.7rem;">' + esc(tipo) + '</span>' +
                adminBtn +
            '</div>';
    });
}

function salvarEvento() {
    var nome = document.getElementById("eventoNome").value.trim();
    var descricao = document.getElementById("eventoDescricao").value.trim();
    var tipo = document.getElementById("eventoTipo").value;
    var data = document.getElementById("eventoData").value;
    var hora = document.getElementById("eventoHora").value;
    var local = document.getElementById("eventoLocal").value.trim();
    if (!nome || !data) return alert("Preencha nome e data do evento.");

    var eventos = getData("eventos");
    eventos.push({
        id: gerarId(),
        nome: nome,
        descricao: descricao,
        tipo: tipo,
        data: data,
        hora: hora,
        local: local
    });
    setData("eventos", eventos);

    document.getElementById("eventoNome").value = "";
    document.getElementById("eventoDescricao").value = "";
    document.getElementById("eventoData").value = "";
    document.getElementById("eventoHora").value = "";
    document.getElementById("eventoLocal").value = "";
    document.getElementById("adminEvento").style.display = "none";
    renderCalendario();
    alert("Evento criado!");
}

function deletarEvento(id) {
    if (!confirm("Excluir este evento?")) return;
    var eventos = getData("eventos").filter(function (e) { return e.id !== id; });
    setData("eventos", eventos);
    renderCalendario();
}

// ===== ATLETAS =====
function renderAtletas() {
    renderTimes();
    var atletas = getData("atletas");
    var grid = document.getElementById("athletesGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (atletas.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\uD83C\uDFC5</div><div class="empty-state-text">Nenhum atleta cadastrado.</div></div>';
        return;
    }

    atletas.forEach(function (a) {
        var esporte = ESPORTES.find(function (e) { return e.id === a.esporte; });
        var imgHtml = a.imagem
            ? '<img src="' + esc(a.imagem) + '" alt="' + esc(a.nome) + '">'
            : '\uD83C\uDFC3';

        grid.innerHTML +=
            '<div class="athlete-card">' +
                '<div class="athlete-card-img">' + imgHtml +
                    '<span class="athlete-card-sport">' + (esporte ? esporte.icon + " " + esporte.nome : esc(a.esporte)) + '</span>' +
                '</div>' +
                '<div class="athlete-card-body">' +
                    '<div class="athlete-card-name">' + esc(a.nome) + '</div>' +
                    '<div class="athlete-card-detail">' + esc(a.time) + ' - ' + esc(a.posicao) + '</div>' +
                    '<div class="athlete-card-bio">' + esc(a.bio) + '</div>' +
                    '<div class="athlete-card-actions">' +
                        '<button onclick="editarAtleta(\'' + a.id + '\')">Editar</button>' +
                        '<button onclick="deletarAtleta(\'' + a.id + '\')">Excluir</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
    });
}

function salvarAtleta() {
    var nome = document.getElementById("atletaNome").value.trim();
    var esporte = document.getElementById("atletaEsporte").value;
    var time = document.getElementById("atletaTime").value.trim();
    var posicao = document.getElementById("atletaPosicao").value.trim();
    var img = document.getElementById("atletaImg").value.trim();
    var bio = document.getElementById("atletaBio").value.trim();

    if (!nome) return alert("Preencha o nome.");

    var atletas = getData("atletas");
    atletas.push({ id: gerarId(), nome: nome, esporte: esporte, time: time, posicao: posicao, imagem: img, bio: bio });
    setData("atletas", atletas);

    document.getElementById("atletaNome").value = "";
    document.getElementById("atletaTime").value = "";
    document.getElementById("atletaPosicao").value = "";
    document.getElementById("atletaImg").value = "";
    document.getElementById("atletaBio").value = "";
    document.getElementById("adminAtleta").style.display = "none";

    renderAtletas();
    alert("Atleta salvo!");
}

function editarAtleta(id) {
    var atletas = getData("atletas");
    var a = atletas.find(function (x) { return x.id === id; });
    if (!a) return;

    var novoNome = prompt("Nome:", a.nome);
    if (novoNome === null) return;
    var novaBio = prompt("Bio:", a.bio);
    if (novaBio === null) return;

    a.nome = novoNome;
    a.bio = novaBio;
    setData("atletas", atletas);
    renderAtletas();
}

function deletarAtleta(id) {
    if (!confirm("Excluir este atleta?")) return;
    var atletas = getData("atletas").filter(function (a) { return a.id !== id; });
    setData("atletas", atletas);
    renderAtletas();
}

// ===== GALERIA =====
var _filtroGaleria = "todas";

function renderGaleria() {
    var fotos = getData("galeria").sort(function (a, b) { return (b.data || "").localeCompare(a.data || ""); });
    if (_filtroGaleria !== "todas") {
        fotos = fotos.filter(function (f) { return f.categoria === _filtroGaleria; });
    }

    var grid = document.getElementById("galleryGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (fotos.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\uD83D\uDCF7</div><div class="empty-state-text">Nenhuma foto na galeria. Adicione fotos dos jogos!</div></div>';
        return;
    }

    fotos.forEach(function (f) {
        grid.innerHTML +=
            '<div class="gallery-item" onclick="abrirLightbox(\'' + esc(f.url) + '\', \'' + esc(f.legenda) + '\')">' +
                '<img src="' + esc(f.url) + '" alt="' + esc(f.legenda) + '" loading="lazy">' +
                '<div class="gallery-item-overlay">' +
                    '<div class="gallery-item-caption">' + esc(f.legenda) + '</div>' +
                    '<div class="gallery-item-date">' + formatarData(f.data) + '</div>' +
                '</div>' +
                '<div class="gallery-item-actions">' +
                    '<button onclick="event.stopPropagation();deletarFoto(\'' + f.id + '\')" title="Excluir">X</button>' +
                '</div>' +
            '</div>';
    });
}

function filtrarGaleria(cat, btn) {
    _filtroGaleria = cat;
    document.querySelectorAll(".gallery-filters .chip").forEach(function (c) { c.classList.remove("active"); });
    if (btn) btn.classList.add("active");
    renderGaleria();
}

function salvarFoto() {
    var url = document.getElementById("fotoUrl").value.trim();
    var legenda = document.getElementById("fotoLegenda").value.trim();
    var cat = document.getElementById("fotoCategoria").value;
    var data = document.getElementById("fotoData").value;

    if (!url) return alert("Preencha a URL da imagem.");

    var fotos = getData("galeria");
    fotos.push({ id: gerarId(), url: url, legenda: legenda, categoria: cat, data: data || new Date().toISOString().split("T")[0] });
    setData("galeria", fotos);

    document.getElementById("fotoUrl").value = "";
    document.getElementById("fotoLegenda").value = "";
    document.getElementById("fotoData").value = "";
    document.getElementById("adminFoto").style.display = "none";

    renderGaleria();
    alert("Foto adicionada!");
}

function deletarFoto(id) {
    if (!confirm("Excluir esta foto?")) return;
    var fotos = getData("galeria").filter(function (f) { return f.id !== id; });
    setData("galeria", fotos);
    renderGaleria();
}

// ===== VIDEOS =====
var _filtroVideo = "todos";

function filtrarVideos(cat, btn) {
    _filtroVideo = cat;
    document.querySelectorAll("#secao-videos .chip").forEach(function (c) { c.classList.remove("active"); });
    if (btn) btn.classList.add("active");
    renderVideos();
}

function extrairYouTubeId(url) {
    var m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
}

function renderVideos() {
    var videos = getData("videos").sort(function (a, b) { return (b.data || "").localeCompare(a.data || ""); });
    if (_filtroVideo !== "todos") {
        videos = videos.filter(function (v) { return v.categoria === _filtroVideo; });
    }

    var grid = document.getElementById("videosGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (videos.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">&#127909;</div><div class="empty-state-text">Nenhum video cadastrado.' + (isAdmin() ? ' Clique em "+ Adicionar Video" acima.' : '') + '</div></div>';
        return;
    }

    videos.forEach(function (v) {
        var videoId = extrairYouTubeId(v.url);
        if (!videoId) return;
        grid.innerHTML +=
            '<div class="video-card" style="position:relative;">' +
                '<div class="video-card-embed">' +
                    '<iframe src="https://www.youtube.com/embed/' + esc(videoId) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>' +
                '</div>' +
                '<div class="video-card-info">' +
                    '<span class="video-card-title">' + esc(v.titulo || "") + '</span>' +
                    '<span class="video-card-meta">' + formatarData(v.data) + '</span>' +
                '</div>' +
                '<div class="video-card-actions">' +
                    '<button onclick="deletarVideo(\'' + v.id + '\')" title="Excluir">X</button>' +
                '</div>' +
            '</div>';
    });
}

function salvarVideo() {
    var url = document.getElementById("videoUrl").value.trim();
    var titulo = document.getElementById("videoTitulo").value.trim();
    var cat = document.getElementById("videoCategoria").value;
    var data = document.getElementById("videoData").value;

    if (!url) return alert("Cole o link do video do YouTube.");
    if (!extrairYouTubeId(url)) return alert("Link do YouTube invalido. Use o formato: https://www.youtube.com/watch?v=...");

    var videos = getData("videos");
    videos.push({ id: gerarId(), url: url, titulo: titulo, categoria: cat, data: data || new Date().toISOString().split("T")[0] });
    setData("videos", videos);

    document.getElementById("videoUrl").value = "";
    document.getElementById("videoTitulo").value = "";
    document.getElementById("videoData").value = "";
    document.getElementById("adminVideo").style.display = "none";

    renderVideos();
    alert("Video adicionado!");
}

function deletarVideo(id) {
    if (!confirm("Excluir este video?")) return;
    var videos = getData("videos").filter(function (v) { return v.id !== id; });
    setData("videos", videos);
    renderVideos();
}

// ===== LIGHTBOX =====
function abrirLightbox(url, caption) {
    var lb = document.getElementById("lightbox");
    document.getElementById("lightboxImg").src = url;
    document.getElementById("lightboxCaption").textContent = caption || "";
    lb.classList.add("active");
}

function fecharLightbox() {
    document.getElementById("lightbox").classList.remove("active");
}

function abrirLightboxUrl(url) {
    document.getElementById("lightboxImg").src = url;
    document.getElementById("lightboxCaption").textContent = "";
    document.getElementById("lightbox").classList.add("active");
}

// ===== NEWSLETTER =====
function inscreverNewsletter() {
    var email = document.getElementById("newsletterEmail").value.trim();
    var msg = document.getElementById("newsletterMsg");
    if (!email || email.indexOf("@") === -1) {
        msg.textContent = "Digite um e-mail valido.";
        msg.style.display = "block";
        msg.style.color = "#ef4444";
        return;
    }

    var inscritos = getData("newsletter") || [];
    if (inscritos.indexOf(email) !== -1) {
        msg.textContent = "Este e-mail ja esta cadastrado!";
        msg.style.display = "block";
        msg.style.color = "#d4a017";
        return;
    }

    inscritos.push(email);
    setData("newsletter", inscritos);
    document.getElementById("newsletterEmail").value = "";
    msg.textContent = "Inscricao realizada com sucesso!";
    msg.style.display = "block";
    msg.style.color = "#d4a017";
}

function renderNewsletterAdmin() {
    var container = document.getElementById("adminNewsletterList");
    if (!container) return;
    var inscritos = getData("newsletter") || [];
    if (inscritos.length === 0) {
        container.innerHTML = "Nenhum inscrito ainda.";
        return;
    }
    container.innerHTML = "<strong>" + inscritos.length + " inscritos:</strong><br>" + inscritos.join(", ");
}

function exportarNewsletter() {
    var inscritos = getData("newsletter") || [];
    if (inscritos.length === 0) return alert("Nenhum inscrito.");
    var blob = new Blob([inscritos.join("\n")], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "inscritos-newsletter.txt";
    a.click();
    URL.revokeObjectURL(url);
}

// ===== ADMIN TOGGLE =====
function toggleAdmin(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = el.style.display === "none" ? "block" : "none";
}

// ===== BACKUP / EXPORT / IMPORT =====
function exportarDados() {
    var data = {};
    var keys = ["noticias", "jogos", "atletas", "galeria", "videos", "patrocinadores", "campeonatos", "opinioes", "eventos", "enquetes", "conquistas", "resumos", "times"];
    keys.forEach(function (k) { data[k] = getData(k); });

    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "esporte-sao-pedro-backup-" + new Date().toISOString().split("T")[0] + ".json";
    a.click();
    URL.revokeObjectURL(url);
}

function importarDados(event) {
    var file = event.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var data = JSON.parse(e.target.result);
            Object.keys(data).forEach(function (k) {
                setData(k, data[k]);
            });
            alert("Dados importados com sucesso! Recarregando...");
            location.reload();
        } catch (err) {
            alert("Erro ao importar: " + err.message);
        }
    };
    reader.readAsText(file);
}

function limparDados() {
    if (!confirm("ATENCAO: Isso vai apagar TODOS os dados do portal. Deseja continuar?")) return;
    if (!confirm("Tem certeza? Esta acao nao pode ser desfeita.")) return;

    var keys = Object.keys(localStorage).filter(function (k) { return k.indexOf("esp_") === 0; });
    keys.forEach(function (k) { localStorage.removeItem(k); });
    alert("Dados limpos. Recarregando...");
    location.reload();
}

function atualizarStorageInfo() {
    var total = 0;
    Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf("esp_") === 0) {
            total += (localStorage.getItem(k) || "").length * 2;
        }
    });
    var el = document.getElementById("storageInfo");
    if (el) {
        var kb = (total / 1024).toFixed(1);
        el.textContent = "Dados armazenados: " + kb + " KB (limite recomendado: 5 MB)";
    }
}

// ===== SCROLL TO TOP =====
function initScrollTop() {
    var btn = document.getElementById("scrollTopBtn");
    window.addEventListener("scroll", function () {
        if (window.scrollY > 400) {
            btn.classList.add("visible");
        } else {
            btn.classList.remove("visible");
        }
    });
}

// ===== TRANSMISSAO AO VIVO =====
function getLive() {
    var cached = SupaDB.getCache()["live"];
    if (cached !== undefined) return cached;
    try { return JSON.parse(localStorage.getItem("esp_live") || "null"); }
    catch (e) { return null; }
}

function iniciarLive() {
    var url = document.getElementById("liveUrl").value.trim();
    var titulo = document.getElementById("liveTitulo").value.trim();
    if (!url) return alert("Cole o link da live.");

    var embedUrl = "";
    // YouTube Live
    var ytId = extrairYoutubeId(url);
    if (ytId) {
        embedUrl = "https://www.youtube.com/embed/" + ytId + "?autoplay=1";
    }
    // Twitch
    var twitchMatch = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
    if (twitchMatch) {
        embedUrl = "https://player.twitch.tv/?channel=" + twitchMatch[1] + "&parent=" + location.hostname;
    }

    if (!embedUrl) {
        embedUrl = url; // URL direta como fallback
    }

    var live = { url: embedUrl, titulo: titulo || "Transmissao ao Vivo", ativa: true };
    SupaDB.setItem("live", live);

    document.getElementById("liveUrl").value = "";
    document.getElementById("liveTitulo").value = "";
    atualizarLiveStatus();
    atualizarLiveNav();
    alert("Live iniciada! O botao AO VIVO aparecera no menu.");
}

function encerrarLive() {
    SupaDB.setItem("live", null);
    atualizarLiveStatus();
    atualizarLiveNav();
    alert("Live encerrada.");
}

function atualizarLiveStatus() {
    var el = document.getElementById("liveStatus");
    if (!el) return;
    var live = getLive();
    if (live && live.ativa) {
        el.textContent = "LIVE ATIVA: " + live.titulo;
        el.style.color = "#c41e3a";
        el.style.fontWeight = "700";
    } else {
        el.textContent = "Nenhuma live ativa.";
        el.style.color = "#64748b";
        el.style.fontWeight = "400";
    }
}

function atualizarLiveNav() {
    var btn = document.getElementById("navLive");
    if (!btn) return;
    var live = getLive();
    btn.style.display = (live && live.ativa) ? "inline-flex" : "none";
}

function abrirLive(e) {
    if (e) e.preventDefault();
    var live = getLive();
    if (!live || !live.ativa) return;

    var container = document.getElementById("liveContainer");
    container.innerHTML = '<iframe src="' + esc(live.url) + '" allowfullscreen allow="autoplay" style="width:100%;aspect-ratio:16/9;border:none;border-radius:8px;"></iframe>';
    document.getElementById("liveTitle").textContent = live.titulo;
    document.getElementById("liveModal").classList.add("active");
}

function fecharLiveModal() {
    document.getElementById("liveModal").classList.remove("active");
    document.getElementById("liveContainer").innerHTML = "";
}

// ===== PATROCINADORES =====
function getPatrocinadores() { return getData("patrocinadores"); }

function salvarPatrocinador() {
    var nome = document.getElementById("patroNome").value.trim();
    var logo = document.getElementById("patroLogo").value.trim();
    var site = document.getElementById("patroSite").value.trim();
    var plano = document.getElementById("patroPlano").value;
    if (!nome) return alert("Preencha o nome do patrocinador.");

    var lista = getPatrocinadores();
    lista.push({
        id: gerarId(),
        nome: nome,
        logo: logo,
        site: site,
        plano: plano,
        aprovado: false,
        data: new Date().toISOString().split("T")[0]
    });
    setData("patrocinadores", lista);

    document.getElementById("patroNome").value = "";
    document.getElementById("patroLogo").value = "";
    document.getElementById("patroSite").value = "";

    renderAdminPatrocinadores();
    renderPatrocinadoresPublico();
    alert("Patrocinador cadastrado! Aprove para que apareca no site.");
}

function aprovarPatrocinador(id) {
    var lista = getPatrocinadores();
    var p = lista.find(function (x) { return x.id === id; });
    if (p) {
        p.aprovado = !p.aprovado;
        setData("patrocinadores", lista);
        renderAdminPatrocinadores();
        renderPatrocinadoresPublico();
    }
}

function deletarPatrocinador(id) {
    if (!confirm("Excluir este patrocinador?")) return;
    var lista = getPatrocinadores().filter(function (p) { return p.id !== id; });
    setData("patrocinadores", lista);
    renderAdminPatrocinadores();
    renderPatrocinadoresPublico();
}

function renderAdminPatrocinadores() {
    var lista = getPatrocinadores();
    var container = document.getElementById("adminPatroList");
    if (!container) return;
    container.innerHTML = "";

    if (lista.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8;font-size:0.85rem;">Nenhum patrocinador cadastrado.</p>';
        return;
    }

    // Ordenar: ouro primeiro, depois prata, bronze
    var ordem = { ouro: 0, prata: 1, bronze: 2 };
    lista.sort(function (a, b) { return (ordem[a.plano] || 9) - (ordem[b.plano] || 9); });

    lista.forEach(function (p) {
        var logoHtml = p.logo ? '<img src="' + esc(p.logo) + '" alt="' + esc(p.nome) + '">' : '<div style="width:50px;height:35px;background:#e2e8f0;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:#94a3b8;">LOGO</div>';
        var statusClass = p.aprovado ? "aprovado" : "pendente";
        var statusText = p.aprovado ? "Aprovado" : "Pendente";
        var aprovarText = p.aprovado ? "Desaprovar" : "Aprovar";

        container.innerHTML +=
            '<div class="admin-patro-item">' +
                logoHtml +
                '<div class="admin-patro-info">' +
                    '<strong>' + esc(p.nome) + '</strong>' +
                    '<small>' + esc(p.plano).toUpperCase() + ' | ' + formatarData(p.data) + '</small>' +
                '</div>' +
                '<span class="admin-patro-status ' + statusClass + '">' + statusText + '</span>' +
                '<div class="admin-patro-actions">' +
                    '<button class="btn-aprovar" onclick="aprovarPatrocinador(\'' + p.id + '\')">' + aprovarText + '</button>' +
                    '<button class="btn-excluir" onclick="deletarPatrocinador(\'' + p.id + '\')">Excluir</button>' +
                '</div>' +
            '</div>';
    });
}

function renderPatrocinadoresPublico() {
    var lista = getPatrocinadores().filter(function (p) { return p.aprovado; });
    var grid = document.getElementById("sponsorsGrid");
    var bar = document.getElementById("sponsorsBar");
    if (!grid || !bar) return;
    grid.innerHTML = "";

    // Esconder faixa se nao tem patrocinadores aprovados
    if (lista.length === 0) {
        bar.style.display = "none";
        return;
    }
    bar.style.display = "block";

    // Ordenar: ouro primeiro
    var ordem = { ouro: 0, prata: 1, bronze: 2 };
    lista.sort(function (a, b) { return (ordem[a.plano] || 9) - (ordem[b.plano] || 9); });

    lista.forEach(function (p) {
        var href = p.site ? p.site : "#";
        var target = p.site ? ' target="_blank" rel="noopener"' : '';
        var logoHtml = p.logo
            ? '<img class="sponsor-logo" src="' + esc(p.logo) + '" alt="' + esc(p.nome) + '">'
            : '<span style="font-size:1.5rem;font-weight:800;color:var(--azul-medio);">' + esc(p.nome.substring(0, 3).toUpperCase()) + '</span>';

        grid.innerHTML +=
            '<a href="' + esc(href) + '"' + target + ' class="sponsor-item ' + esc(p.plano) + '">' +
                logoHtml +
                '<span class="sponsor-name">' + esc(p.nome) + '</span>' +
            '</a>';
    });
}
