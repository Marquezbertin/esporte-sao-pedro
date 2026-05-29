interface ReqBody {
  url?: string;
  prompt?: string;
  apiKey?: string;
}

async function fetchUrlContent(url: string): Promise<string> {
  const isInstagram = /instagram\.com\/(p|reel|tv)\//i.test(url);

  if (isInstagram) {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    if (!resp.ok) {
      return `Instagram — erro HTTP ${resp.status}. Nao foi possivel obter o conteudo.`;
    }
    const html = await resp.text();

    let title = "";
    let description = "";
    let image = "";

    const titleMatch = html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    );
    if (titleMatch) title = decodeEntities(titleMatch[1]);

    const descMatch = html.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    );
    if (descMatch) description = decodeEntities(descMatch[1]);

    const imgMatch = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    );
    if (imgMatch) image = decodeEntities(imgMatch[1]);

    let result = "";
    if (title) result += title + "\n\n";
    if (description) result += description + "\n\n";
    if (image) result += "Imagem: " + image;

    return result.trim() || "Instagram — nao foi possivel extrair o conteudo.";
  }

  const resp = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    },
    redirect: "follow",
  });
  if (!resp.ok) {
    return `Erro HTTP ${resp.status} ao acessar ${url}`;
  }

  const html = await resp.text();

  let title = "";
  let text = "";

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) title = titleMatch[1].trim();

  const descMatch = html.match(
    /<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["']/i,
  );
  if (descMatch) text = decodeEntities(descMatch[1]);

  const ogTitleMatch = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
  );
  if (ogTitleMatch && !title) title = decodeEntities(ogTitleMatch[1]);

  let result = "";
  if (title) result += "Titulo: " + title + "\n\n";
  if (text) result += text + "\n\n";

  return result.trim() || "Nao foi possivel extrair conteudo desta URL.";
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCodePoint(parseInt(h, 16)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const model = "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (resp.status === 404) {
    return `ERRO: modelo '${model}' nao encontrado (deprecado).`;
  }
  if (resp.status === 429) {
    return "ERRO 429: Limite da API Gemini excedido. Aguarde 1 minuto.";
  }
  if (!resp.ok) {
    return `ERRO: Gemini retornou HTTP ${resp.status}.`;
  }

  const data = await resp.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
  return text;
}

Deno.serve(async (req: Request) => {
  const headers = { "Access-Control-Allow-Origin": "*" };
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const body: ReqBody = await req.json();

    if (body.url) {
      const content = await fetchUrlContent(body.url);
      return new Response(JSON.stringify({ content }), { headers });
    }

    if (body.prompt && body.apiKey) {
      const text = await callGemini(body.prompt, body.apiKey);
      return new Response(JSON.stringify({ text }), { headers });
    }

    return new Response(
      JSON.stringify({ error: "Envie {url} ou {prompt, apiKey}." }),
      { status: 400, headers },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro interno" }),
      { status: 500, headers },
    );
  }
});
