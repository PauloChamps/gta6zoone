export function breadcrumb(root, items) {
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${root}">Início</a>${items.map((item,index) => ` › ${index < items.length - 1 ? `<a href="${root}${item.slug}/">${item.label}</a>` : item.label}`).join('')}</nav>`;
}
