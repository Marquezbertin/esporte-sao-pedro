// ===== SUPABASE INTEGRATION =====
// Dados salvos na nuvem - qualquer leitor ve o conteudo de qualquer dispositivo
// Admin escreve, leitor le. Tudo sincronizado.

var SupaDB = (function () {
    var SUPABASE_URL = "https://cyihlqyhefdwypkzvztj.supabase.co";
    var SUPABASE_KEY = "sb_publishable_uXyjtoOUiaTJgwd7-U1hZg_8HUxSqA7";
    var _cache = {};
    var _ready = false;

    // ===== API HELPERS =====
    function apiUrl(path) {
        return SUPABASE_URL + "/rest/v1/" + path;
    }

    function headers() {
        return {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        };
    }

    // ===== LEITURA (qualquer pessoa) =====
    function getItem(tipo) {
        // Retorna do cache primeiro (rapido)
        if (_cache[tipo] !== undefined) return Promise.resolve(_cache[tipo]);

        return fetch(apiUrl("portal_data?id=eq." + encodeURIComponent(tipo) + "&select=dados"), {
            method: "GET",
            headers: headers()
        }).then(function (res) {
            if (!res.ok) throw new Error("Erro ao ler: " + res.status);
            return res.json();
        }).then(function (rows) {
            if (rows.length > 0) {
                _cache[tipo] = rows[0].dados;
                return rows[0].dados;
            }
            return null;
        }).catch(function (err) {
            console.warn("SupaDB.getItem falhou para " + tipo + ":", err.message);
            // Fallback para localStorage
            try { return JSON.parse(localStorage.getItem("esp_" + tipo) || "null"); }
            catch (e) { return null; }
        });
    }

    // ===== ESCRITA (somente admin) =====
    function setItem(tipo, dados) {
        _cache[tipo] = dados;

        // Salvar tambem no localStorage como cache local
        try { localStorage.setItem("esp_" + tipo, JSON.stringify(dados)); } catch (e) {}

        // Upsert no Supabase
        return fetch(apiUrl("portal_data?id=eq." + encodeURIComponent(tipo)), {
            method: "GET",
            headers: headers()
        }).then(function (res) {
            return res.json();
        }).then(function (rows) {
            if (rows.length > 0) {
                // UPDATE
                return fetch(apiUrl("portal_data?id=eq." + encodeURIComponent(tipo)), {
                    method: "PATCH",
                    headers: headers(),
                    body: JSON.stringify({ dados: dados, atualizado_em: new Date().toISOString() })
                });
            } else {
                // INSERT
                return fetch(apiUrl("portal_data"), {
                    method: "POST",
                    headers: headers(),
                    body: JSON.stringify({ id: tipo, tipo: tipo, dados: dados, atualizado_em: new Date().toISOString() })
                });
            }
        }).then(function (res) {
            if (!res.ok) return res.text().then(function (t) { throw new Error(t); });
            return true;
        }).catch(function (err) {
            console.error("SupaDB.setItem falhou para " + tipo + ":", err.message);
            return false;
        });
    }

    // ===== REMOVER =====
    function removeItem(tipo) {
        delete _cache[tipo];
        localStorage.removeItem("esp_" + tipo);

        return fetch(apiUrl("portal_data?id=eq." + encodeURIComponent(tipo)), {
            method: "DELETE",
            headers: headers()
        }).catch(function (err) {
            console.warn("SupaDB.removeItem falhou:", err.message);
        });
    }

    // ===== CARREGAR TUDO (na inicializacao) =====
    function loadAll() {
        return fetch(apiUrl("portal_data?select=id,dados"), {
            method: "GET",
            headers: headers()
        }).then(function (res) {
            if (!res.ok) throw new Error("Erro: " + res.status);
            return res.json();
        }).then(function (rows) {
            rows.forEach(function (row) {
                _cache[row.id] = row.dados;
            });
            _ready = true;
            return true;
        }).catch(function (err) {
            console.warn("SupaDB.loadAll falhou, usando localStorage:", err.message);
            _ready = true;
            return false;
        });
    }

    function isReady() { return _ready; }
    function getCache() { return _cache; }

    return {
        getItem: getItem,
        setItem: setItem,
        removeItem: removeItem,
        loadAll: loadAll,
        isReady: isReady,
        getCache: getCache
    };
})();
