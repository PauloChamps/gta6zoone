 (async () => {

  const form = document.querySelector('[data-global-search]');
  const results = document.querySelector('[data-search-results]');

  if (!form || !results) return;


  const root = document.documentElement.dataset.root || './';

  let data = [];


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
      'guias'
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


    data = sets.flat();


  } catch (error) {

    console.error('Erro ao carregar a pesquisa:', error);

    results.innerHTML = `
      <div class="empty-state">
        Não foi possível carregar o índice de pesquisa.
      </div>
    `;

  }


  /* =========================================================
     NORMALIZAR TEXTO

     Permite, por exemplo:
     Dre'Quan
     drequan
     Dre Quan
  ========================================================= */

  const normalize = text =>

    String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/['’\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleLowerCase('pt-BR');


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


    if (!query) {

      results.innerHTML = `
        <div class="empty-state">
          Digite um termo para pesquisar em todo o GTA6Zoone.
        </div>
      `;

      return;

    }


    const found = data.filter(item => {

      const searchable = normalize(`
        ${item.titulo}
        ${item.resumo}
        ${item.tipo}
        ${item.palavras || ''}
      `);

      return searchable.includes(query);

    });


    if (!found.length) {

      results.innerHTML = `
        <div class="empty-state">

          <strong>
            Nenhum resultado encontrado para "${rawQuery}".
          </strong>

          <p>
            Tente outro termo ou explore as categorias do GTA6Zoone.
          </p>

        </div>
      `;

      return;

    }


    /* =========================================================
       AGRUPAR POR TIPO
    ========================================================= */

    const groups = found.reduce((acc, item) => {

      const type = item.tipo || 'outros';

      if (!acc[type]) {
        acc[type] = [];
      }

      acc[type].push(item);

      return acc;

    }, {});


    /* =========================================================
       MOSTRAR RESULTADOS
    ========================================================= */

    results.innerHTML = Object.entries(groups)

      .map(([type, items]) => `

        <section class="section">

          <h2>
            ${type.toUpperCase()}
          </h2>

          <div class="grid grid-3">

            ${items.map(item => `

              <a
                class="card card-body"
                href="${root}${item.url}">

                <span class="eyebrow">
                  ${type}
                </span>

                <h3>
                  ${item.titulo}
                </h3>

                <p class="muted">
                  ${item.resumo}
                </p>

                <strong>
                  Ver página →
                </strong>

              </a>

            `).join('')}

          </div>

        </section>

      `)

      .join('');

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