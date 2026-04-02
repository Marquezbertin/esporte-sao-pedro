// ===== ESPORTE SAO PEDRO - Portal Esportivo =====
// Dados locais com localStorage | Zero backend | GitHub Pages

// ===== UTILIDADES =====
function esc(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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

var MESES_FULL = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
var DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

// ===== STORAGE =====
function getData(key) {
    try { return JSON.parse(localStorage.getItem("esp_" + key) || "[]"); }
    catch (e) { return []; }
}

function setData(key, data) {
    localStorage.setItem("esp_" + key, JSON.stringify(data));
}

// ===== ESPORTES =====
var ESPORTES = [
    { id: "futebol", nome: "Futebol", icon: "\u26BD", cor: "#16a34a" },
    { id: "volei", nome: "Volei", icon: "\uD83C\uDFD0", cor: "#2563eb" },
    { id: "basquete", nome: "Basquete", icon: "\uD83C\uDFC0", cor: "#d97706" },
    { id: "corrida", nome: "Corrida", icon: "\uD83C\uDFC3", cor: "#db2777" },
    { id: "ciclismo", nome: "Ciclismo", icon: "\uD83D\uDEB4", cor: "#4f46e5" },
    { id: "artes-marciais", nome: "Artes Marciais", icon: "\uD83E\uDD4B", cor: "#dc2626" }
];

// ===== MODO ADMIN (senha para editor/jornalista) =====
var ADMIN_SENHA = "sp2026";
var _isAdmin = false;

function isAdmin() { return _isAdmin; }

function loginAdmin() {
    var senha = prompt("Digite a senha de administrador:");
    if (senha === ADMIN_SENHA) {
        _isAdmin = true;
        sessionStorage.setItem("esp_admin", "1");
        document.body.classList.add("admin-mode");
        alert("Modo administrador ativado! Agora voce pode publicar conteudo.");
        renderPaginaAtual();
    } else if (senha !== null) {
        alert("Senha incorreta.");
    }
}

function logoutAdmin() {
    _isAdmin = false;
    sessionStorage.removeItem("esp_admin");
    document.body.classList.remove("admin-mode");
    renderPaginaAtual();
}

function checkAdminSession() {
    if (sessionStorage.getItem("esp_admin") === "1") {
        _isAdmin = true;
        document.body.classList.add("admin-mode");
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

// ===== INICIALIZACAO =====
document.addEventListener("DOMContentLoaded", function () {
    checkAdminSession();
    atualizarData();
    renderTicker();
    renderSportsGrid();
    renderInicio();
    renderHeroStats();
    initScrollTop();
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
        case "sobre": atualizarStorageInfo(); break;
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
    var classificacao = getData("classificacao_futebol");
    var jogos = getData("jogos");
    var resultados = getData("resultados");
    var totalGols = 0;

    resultados.forEach(function (r) {
        totalGols += (parseInt(r.placarCasa) || 0) + (parseInt(r.placarFora) || 0);
    });

    var times = [];
    classificacao.forEach(function (c) {
        if (times.indexOf(c.time) === -1) times.push(c.time);
    });

    animateCounter("statTimes", times.length || 8);
    animateCounter("statJogos", jogos.length + resultados.length);
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
    renderProximosJogos();
    renderArtilheirosHome();
}

function renderNoticiasHome() {
    var noticias = getData("noticias").sort(function (a, b) { return b.data.localeCompare(a.data); }).slice(0, 3);
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

    var fonteHtml = n.fonte
        ? '<div class="news-card-fonte"><a href="' + esc(n.fonte) + '" target="_blank" rel="noopener" onclick="event.stopPropagation();">Ver fonte original &rarr;</a></div>'
        : '';

    var adminHtml = isAdmin()
        ? '<div class="news-card-actions admin-only">' +
                '<button onclick="event.stopPropagation();editarNoticia(\'' + n.id + '\')">Editar</button>' +
                '<button onclick="event.stopPropagation();deletarNoticia(\'' + n.id + '\')">Excluir</button>' +
            '</div>'
        : '';

    return '<div class="news-card">' +
        midiaHtml +
        '<div class="news-card-body">' +
            '<span class="news-card-cat ' + esc(n.categoria) + '">' + esc(n.categoria) + '</span>' +
            '<h3 class="news-card-title">' + esc(n.titulo) + '</h3>' +
            '<p class="news-card-excerpt">' + esc(n.corpo) + '</p>' +
            '<div class="news-card-date">' + formatarData(n.data) + '</div>' +
            fonteHtml +
            adminHtml +
        '</div></div>';
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
    var artilheiros = getData("artilheiros")
        .filter(function (a) { return a.esporte === "futebol"; })
        .sort(function (a, b) { return b.gols - a.gols; })
        .slice(0, 5);

    var container = document.getElementById("scorersTable");
    if (!container) return;
    container.innerHTML = "";

    if (artilheiros.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\u26BD</div><div class="empty-state-text">Nenhum artilheiro registrado.</div></div>';
        return;
    }

    artilheiros.forEach(function (a, i) {
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
    var noticias = getData("noticias").sort(function (a, b) { return b.data.localeCompare(a.data); });
    if (_filtroNoticia !== "todas") {
        noticias = noticias.filter(function (n) { return n.categoria === _filtroNoticia; });
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

function filtrarNoticias(cat, btn) {
    _filtroNoticia = cat;
    document.querySelectorAll(".news-filters .chip, #secao-noticias .chip").forEach(function (c) { c.classList.remove("active"); });
    if (btn) btn.classList.add("active");
    renderNoticias();
}

function salvarNoticia() {
    var titulo = document.getElementById("noticiaTitle").value.trim();
    var corpo = document.getElementById("noticiaBody").value.trim();
    var cat = document.getElementById("noticiaCategoria").value;
    var img = document.getElementById("noticiaImg").value.trim();
    var video = document.getElementById("noticiaVideo").value.trim();
    var fonte = document.getElementById("noticiaFonte").value.trim();
    if (!titulo) return alert("Preencha o titulo.");

    var noticias = getData("noticias");
    noticias.push({
        id: gerarId(),
        titulo: titulo,
        corpo: corpo,
        categoria: cat,
        imagem: img,
        video: video,
        fonte: fonte,
        data: new Date().toISOString().split("T")[0]
    });
    setData("noticias", noticias);

    document.getElementById("noticiaTitle").value = "";
    document.getElementById("noticiaBody").value = "";
    document.getElementById("noticiaImg").value = "";
    document.getElementById("noticiaVideo").value = "";
    document.getElementById("noticiaFonte").value = "";
    document.getElementById("adminNoticia").style.display = "none";

    renderNoticias();
    renderTicker();
    alert("Noticia publicada!");
}

function editarNoticia(id) {
    var noticias = getData("noticias");
    var n = noticias.find(function (x) { return x.id === id; });
    if (!n) return;

    var novoTitulo = prompt("Titulo:", n.titulo);
    if (novoTitulo === null) return;
    var novoCorpo = prompt("Texto:", n.corpo);
    if (novoCorpo === null) return;

    n.titulo = novoTitulo;
    n.corpo = novoCorpo;
    setData("noticias", noticias);
    renderNoticias();
    renderInicio();
    renderTicker();
}

function deletarNoticia(id) {
    if (!confirm("Excluir esta noticia?")) return;
    var noticias = getData("noticias").filter(function (n) { return n.id !== id; });
    setData("noticias", noticias);
    renderNoticias();
    renderInicio();
    renderTicker();
}

// ===== CAMPEONATOS =====
var _campTab = "futebol";

function renderCampeonatos(esporte) {
    if (esporte) _campTab = esporte;
    renderClassificacao();
    renderArtilheirosFull();
    renderResultados();
}

function selectCampTab(esporte, btn) {
    _campTab = esporte;
    document.querySelectorAll("#campTabs .tab").forEach(function (t) { t.classList.remove("active"); });
    if (btn) {
        btn.classList.add("active");
    } else {
        document.querySelectorAll("#campTabs .tab").forEach(function (t) {
            var onclick = t.getAttribute("onclick") || "";
            if (onclick.indexOf("'" + esporte + "'") !== -1) t.classList.add("active");
        });
    }
    renderCampeonatos(esporte);
}

function renderClassificacao() {
    var dados = getData("classificacao_" + _campTab);
    var tbody = document.getElementById("standingsBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#94a3b8;padding:30px;">Nenhuma classificacao registrada para ' + _campTab + '.</td></tr>';
        return;
    }

    dados.sort(function (a, b) { return b.p - a.p || (b.gp - b.gc) - (a.gp - a.gc); });

    dados.forEach(function (t, i) {
        var sg = t.gp - t.gc;
        tbody.innerHTML +=
            '<tr>' +
                '<td>' + (i + 1) + '</td>' +
                '<td>' + esc(t.time) + '</td>' +
                '<td><strong>' + t.p + '</strong></td>' +
                '<td>' + t.j + '</td>' +
                '<td>' + t.v + '</td>' +
                '<td>' + t.e + '</td>' +
                '<td>' + t.d + '</td>' +
                '<td>' + t.gp + '</td>' +
                '<td>' + t.gc + '</td>' +
                '<td>' + (sg > 0 ? "+" : "") + sg + '</td>' +
            '</tr>';
    });
}

function renderArtilheirosFull() {
    var artilheiros = getData("artilheiros")
        .filter(function (a) { return a.esporte === _campTab; })
        .sort(function (a, b) { return b.gols - a.gols; });

    var container = document.getElementById("scorersFull");
    if (!container) return;
    container.innerHTML = "";

    if (artilheiros.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\uD83C\uDFC6</div><div class="empty-state-text">Nenhum artilheiro registrado.</div></div>';
        return;
    }

    artilheiros.forEach(function (a, i) {
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

function renderResultados() {
    var resultados = getData("resultados")
        .filter(function (r) { return r.esporte === _campTab; })
        .sort(function (a, b) { return b.data.localeCompare(a.data); });

    var container = document.getElementById("resultsList");
    if (!container) return;
    container.innerHTML = "";

    if (resultados.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">\uD83D\uDCCB</div><div class="empty-state-text">Nenhum resultado registrado.</div></div>';
        return;
    }

    resultados.forEach(function (r) {
        container.innerHTML +=
            '<div class="result-card">' +
                '<div class="result-team">' + esc(r.timeCasa) + '</div>' +
                '<div style="text-align:center;">' +
                    '<div class="result-score">' + r.placarCasa + ' x ' + r.placarFora + '</div>' +
                    '<div class="result-meta">' + formatarData(r.data) + ' - ' + esc(r.local || "") + '</div>' +
                '</div>' +
                '<div class="result-team away">' + esc(r.timeFora) + '</div>' +
                '<div class="result-card-actions">' +
                    '<button onclick="deletarResultado(\'' + r.id + '\')" title="Excluir">X</button>' +
                '</div>' +
            '</div>';
    });
}

function salvarResultado() {
    var esporte = document.getElementById("resEsporte").value;
    var timeCasa = document.getElementById("resTimeCasa").value.trim();
    var placarCasa = parseInt(document.getElementById("resPlacarCasa").value) || 0;
    var placarFora = parseInt(document.getElementById("resPlacarFora").value) || 0;
    var timeFora = document.getElementById("resTimeFora").value.trim();
    var data = document.getElementById("resData").value;
    var local = document.getElementById("resLocal").value.trim();
    var artilheiros = document.getElementById("resArtilheiros").value.trim();

    if (!timeCasa || !timeFora) return alert("Preencha os times.");
    if (!data) return alert("Preencha a data.");

    var resultados = getData("resultados");
    resultados.push({ id: gerarId(), esporte: esporte, timeCasa: timeCasa, placarCasa: placarCasa, placarFora: placarFora, timeFora: timeFora, data: data, local: local, artilheiros: artilheiros });
    setData("resultados", resultados);

    document.getElementById("resTimeCasa").value = "";
    document.getElementById("resPlacarCasa").value = "";
    document.getElementById("resPlacarFora").value = "";
    document.getElementById("resTimeFora").value = "";
    document.getElementById("resData").value = "";
    document.getElementById("resLocal").value = "";
    document.getElementById("resArtilheiros").value = "";
    document.getElementById("adminResultado").style.display = "none";

    renderCampeonatos();
    renderHeroStats();
    alert("Resultado salvo!");
}

function deletarResultado(id) {
    if (!confirm("Excluir este resultado?")) return;
    var resultados = getData("resultados").filter(function (r) { return r.id !== id; });
    setData("resultados", resultados);
    renderCampeonatos();
    renderHeroStats();
}

// ===== CALENDARIO =====
var _calMes = new Date().getMonth();
var _calAno = new Date().getFullYear();

function renderCalendario() {
    renderCalendarGrid();
    renderCalendarGames();
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

// ===== ATLETAS =====
function renderAtletas() {
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

// ===== ADMIN TOGGLE =====
function toggleAdmin(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = el.style.display === "none" ? "block" : "none";
}

// ===== BACKUP / EXPORT / IMPORT =====
function exportarDados() {
    var data = {};
    var keys = ["noticias", "resultados", "jogos", "classificacao_futebol", "classificacao_volei", "classificacao_basquete", "artilheiros", "atletas", "galeria"];
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
