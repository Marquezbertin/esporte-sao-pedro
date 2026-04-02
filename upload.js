// ===== CLOUDINARY UPLOAD =====
// Upload de imagens direto do navegador para o Cloudinary (25GB gratis)
// Sem servidor, sem backend. Admin seleciona foto, sobe automaticamente.

var CloudUpload = (function () {
    var CLOUD_NAME = "dndqfumvd";
    var UPLOAD_PRESET = "esporte_sp";
    var UPLOAD_URL = "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/image/upload";

    // Faz upload de um arquivo e retorna a URL publica
    function uploadFile(file, onProgress) {
        return new Promise(function (resolve, reject) {
            var formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);

            var xhr = new XMLHttpRequest();
            xhr.open("POST", UPLOAD_URL);

            xhr.upload.onprogress = function (e) {
                if (e.lengthComputable && onProgress) {
                    var pct = Math.round((e.loaded / e.total) * 100);
                    onProgress(pct);
                }
            };

            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        var res = JSON.parse(xhr.responseText);
                        resolve(res.secure_url);
                    } catch (e) {
                        reject(new Error("Erro ao processar resposta"));
                    }
                } else {
                    reject(new Error("Upload falhou: " + xhr.status));
                }
            };

            xhr.onerror = function () {
                reject(new Error("Erro de rede no upload"));
            };

            xhr.send(formData);
        });
    }

    // Cria um botao de upload que preenche um campo de URL automaticamente
    function criarBotaoUpload(targetInputId) {
        var wrapper = document.createElement("div");
        wrapper.className = "upload-wrapper";

        var fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.style.display = "none";
        fileInput.id = "upload_file_" + targetInputId;

        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-secondary upload-btn";
        btn.innerHTML = "&#128247; Escolher Foto";
        btn.onclick = function () { fileInput.click(); };

        var status = document.createElement("span");
        status.className = "upload-status";
        status.id = "upload_status_" + targetInputId;

        var preview = document.createElement("img");
        preview.className = "upload-preview";
        preview.id = "upload_preview_" + targetInputId;
        preview.style.display = "none";

        fileInput.onchange = function () {
            var file = fileInput.files[0];
            if (!file) return;

            // Validar tamanho (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert("Imagem muito grande! Maximo 10MB.");
                return;
            }

            status.textContent = "Enviando... 0%";
            status.style.color = "#d4a017";
            btn.disabled = true;

            uploadFile(file, function (pct) {
                status.textContent = "Enviando... " + pct + "%";
            }).then(function (url) {
                // Preencher o campo de URL
                var targetInput = document.getElementById(targetInputId);
                if (targetInput) targetInput.value = url;

                // Preview
                preview.src = url;
                preview.style.display = "block";

                status.textContent = "Foto enviada!";
                status.style.color = "#16a34a";
                btn.disabled = false;
            }).catch(function (err) {
                status.textContent = "Erro: " + err.message;
                status.style.color = "#dc2626";
                btn.disabled = false;
            });
        };

        wrapper.appendChild(fileInput);
        wrapper.appendChild(btn);
        wrapper.appendChild(status);
        wrapper.appendChild(preview);
        return wrapper;
    }

    // Inicializa botoes de upload em todos os campos marcados
    function init() {
        var campos = document.querySelectorAll("[data-upload-target]");
        campos.forEach(function (campo) {
            var targetId = campo.getAttribute("data-upload-target");
            var wrapper = criarBotaoUpload(targetId);
            campo.parentNode.insertBefore(wrapper, campo.nextSibling);
        });
    }

    return {
        uploadFile: uploadFile,
        criarBotaoUpload: criarBotaoUpload,
        init: init
    };
})();
