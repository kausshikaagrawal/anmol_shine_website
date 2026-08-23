// Simple session-scoped admin auth: the key is kept in sessionStorage so a page
// refresh doesn't force re-entry, but it clears when the tab closes. This is meant
// as a lightweight internal tool, not a full auth system — see README for notes
// on hardening this before exposing it beyond trusted staff.

const loginGate = document.getElementById('login-gate');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

function getAdminKey() {
  return sessionStorage.getItem('anmol_admin_key') || '';
}

async function adminFetch(path) {
  const res = await fetch(path, {
    headers: { 'x-admin-key': getAdminKey() }
  });
  if (res.status === 401) {
    sessionStorage.removeItem('anmol_admin_key');
    showLogin('Session expired or invalid key. Please sign in again.');
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function showLogin(message) {
  loginGate.classList.remove('hidden');
  dashboard.classList.add('hidden');
  if (message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
  }
}

function showDashboard() {
  loginGate.classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadStats();
  loadInquiries();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = document.getElementById('admin-key-input').value.trim();

  // Validate by hitting a cheap protected endpoint
  const res = await fetch('/api/admin/stats', { headers: { 'x-admin-key': key } });

  if (res.ok) {
    sessionStorage.setItem('anmol_admin_key', key);
    loginError.classList.add('hidden');
    showDashboard();
  } else {
    loginError.textContent = 'Incorrect admin key.';
    loginError.classList.remove('hidden');
  }
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('anmol_admin_key');
  showLogin();
});

async function loadStats() {
  try {
    const stats = await adminFetch('/api/admin/stats');
    document.getElementById('stat-total').textContent = stats.totalInquiries;
    document.getElementById('stat-new').textContent = stats.newInquiries;
    document.getElementById('stat-quotes').textContent = stats.quoteRequests;

    const topProductsEl = document.getElementById('top-products');
    if (!stats.topProducts.length) {
      topProductsEl.textContent = 'No product interest data yet.';
    } else {
      topProductsEl.innerHTML = stats.topProducts
        .map((p) => `<span class="bg-[#e5eeff] text-[#001e40] px-3 py-1 rounded-full">${p.product_interest} · ${p.count}</span>`)
        .join('');
    }
  } catch (err) {
    console.error(err);
  }
}

function statusBadge(status) {
  const colors = {
    new: 'bg-amber-100 text-amber-800',
    contacted: 'bg-blue-100 text-blue-800',
    closed: 'bg-slate-100 text-slate-600'
  };
  return `<span class="px-2 py-1 rounded-full text-xs font-medium ${colors[status] || ''}">${status}</span>`;
}

async function updateStatus(id, newStatus) {
  await fetch(`/api/admin/inquiries/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': getAdminKey()
    },
    body: JSON.stringify({ status: newStatus })
  });
  loadStats();
  loadInquiries();
}

async function loadInquiries() {
  const tbody = document.getElementById('inquiries-body');
  const status = document.getElementById('filter-status').value;
  const type = document.getElementById('filter-type').value;

  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (type) params.set('type', type);

  try {
    const { inquiries } = await adminFetch(`/api/admin/inquiries?${params.toString()}`);

    if (!inquiries.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-slate-400">No inquiries match these filters.</td></tr>';
      return;
    }

    tbody.innerHTML = inquiries.map((inq) => `
      <tr class="border-t border-slate-100 align-top">
        <td class="p-3 whitespace-nowrap text-slate-500">${new Date(inq.created_at).toLocaleDateString()}</td>
        <td class="p-3 capitalize">${inq.type}</td>
        <td class="p-3 font-medium">${inq.name}</td>
        <td class="p-3">
          <div>${inq.email}</div>
          ${inq.phone ? `<div class="text-slate-500">${inq.phone}</div>` : ''}
        </td>
        <td class="p-3">${inq.product_interest || '—'}</td>
        <td class="p-3 max-w-[240px] truncate" title="${inq.message.replace(/"/g, '&quot;')}">${inq.message}</td>
        <td class="p-3">
          <div class="flex flex-col gap-1">
            ${statusBadge(inq.status)}
            <select data-id="${inq.id}" class="status-select mt-1 text-xs rounded border border-slate-300 px-1 py-0.5">
              <option value="new" ${inq.status === 'new' ? 'selected' : ''}>New</option>
              <option value="contacted" ${inq.status === 'contacted' ? 'selected' : ''}>Contacted</option>
              <option value="closed" ${inq.status === 'closed' ? 'selected' : ''}>Closed</option>
            </select>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.status-select').forEach((select) => {
      select.addEventListener('change', (e) => updateStatus(e.target.dataset.id, e.target.value));
    });
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('refresh-btn').addEventListener('click', loadInquiries);
document.getElementById('filter-status').addEventListener('change', loadInquiries);
document.getElementById('filter-type').addEventListener('change', loadInquiries);

// Auto-login if a key is already stored for this session
if (getAdminKey()) {
  fetch('/api/admin/stats', { headers: { 'x-admin-key': getAdminKey() } })
    .then((res) => { if (res.ok) showDashboard(); });
}
