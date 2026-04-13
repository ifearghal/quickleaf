const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const PORT = 8445;
const PASTES = '/tmp/pastes';
fs.mkdirSync(PASTES, { recursive: true });

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function renderShell(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #111715;
      --panel: #1a241f;
      --panel-2: #202d27;
      --text: #e8efe9;
      --muted: #a7b8ad;
      --accent: #9ed39b;
      --accent-2: #78b575;
      --border: #304238;
      --shadow: rgba(0, 0, 0, 0.28);
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(180deg, #0f1512 0%, #151d18 100%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .card {
      width: 100%;
      max-width: 860px;
      background: rgba(26, 36, 31, 0.96);
      border: 1px solid var(--border);
      border-radius: 18px;
      box-shadow: 0 20px 60px var(--shadow);
      overflow: hidden;
    }

    .header {
      padding: 28px 28px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }

    .leaf {
      font-size: 14px;
      color: var(--accent);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 8px;
      font-weight: 700;
    }

    h1 {
      margin: 0;
      font-size: clamp(28px, 4vw, 40px);
      line-height: 1.05;
    }

    .subtitle {
      margin: 10px 0 0;
      color: var(--muted);
      font-size: 16px;
    }

    .body {
      padding: 24px 28px 28px;
    }

    textarea {
      width: 100%;
      min-height: 320px;
      resize: vertical;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: var(--panel-2);
      color: var(--text);
      padding: 16px;
      font: 14px/1.5 "JetBrains Mono", "Fira Code", ui-monospace, monospace;
      outline: none;
    }

    textarea:focus {
      border-color: var(--accent-2);
      box-shadow: 0 0 0 3px rgba(120, 181, 117, 0.18);
    }

    .row {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      align-items: center;
      margin-top: 14px;
      flex-wrap: wrap;
    }

    .hint {
      color: var(--muted);
      font-size: 13px;
    }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    button, .button {
      appearance: none;
      border: 0;
      border-radius: 12px;
      background: linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%);
      color: #102014;
      padding: 11px 16px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(120, 181, 117, 0.18);
      transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease, background 120ms ease;
    }

    button:hover, .button:hover {
      filter: brightness(1.03);
    }

    button:active, .button:active {
      transform: translateY(1px);
      box-shadow: 0 3px 10px rgba(120, 181, 117, 0.16);
      filter: brightness(0.96);
    }

    .button.secondary {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
      box-shadow: none;
    }

    .copy-button.copied {
      background: linear-gradient(180deg, #c7ecb9 0%, #9ed39b 100%);
      box-shadow: 0 4px 12px rgba(120, 181, 117, 0.20);
    }

    .result-box {
      background: var(--panel-2);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 16px;
      margin: 18px 0;
    }

    code, pre {
      font-family: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
    }

    .url {
      word-break: break-all;
      color: var(--accent);
    }

    pre {
      margin: 0;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      line-height: 1.55;
    }

    .footer {
      margin-top: 22px;
      color: var(--muted);
      font-size: 13px;
    }

    .status {
      color: var(--accent);
      font-weight: 700;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <main class="card">
    <section class="header">
      <div class="leaf">🌿 Quickleaf</div>
      <h1>A leaf may travel farther than a hobbit expects.</h1>
      <p class="subtitle">Some leaves find their mark. Others are lost on the road.</p>
    </section>
    <section class="body">
      ${body}
      <div class="footer">Built by ShireWorks, for small useful things.</div>
    </section>
  </main>
</body>
</html>`;
}

function renderHome() {
  return renderShell('Quickleaf', `
    <form method="POST" action="/">
      <textarea name="content" placeholder="Drop a note, snippet, or clipping here..."></textarea>
      <div class="row">
        <div class="hint">Plain text only for now. Stored as a simple file on the server.</div>
        <div class="actions">
          <button type="submit">Share leaf</button>
        </div>
      </div>
    </form>
  `);
}

function renderCreated(origin, id) {
  const url = `${origin}/${id}`;
  return renderShell('Quickleaf • Shared', `
    <div class="status">Your leaf is ready.</div>
    <div class="result-box">
      <div class="hint">Share this link:</div>
      <p class="url" id="share-url">${escapeHtml(url)}</p>
    </div>
    <div class="actions">
      <button type="button" class="copy-button" onclick="copyShareUrl(this)">Copy link</button>
      <a class="button secondary" href="/${id}">Open leaf</a>
      <a class="button secondary" href="/">New leaf</a>
    </div>
    <script>
      async function copyShareUrl(button) {
        const text = document.getElementById('share-url').textContent;
        const original = button.textContent;
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const node = document.getElementById('share-url');
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(node);
          selection.removeAllRanges();
          selection.addRange(range);
          document.execCommand('copy');
          selection.removeAllRanges();
        }
        button.textContent = 'Copied!';
        button.classList.add('copied');
        setTimeout(() => {
          button.textContent = original;
          button.classList.remove('copied');
        }, 1400);
      }
    </script>
  `);
}

function renderPaste(id, content) {
  return renderShell(`Quickleaf • ${id}`, `
    <div class="status">Leaf ${escapeHtml(id)}</div>
    <div class="result-box">
      <pre>${escapeHtml(content)}</pre>
    </div>
    <div class="actions">
      <a class="button secondary" href="/">New leaf</a>
    </div>
  `);
}

function renderNotFound() {
  return renderShell('Quickleaf • Not found', `
    <div class="status">That leaf isn't here.</div>
    <p class="hint">It may have been mistyped, cleaned up, or never planted at all.</p>
    <div class="actions">
      <a class="button" href="/">Back to Quickleaf</a>
    </div>
  `);
}

http.createServer((req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const origin = `http://${host}`;
  const url = new URL(req.url, origin);

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderHome());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const id = randomUUID().slice(0, 8);
      fs.writeFileSync(path.join(PASTES, id + '.txt'), params.get('content') || '');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderCreated(origin, id));
    });
    return;
  }

  if (req.method === 'GET' && url.pathname.length > 1) {
    const id = url.pathname.slice(1);
    const file = path.join(PASTES, id + '.txt');
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderPaste(id, content));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderNotFound());
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(renderNotFound());
}).listen(PORT, '0.0.0.0', () => console.log('Quickleaf running on port ' + PORT));
