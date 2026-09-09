(async () => {

  const view = document.querySelector('.map-viewport');
  const canvas = document.querySelector('.map-canvas');

  if (!view || !canvas) return;


  const root =
    document.documentElement.dataset.root || './';

  const searchInput =
    document.querySelector('[data-map-search]');

  const filterButtons = [
    ...document.querySelectorAll('[data-map-category]')
  ];

  const filtersToggle =
    document.querySelector('[data-map-filters-toggle]');

  const filtersPanel =
    document.querySelector('.map-filters');

  const detail =
    document.querySelector('[data-map-detail]');


  /* =========================================================
     ESTADO DO MAPA
  ========================================================= */

  let scale = 1;
  let tx = 0;
  let ty = 0;

  let drag = false;

  let last = {
    x: 0,
    y: 0
  };

  let pinRecords = [];

  let selectedPinButton = null;

  const activeCategories = new Set();


  /* =========================================================
     NORMALIZAÇÃO

     Permite comparar:
     Colecionáveis
     colecionaveis

     Easter Eggs
     easter-eggs
     eastereggs
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
     CATEGORIAS

     Aceita singular ou plural no mapa.json.
  ========================================================= */

  const categoryAliases = new Map([

    ['local', 'locais'],
    ['locais', 'locais'],

    ['missao', 'missoes'],
    ['missoes', 'missoes'],

    ['veiculo', 'veiculos'],
    ['veiculos', 'veiculos'],

    ['arma', 'armas'],
    ['armas', 'armas'],

    ['loja', 'lojas'],
    ['lojas', 'lojas'],

    ['propriedade', 'propriedades'],
    ['propriedades', 'propriedades'],

    ['atividade', 'atividades'],
    ['atividades', 'atividades'],

    ['colecionavel', 'colecionaveis'],
    ['colecionaveis', 'colecionaveis'],

    ['easteregg', 'eastereggs'],
    ['eastereggs', 'eastereggs'],

    ['segredo', 'segredos'],
    ['segredos', 'segredos']

  ]);


  const categoryKey = value => {

    const key = compact(value);

    return categoryAliases.get(key) || key;

  };


  /* =========================================================
     TRANSFORMAÇÃO DO MAPA
  ========================================================= */

  const renderMap = () => {

    canvas.style.transform =
      `translate(${tx}px, ${ty}px) scale(${scale})`;

  };


  const zoom = amount => {

    scale = Math.min(
      3,
      Math.max(
        1,
        scale + amount
      )
    );


    if (scale === 1) {

      tx = 0;
      ty = 0;

    }


    renderMap();

  };


  /* =========================================================
     ZOOM
  ========================================================= */

  document
    .querySelector('[data-zoom-in]')
    ?.addEventListener(
      'click',
      () => zoom(.25)
    );


  document
    .querySelector('[data-zoom-out]')
    ?.addEventListener(
      'click',
      () => zoom(-.25)
    );


  document
    .querySelector('[data-map-reset]')
    ?.addEventListener(
      'click',
      () => {

        scale = 1;

        tx = 0;
        ty = 0;

        renderMap();

      }
    );


  view.addEventListener(
    'wheel',
    event => {

      event.preventDefault();

      zoom(
        event.deltaY < 0
          ? .15
          : -.15
      );

    },
    {
      passive: false
    }
  );


  /* =========================================================
     PAN / ARRASTAR
  ========================================================= */

  view.addEventListener(
    'pointerdown',
    event => {

      if (
        event.pointerType === 'mouse' &&
        event.button !== 0
      ) {
        return;
      }


      drag = true;

      last = {
        x: event.clientX,
        y: event.clientY
      };


      try {

        view.setPointerCapture(
          event.pointerId
        );

      } catch {}

    }
  );


  view.addEventListener(
    'pointermove',
    event => {

      if (
        !drag ||
        scale === 1
      ) {
        return;
      }


      tx +=
        event.clientX -
        last.x;

      ty +=
        event.clientY -
        last.y;


      last = {
        x: event.clientX,
        y: event.clientY
      };


      renderMap();

    }
  );


  const stopDragging = () => {
    drag = false;
  };


  view.addEventListener(
    'pointerup',
    stopDragging
  );

  view.addEventListener(
    'pointercancel',
    stopDragging
  );

  view.addEventListener(
    'lostpointercapture',
    stopDragging
  );


  /* =========================================================
     DETALHES

     Nada de innerHTML com dados do JSON.
     Todo conteúdo dinâmico usa textContent.
  ========================================================= */

  const showDetail = (
    badgeText,
    titleText,
    descriptionText
  ) => {

    if (!detail) return;


    const fragment =
      document.createDocumentFragment();


    const status =
      document.createElement('div');

    status.className =
      'map-detail-status';


    const badge =
      document.createElement('span');

    badge.className = 'badge';

    badge.textContent =
      badgeText || 'MAPA';


    status.appendChild(badge);


    const title =
      document.createElement('h2');

    title.textContent =
      titleText;


    const paragraph =
      document.createElement('p');

    paragraph.className =
      'muted';

    paragraph.textContent =
      descriptionText;


    fragment.append(
      status,
      title,
      paragraph
    );


    detail.replaceChildren(
      fragment
    );

  };


  const showPinDetail = pin => {

    const category =
      String(
        pin.categoria ||
        'MAPA'
      ).toUpperCase();


    showDetail(
      category,
      String(
        pin.nome ||
        'Marcador'
      ),
      String(
        pin.descricao ||
        'Sem descrição disponível.'
      )
    );

  };


  /* =========================================================
     PESQUISA + FILTROS
  ========================================================= */

  const applyFilters = () => {

    const rawQuery =
      searchInput?.value || '';


    const query =
      normalize(rawQuery);

    const compactQuery =
      compact(rawQuery);


    let visibleCount = 0;


    pinRecords.forEach(record => {

      const matchesCategory =

        activeCategories.size === 0 ||

        activeCategories.has(
          record.category
        );


      const matchesSearch =

        !query ||

        record.searchText.includes(
          query
        ) ||

        record.compactSearchText.includes(
          compactQuery
        );


      const visible =
        matchesCategory &&
        matchesSearch;


      record.button.hidden =
        !visible;


      if (visible) {
        visibleCount++;
      }

    });


    /* Marcador selecionado ficou escondido */

    if (
      selectedPinButton &&
      selectedPinButton.hidden
    ) {

      selectedPinButton = null;

    }


    /* Nenhum pin cadastrado */

    if (pinRecords.length === 0) {

      showDetail(
        'MAPA',
        'Marcadores em preparação',
        'Ainda não há marcadores cadastrados no mapa. Eles serão adicionados conforme as localizações puderem ser verificadas.'
      );

      return;

    }


    /* Há pins, mas nenhum corresponde */

    if (visibleCount === 0) {

      showDetail(
        'MAPA',
        'Nenhum marcador encontrado',
        'Nenhum marcador corresponde à pesquisa e aos filtros selecionados. Tente outro termo ou desative algum filtro.'
      );

      return;

    }


    /* Nenhum pin específico selecionado */

    if (!selectedPinButton) {

      const message =

        visibleCount === 1

          ? '1 marcador está disponível. Selecione o marcador no mapa para visualizar suas informações.'

          : `${visibleCount} marcadores estão disponíveis. Selecione um marcador no mapa para visualizar suas informações.`;


      showDetail(
        'MAPA',
        'Detalhes',
        message
      );

    }

  };


  /* =========================================================
     PESQUISA
  ========================================================= */

  searchInput?.addEventListener(
    'input',
    applyFilters
  );


  /* =========================================================
     FILTROS
  ========================================================= */

  filterButtons.forEach(button => {

    button.addEventListener(
      'click',
      () => {

        const category =
          categoryKey(
            button.dataset.mapCategory
          );


        if (!category) return;


        if (
          activeCategories.has(
            category
          )
        ) {

          activeCategories.delete(
            category
          );

          button.classList.remove(
            'is-active'
          );

          button.setAttribute(
            'aria-pressed',
            'false'
          );

        } else {

          activeCategories.add(
            category
          );

          button.classList.add(
            'is-active'
          );

          button.setAttribute(
            'aria-pressed',
            'true'
          );

        }


        selectedPinButton = null;

        applyFilters();

      }
    );

  });


  /* =========================================================
     ABRIR / FECHAR FILTROS
  ========================================================= */

  filtersToggle?.addEventListener(
    'click',
    () => {

      if (!filtersPanel) return;


      const opened =
        filtersPanel.classList.toggle(
          'open'
        );


      filtersToggle.setAttribute(
        'aria-expanded',
        String(opened)
      );

    }
  );


  /* =========================================================
     CARREGAR MAPA.JSON
  ========================================================= */

  try {

    const response = await fetch(
      `${root}assets/data/mapa.json`
    );


    if (!response.ok) {

      throw new Error(
        `Erro HTTP ${response.status}`
      );

    }


    const pins =
      await response.json();


    if (!Array.isArray(pins)) {

      throw new Error(
        'mapa.json precisa conter um array.'
      );

    }


    pins.forEach(pin => {

      if (
        !pin ||
        typeof pin !== 'object' ||
        !pin.nome ||
        pin.x == null ||
        pin.y == null
      ) {

        return;

      }


      const button =
        document.createElement(
          'button'
        );


      button.type = 'button';

      button.className =
        'map-pin';


      button.style.setProperty(
        '--x',
        String(pin.x)
      );


      button.style.setProperty(
        '--y',
        String(pin.y)
      );


      button.dataset.category =
        String(
          pin.categoria || ''
        );


      button.setAttribute(
        'aria-label',
        String(pin.nome)
      );


      const pinVisual =
        document.createElement(
          'span'
        );

      pinVisual.textContent =
        'Pin';


      button.appendChild(
        pinVisual
      );


      /* Não inicia o arrasto ao clicar num pin */

      button.addEventListener(
        'pointerdown',
        event => {

          event.stopPropagation();

        }
      );


      button.addEventListener(
        'click',
        event => {

          event.stopPropagation();

          selectedPinButton =
            button;

          showPinDetail(pin);

        }
      );


      const tags =

        Array.isArray(pin.tags)

          ? pin.tags.join(' ')

          : String(
              pin.tags || ''
            );


      const palavras =

        Array.isArray(pin.palavras)

          ? pin.palavras.join(' ')

          : String(
              pin.palavras || ''
            );


      const searchableSource = `
        ${pin.nome || ''}
        ${pin.descricao || ''}
        ${pin.categoria || ''}
        ${tags}
        ${palavras}
      `;


      pinRecords.push({

        pin,

        button,

        category:
          categoryKey(
            pin.categoria
          ),

        searchText:
          normalize(
            searchableSource
          ),

        compactSearchText:
          compact(
            searchableSource
          )

      });


      canvas.appendChild(
        button
      );

    });


    applyFilters();


  } catch (error) {

    console.error(
      'Erro ao carregar mapa.json:',
      error
    );


    showDetail(
      'MAPA',
      'Não foi possível carregar os marcadores',
      'O índice do mapa não pôde ser carregado. Tente novamente mais tarde.'
    );

  }


})();