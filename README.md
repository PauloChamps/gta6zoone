# GTA6Zoone — manutenção do portal

O portal publicado continua sendo HTML, CSS, JavaScript e JSON estáticos. O Node é usado **somente durante a manutenção** para materializar as páginas na raiz, que é publicada pelo GitHub Pages.

## Como gerar o site

```bash
npm run build
```

O build não possui dependências externas e também pode ser executado com `node scripts/build.mjs`.

## Onde editar

- `src/components/`: banner, header, menus, footer, navegação e breadcrumb globais.
- `src/templates/`: estrutura de cada tipo de conteúdo.
- `src/data/`: textos, metadados e cadastros editoriais.
- `assets/css/` e `assets/js/`: aparência e comportamento compartilhados.
- `assets/images/`: imagens organizadas por tipo.

## Onde NÃO editar

Não edite manualmente `index.html`, os HTML dentro das rotas ou `sitemap.xml`: eles são gerados. Corrija a fonte correspondente e execute o build novamente.

## Como adicionar notícia

1. Coloque a imagem em `assets/images/noticias/nome-da-imagem.webp`.
2. Adicione um objeto em `src/data/noticias.json`, informando `titulo`, `slug`, `subtitulo`, `resumo`, `imagem`, `alt`, `categoria`, `status`, `data`, `autor` e `conteudo`.
3. Execute `npm run build`. A mesma entrada gera o card e `/noticias/slug/`.

## Como adicionar personagem

1. Coloque a imagem em `assets/images/personagens/nome.webp`.
2. Adicione o cadastro em `src/data/personagens.json`; use somente o nome do arquivo no campo `imagem`.
3. Execute `npm run build`. O card e a página `/personagens/slug/` serão gerados.

## Como adicionar veículo

1. Coloque a imagem em `assets/images/veiculos/nome.webp`.
2. Adicione o cadastro em `src/data/veiculos.json`. Campos vazios podem ser omitidos e não geram blocos vazios.
3. Execute `npm run build`.

## Como adicionar imagem e galeria

Use somente o nome do arquivo em `imagem`. Para galeria, informe `"galeria": ["foto-1.webp", "foto-2.webp"]`; o template resolve a pasta conforme o tipo e adiciona dimensões, lazy loading e recorte seguro.

## Como adicionar vídeo do YouTube

No campo `youtube`, cole um ID, uma URL `youtube.com/watch?v=...` ou uma URL `youtu.be/...`. O build extrai o ID e gera o iframe acessível. Campo vazio omite completamente a seção.

## Publicação e 404

A saída permanece na raiz para não mudar a configuração existente do GitHub Pages. A 404 usa caminhos absolutos do domínio final `https://gta6zoone.com.br`, priorizado conforme a especificação.
