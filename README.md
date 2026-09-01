# GTA6Zoone — manutenção

O site publicado continua sendo HTML, CSS, JavaScript e JSON estáticos. Node é usado somente para gerar os arquivos durante a manutenção.

## Gerar o site

```bash
npm run build
```

Não há dependências externas. `node scripts/build.mjs` é equivalente.

## Onde editar

- `src/components/`: banner, header, menus, footer, navegação e breadcrumb.
- `src/templates/`: estrutura reutilizável de cada tipo de página.
- `src/data/`: conteúdo e configurações editoriais.
- `assets/images/`: imagens separadas por tipo.
- `assets/css/` e `assets/js/`: visual e comportamento compartilhados.

## Onde não editar

Não edite manualmente os HTML na raiz/rotas, `sitemap.xml` ou os índices de `assets/data/`. Eles são gerados; altere a fonte e execute o build.

## Adicionar notícia

Coloque a imagem em `assets/images/noticias/`, cadastre título, slug, resumo, conteúdo, imagem e demais campos em `src/data/noticias.json` e execute o build. A entrada gera card, página e índice de busca.

## Adicionar personagem

Coloque a imagem em `assets/images/personagens/`, adicione o objeto a `src/data/personagens.json` e execute o build.

## Adicionar veículo

Coloque a imagem em `assets/images/veiculos/`, adicione o objeto a `src/data/veiculos.json` e execute o build. Campos opcionais vazios não geram blocos.

## Imagens, galeria e YouTube

Use somente o nome do arquivo em `imagem`. Em `galeria`, use `['foto-1.webp','foto-2.webp']`. Em `youtube`, use o ID, uma URL `youtube.com/watch?v=...` ou `youtu.be/...`; vazio omite a seção.

## Publicação e 404

A saída permanece na raiz para preservar o GitHub Pages. A 404 usa caminhos absolutos do domínio final `https://gta6zoone.com.br`.
