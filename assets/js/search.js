(async () => {

  const form = document.querySelector('[data-global-search]');
  const results = document.querySelector('[data-search-results]');

  if (!form || !results) return;


  const root = document.documentElement.dataset.root || './';

  let data = [];


  /* =========================================================
     ESTADO VAZIO / MENSAGENS

     Usa textContent em vez de innerHTML para impedir que
     termos digitados pelo visitante sejam interpretados
     como HTML.
  ========================================================= */

  const showEmptyState = (title, message = '') => {

    const container = document.createElement('div');
    container.className = 'empty-state';

    if (title) {

      const strong = document.createElement('strong');
      strong.textContent = title;
      container.appendChild(strong);

    }

    if (message) {

      const paragraph = document.createElement('p');
      paragraph.textContent = message;
      container.appendChild(paragraph);

    }

    results.replaceChildren(container);

  };


  /* =========================================================
     CARREGAR ÍNDICES
  ========================================================= */

  try {

    const files = [
      'noticias',
      'personagens',
      'veiculos',
      'armas',
      'missoes',
      'locais',
      'guias',
      'paginas'
    ];


    const sets = await Promise.all(

      files.map(file =>

        fetch(`${root}assets/data/${file}.json`)
          .then(response => {

            if (!response.ok) {
              throw new Error(`Erro ao carregar ${file}.json`);
            }

            return response.json();

          })

      )

    );


    data = sets
      .flat()
      .filter(item => item && typeof item === 'object');


  } catch (error) {

    console.error('Erro ao carregar a pesquisa:', error);

    showEmptyState(
      'Não foi possível carregar o índice de pesquisa.'
    );

  }


  /* =========================================================
     NORMALIZAR TEXTO

     Exemplos que passam a ser equivalentes:
     Dre'Quan
     drequan
     Dre Quan

     Também ignora:
     - acentos
     - maiúsculas/minúsculas
     - hífens
     - apóstrofos
     - pontuação em geral
     - espaços extras
  ========================================================= */

  const normalize = text =>

    String(text ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();


  const compact = text =>
    normalize(text).replace(/\s+/g, '');


  /* =========================================================
     URL INTERNA

     Os índices do GTA6Zoone usam caminhos relativos internos.
     Este filtro evita que um valor inesperado nos JSONs seja
     usado como protocolo externo ou javascript:.
  ========================================================= */

  const internalUrl = value => {

    const path = String(value ?? '').trim();

    if (
      !path ||
      /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path)
    ) {
      return `${root}index.html`;
    }

    return `${root}${path.replace(/^\/+/, '')}`;

  };


  /* =========================================================
     MOSTRAR RESULTADOS

     Os conteúdos dos JSONs são inseridos com textContent.
     Assim, mesmo que algum texto contenha caracteres HTML,
     ele continua sendo tratado apenas como texto.
  ========================================================= */

  const renderResults = groups => {

    const fragment = document.createDocumentFragment();


    Object.entries(groups).forEach(([type, items]) => {

      const section = document.createElement('section');
      section.className = 'section';


      const heading = document.createElement('h2');
      heading.textContent = String(type).toUpperCase();
      section.appendChild(heading);


      const grid = document.createElement('div');
      grid.className = 'grid grid-3';


      items.forEach(item => {

        const link = document.createElement('a');
        link.className = 'card card-body';
        link.href = internalUrl(item.url);


        const eyebrow = document.createElement('span');
        eyebrow.className = 'eyebrow';
        eyebrow.textContent = type;


        const title = document.createElement('h3');
        title.textContent = String(item.titulo ?? '');


        const summary = document.createElement('p');
        summary.className = 'muted';
        summary.textContent = String(item.resumo ?? '');


        const action = document.createElement('strong');
        action.textContent = 'Ver página →';


        link.append(
          eyebrow,
          title,
          summary,
          action
        );

        grid.appendChild(link);

      });


      section.appendChild(grid);
      fragment.appendChild(section);

    });


    results.replaceChildren(fragment);

  };


  /* =========================================================
     PESQUISA
  ========================================================= */

  const run = () => {

    const rawQuery =
      new FormData(form)
        .get('q')
        ?.toString()
        .trim() || '';


    const query = normalize(rawQuery);
    const compactQuery = compact(rawQuery);


    if (!query) {

      showEmptyState(
        'Digite um termo para pesquisar em todo o GTA6Zoone.'
      );

      return;

    }


    const found = data.filter(item => {

      const searchable = normalize(`
        ${item.titulo ?? ''}
        ${item.resumo ?? ''}
        ${item.tipo ?? ''}
        ${item.palavras ?? ''}
      `);

      const compactSearchable = searchable.replace(/\s+/g, '');

      return (
        searchable.includes(query) ||
        compactSearchable.includes(compactQuery)
      );

    });


    if (!found.length) {

      showEmptyState(
        `Nenhum resultado encontrado para "${rawQuery}".`,
        'Tente outro termo ou explore as categorias do GTA6Zoone.'
      );

      return;

    }


    /* =========================================================
       AGRUPAR POR TIPO
    ========================================================= */

    const groups = found.reduce((acc, item) => {

      const type = String(item.tipo || 'outros');

      if (!acc[type]) {
        acc[type] = [];
      }

      acc[type].push(item);

      return acc;

    }, {});


    renderResults(groups);

  };


  /* =========================================================
     SUBMIT
  ========================================================= */

  form.addEventListener('submit', event => {

    event.preventDefault();

    run();

  });


  /* =========================================================
     QUERY STRING

     Exemplo:
     buscar/index.html?q=lucia
  ========================================================= */

  const queryFromUrl =
    new URLSearchParams(location.search).get('q');


  if (queryFromUrl) {

    form.elements.q.value = queryFromUrl;

    run();

  }


})();