(()=>{document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{const group=button.closest('[data-filter-group]')?.dataset.filterGroup||'default';document.querySelectorAll(`[data-filter-group="${group}"] [data-filter]`).forEach(b=>b.classList.remove('active'));button.classList.add('active');const value=button.dataset.filter;document.querySelectorAll(`[data-filter-item][data-filter-group="${group}"]`).forEach(item=>item.classList.toggle('hidden',value!=='all'&&!item.dataset.filterItem.split(' ').includes(value)))}));const checks=[...document.querySelectorAll('[data-checklist] input')];if(checks.length){const key='gta6zoone-progress';let saved=[];try{saved=JSON.parse(localStorage.getItem(key)||'[]')}catch{}checks.forEach((c,i)=>{c.checked=saved.includes(i);c.addEventListener('change',update)});function update(){const done=checks.map((c,i)=>c.checked?i:null).filter(i=>i!==null);localStorage.setItem(key,JSON.stringify(done));const pct=Math.round(done.length/checks.length*100);document.querySelector('[data-progress]').style.width=`${pct}%`;document.querySelector('[data-progress-text]').textContent=`${pct}% concluído (demonstração)`}update()}})();





/* =========================================================
   IMAGE LIGHTBOX / ZOOM
========================================================= */

(() => {

  const images = Array.from(
    document.querySelectorAll(".js-zoomable-image")
  );


  if (!images.length) {
    return;
  }


  /* =======================================================
     CRIAR LIGHTBOX
  ======================================================= */

  const lightbox = document.createElement("div");

  lightbox.className = "image-lightbox";

  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.setAttribute(
    "aria-label",
    "Visualização ampliada da imagem"
  );


  lightbox.innerHTML = `

    <button
      class="image-lightbox-close"
      type="button"
      aria-label="Fechar imagem">
      ×
    </button>


    <button
      class="image-lightbox-prev"
      type="button"
      aria-label="Imagem anterior">
      ‹
    </button>


    <img
      class="image-lightbox-image"
      src=""
      alt="">


    <button
      class="image-lightbox-next"
      type="button"
      aria-label="Próxima imagem">
      ›
    </button>


    <div class="image-lightbox-info">

      <span class="image-lightbox-caption"></span>

      <span class="image-lightbox-counter"></span>

    </div>

  `;


  document.body.appendChild(lightbox);


  /* =======================================================
     ELEMENTOS
  ======================================================= */

  const lightboxImage =
    lightbox.querySelector(".image-lightbox-image");

  const closeButton =
    lightbox.querySelector(".image-lightbox-close");

  const previousButton =
    lightbox.querySelector(".image-lightbox-prev");

  const nextButton =
    lightbox.querySelector(".image-lightbox-next");

  const caption =
    lightbox.querySelector(".image-lightbox-caption");

  const counter =
    lightbox.querySelector(".image-lightbox-counter");


  let currentIndex = 0;
  let lastFocusedElement = null;


  /* =======================================================
     ATUALIZAR IMAGEM
  ======================================================= */

  function updateLightbox() {

    const image = images[currentIndex];

    lightboxImage.src =
      image.currentSrc || image.src;

    lightboxImage.alt =
      image.alt || "";

    caption.textContent =
      image.alt || "";

    counter.textContent =
      `${currentIndex + 1} / ${images.length}`;


    const multipleImages =
      images.length > 1;


    previousButton.hidden =
      !multipleImages;

    nextButton.hidden =
      !multipleImages;

  }


  /* =======================================================
     ABRIR
  ======================================================= */

  function openLightbox(index) {

    currentIndex = index;

    lastFocusedElement =
      document.activeElement;


    updateLightbox();


    lightbox.classList.add("is-open");

    lightbox.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "lightbox-open"
    );


    closeButton.focus();

  }


  /* =======================================================
     FECHAR
  ======================================================= */

  function closeLightbox() {

    lightbox.classList.remove("is-open");

    lightbox.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "lightbox-open"
    );


    lightboxImage.src = "";


    if (
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {

      lastFocusedElement.focus();

    }

  }


  /* =======================================================
     NAVEGAR
  ======================================================= */

  function previousImage() {

    currentIndex =
      (
        currentIndex - 1 + images.length
      ) % images.length;

    updateLightbox();

  }


  function nextImage() {

    currentIndex =
      (
        currentIndex + 1
      ) % images.length;

    updateLightbox();

  }


  /* =======================================================
     IMAGENS DA PÁGINA
  ======================================================= */

  images.forEach((image, index) => {

    image.setAttribute(
      "tabindex",
      "0"
    );

    image.setAttribute(
      "role",
      "button"
    );


    if (!image.hasAttribute("aria-label")) {

      image.setAttribute(
        "aria-label",
        image.alt
          ? `Ampliar imagem: ${image.alt}`
          : "Ampliar imagem"
      );

    }


    image.addEventListener(
      "click",
      () => {

        openLightbox(index);

      }
    );


    image.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          openLightbox(index);

        }

      }
    );

  });


  /* =======================================================
     BOTÕES
  ======================================================= */

  closeButton.addEventListener(
    "click",
    closeLightbox
  );


  previousButton.addEventListener(
    "click",
    previousImage
  );


  nextButton.addEventListener(
    "click",
    nextImage
  );


  /* =======================================================
     CLIQUE FORA DA IMAGEM
  ======================================================= */

  lightbox.addEventListener(
    "click",
    event => {

      if (event.target === lightbox) {

        closeLightbox();

      }

    }
  );


  /* =======================================================
     TECLADO
  ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        !lightbox.classList.contains("is-open")
      ) {

        return;

      }


      if (event.key === "Escape") {

        closeLightbox();

      }


      if (event.key === "ArrowLeft") {

        previousImage();

      }


      if (event.key === "ArrowRight") {

        nextImage();

      }

    }
  );

})();




