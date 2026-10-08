# TechRequest

Protótipo de app mobile (PWA) para solicitar peças de computador e tecnologia: **Comprador → Solicitação → Vendedor → Proposta → Chat → Aceitação → Avaliação**.

## Tecnologias
HTML5, CSS3, JavaScript puro, PWA (manifest + service worker), LocalStorage.

## Estrutura
`index.html`, `manifest.json`, `service-worker.js`, `css/style.css`, `js/storage.js` (camada de dados, trocável por API/Firebase/Supabase), `js/data.js` (dados demo), `js/app.js` (telas e regras), `assets/icons/`.

## Como executar
O service worker exige http(s). Na pasta do projeto: `python3 -m http.server 8000` e abra `http://localhost:8000`.

## Contas de demonstração (senha `123456`)
- Comprador: **João Silva** — `joao@demo.com`
- Vendedor: **Tech Store** — `tech@demo.com`
Na tela de login há botões de acesso rápido; o botão **⇄** no topo alterna entre comprador e vendedor. Em *Perfil* é possível restaurar os dados demo.

## Como publicar no GitHub
```bash
git init
git add .
git commit -m "Primeiro commit"
git branch -M main
git remote add origin URL_DO_REPOSITORIO
git push -u origin main
```

## Como ativar o GitHub Pages
1. Abra o repositório; 2. **Settings**; 3. **Pages**; 4. *Deploy from a branch*; 5. Branch `main`; 6. Pasta `/ (root)`; 7. **Save**; 8. Acesse `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
Todos os caminhos são relativos (`./`), então funciona em subpasta. Ao alterar arquivos, aumente a versão `CACHE` em `service-worker.js`.

## Como instalar no celular
- **Android (Chrome):** menu ⋮ → *Instalar aplicativo* / *Adicionar à tela inicial*.
- **iPhone (Safari):** botão Compartilhar → *Adicionar à Tela de Início*.

## Limitações (protótipo)
Dados ficam só no navegador; autenticação é de demonstração (senhas em texto puro, **inseguro**); não há comunicação real entre dispositivos; o chat é local (use o botão *Simular resposta*). Para produção: backend + autenticação real; para chat em tempo real: WebSocket, Firebase ou Supabase.
