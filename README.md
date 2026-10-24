# Cia do Tapete — site 2026

Site estático: `index.html` + `assets/style.css` + `assets/main.js` + logo em `assets/`. Não precisa de build, Node nem chave de API.

## Ver no computador
```
python3 -m http.server 5178
```
Depois abra http://localhost:5178

## Publicar
Arraste a pasta inteira para Netlify Drop, Vercel ou Cloudflare Pages, ou suba no GitHub Pages.

## Onde mudar as coisas
- **WhatsApp**: `WHATSAPP` no topo de `assets/main.js`. As mensagens de cada botão ficam no atributo `data-wa` do HTML.
- **Meta Pixel**: no `<head>` do `index.html` (ID 473165407668656). Cada botão dispara `Lead` com o nome em `data-lead`.
- **Capacho do topo**: a trama foi montada a partir da foto real do capacho Aladdin Arguilas. `assets/vinyl-base.webp` é o capacho grafite, `vinyl-ink.webp` é a tinta creme e `vinyl-mask.webp` faz a tinta aparecer só nos fios. A frase padrão fica em `data-print-main` no `index.html`.
- **Origem dos leads**: se o link tiver `utm_source`/`utm_campaign` (ou `gclid`/`fbclid`), a mensagem do WhatsApp sai com "(Origem: ...)" no fim. Use links com UTM nos anúncios.
- **Logo**: `assets/logo.webp` (e `logo.png` como ícone). É só trocar o arquivo mantendo o nome.
- **Fotos**: as URLs estão direto no `index.html`.
- **Cores e fontes**: variáveis no topo de `assets/style.css`.

## Bibliotecas (CDN)
GSAP 3.13 (ScrollTrigger + SplitText) e Lenis 1.3.4. Sem elas o site continua funcionando, só fica sem animação.
Quem tem "reduzir movimento" ligado no sistema vê o site sem animações.
