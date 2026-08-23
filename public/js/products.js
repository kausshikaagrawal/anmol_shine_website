// Fetches the product catalog from the backend and renders it into #products-container.
// This is what makes the homepage's "Flagship Products" section data-driven instead of
// hardcoded HTML — add/edit/remove a row in the products table and the site updates.

const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
     <rect width="100%" height="100%" fill="#e5eeff"/>
     <text x="50%" y="50%" font-family="sans-serif" font-size="14" fill="#43474f"
           text-anchor="middle" dominant-baseline="middle">Anmol Shine</text>
   </svg>`
);

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function productCardHtml(product) {
  return `
    <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20 flex flex-col group card-hover cursor-pointer">
      <div class="relative h-56 bg-slate-900/5 flex items-center justify-center overflow-hidden">
        <img alt="${escapeHtml(product.name)}"
             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
             src="${escapeHtml(product.image_url || FALLBACK_IMAGE)}"
             onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';">
        ${product.tag ? `<div class="absolute top-sm left-sm bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-md">${escapeHtml(product.tag)}</div>` : ''}
      </div>
      <div class="p-lg flex flex-col flex-grow gap-sm">
        <h3 class="font-headline-md text-headline-md text-primary font-bold line-clamp-2">${escapeHtml(product.name)}</h3>
        <p class="font-caption text-caption text-on-surface-variant flex-grow leading-relaxed">${escapeHtml(product.description)}</p>
        <a class="text-brand-gold font-label-md text-label-md flex items-center gap-xs mt-sm group-hover:text-[#B89A30] font-semibold"
           href="/contact.html?product=${encodeURIComponent(product.name)}">
          Request a quote
          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>
    </div>
  `;
}

async function loadProducts() {
  const container = document.getElementById('products-container');
  if (!container) return;

  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

    const { products } = await res.json();

    if (!products || products.length === 0) {
      container.innerHTML = `<div class="col-span-full text-center text-on-surface-variant font-body-md text-body-md py-xl">No products available right now.</div>`;
      return;
    }

    container.innerHTML = products.map(productCardHtml).join('');
  } catch (err) {
    console.error('Failed to load products:', err);
    container.innerHTML = `<div class="col-span-full text-center text-on-surface-variant font-body-md text-body-md py-xl">Couldn't load products right now. Please refresh the page.</div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);

function trackWhatsAppClick(product = 'General WhatsApp Inquiry') {
  try {
    fetch('/api/inquiries/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_interest: product, page: window.location.pathname })
    }).catch(() => {});
  } catch (e) {}
}

