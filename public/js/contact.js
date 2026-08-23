const form = document.getElementById('inquiry-form');
const productSelect = document.getElementById('product_interest');
const productField = document.getElementById('product-field');
const statusBox = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');
const submitLabel = document.getElementById('submit-label');

// Show/hide the product dropdown depending on inquiry type
function syncProductFieldVisibility() {
  const type = form.querySelector('input[name="type"]:checked').value;
  productField.style.display = type === 'quote' ? 'block' : 'none';
}
form.querySelectorAll('input[name="type"]').forEach((el) =>
  el.addEventListener('change', syncProductFieldVisibility)
);

// Populate the product dropdown from the backend, and preselect one if passed via ?product=
async function loadProductOptions() {
  const params = new URLSearchParams(window.location.search);
  const preselect = params.get('product') || '';

  try {
    const res = await fetch('/api/products');
    const { products } = await res.json();

    productSelect.innerHTML = '<option value="">Select a product (optional)</option>' +
      products.map((p) =>
        `<option value="${p.name}" ${p.name === preselect ? 'selected' : ''}>${p.name}</option>`
      ).join('') +
      `<option value="Other" ${preselect === 'Other' ? 'selected' : ''}>Other / Not sure</option>`;
  } catch (err) {
    console.error('Failed to load product list:', err);
    productSelect.innerHTML = '<option value="">Could not load product list</option>';
  }
}

function showStatus(message, type) {
  statusBox.textContent = message;
  statusBox.className = `text-sm rounded p-3 ${
    type === 'success'
      ? 'bg-green-50 text-green-800 border border-green-200'
      : 'bg-red-50 text-red-800 border border-red-200'
  }`;
  statusBox.classList.remove('hidden');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  submitBtn.disabled = true;
  submitLabel.textContent = 'Sending…';
  statusBox.classList.add('hidden');

  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      const firstError = data.errors?.[0]?.msg || data.error || 'Something went wrong. Please try again.';
      throw new Error(firstError);
    }

    showStatus(data.message, 'success');
    openThankYouModal(data.message);
    form.reset();
    syncProductFieldVisibility();
  } catch (err) {
    showStatus(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitLabel.textContent = 'Send request';
  }
});

// Modal Popup Handlers
const thankYouModal = document.getElementById('thank-you-modal');
const modalCard = document.getElementById('modal-card');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');

function openThankYouModal(msg) {
  if (msg && modalMessage) {
    modalMessage.innerHTML = `${msg}<br><br><span class="text-xs text-gray-500">Our team at <strong>Anmol Enterprises</strong> will get back to you shortly.</span>`;
  }
  if (thankYouModal && modalCard) {
    thankYouModal.classList.remove('opacity-0', 'pointer-events-none');
    modalCard.classList.remove('scale-95');
    modalCard.classList.add('scale-100');
  }
}

function closeThankYouModal() {
  if (thankYouModal && modalCard) {
    thankYouModal.classList.add('opacity-0', 'pointer-events-none');
    modalCard.classList.remove('scale-100');
    modalCard.classList.add('scale-95');
  }
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closeThankYouModal);
}
if (thankYouModal) {
  thankYouModal.addEventListener('click', (e) => {
    if (e.target === thankYouModal) closeThankYouModal();
  });
}

syncProductFieldVisibility();
loadProductOptions();

