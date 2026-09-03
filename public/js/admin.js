const loginGate = document.getElementById('login-gate');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

let currentInquiriesData = [];

let activeAdminKey = sessionStorage.getItem('anmol_admin_key') || localStorage.getItem('anmol_admin_key') || '';

function getAdminKey() {
  return activeAdminKey;
}

function setAdminKey(key) {
  activeAdminKey = key || '';
  try {
    if (activeAdminKey) {
      sessionStorage.setItem('anmol_admin_key', activeAdminKey);
      localStorage.setItem('anmol_admin_key', activeAdminKey);
    } else {
      sessionStorage.removeItem('anmol_admin_key');
      localStorage.removeItem('anmol_admin_key');
    }
  } catch (e) {}
}

async function adminFetch(path, options = {}) {
  const headers = {
    'x-admin-key': getAdminKey(),
    ...(options.headers || {})
  };

  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) {
    setAdminKey('');
    showLogin('Session expired or invalid admin key. Please sign in again.');
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
  } else {
    loginError.classList.add('hidden');
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
  const inputKey = document.getElementById('admin-key-input').value.trim();

  if (!inputKey) {
    loginError.textContent = 'Please enter an admin key to sign in.';
    loginError.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: inputKey })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      setAdminKey(inputKey);
      loginError.classList.add('hidden');
      showDashboard();
    } else {
      loginError.textContent = data.error || 'Invalid secret admin key. Please try again.';
      loginError.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Login error:', err);
    loginError.textContent = 'Server connection error. Please ensure the server is running.';
    loginError.classList.remove('hidden');
  }
});

logoutBtn.addEventListener('click', () => {
  setAdminKey('');
  showLogin();
});

// Tab Navigation
window.switchTab = function(tabName) {
  ['contacts', 'analytics', 'visitors'].forEach(t => {
    const view = document.getElementById(`view-${t}`);
    const btn = document.getElementById(`tab-${t}`);
    if (t === tabName) {
      view.classList.remove('hidden');
      btn.classList.add('tab-active');
    } else {
      view.classList.add('hidden');
      btn.classList.remove('tab-active');
    }
  });
};

let currentVisitorLogsData = [];

function renderProgressBreakdown(containerId, dataMap, labelSuffix = 'Visits', gradientClass = 'from-blue-600 to-indigo-600') {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!dataMap || !Object.keys(dataMap).length) {
    container.innerHTML = '<div class="text-xs text-slate-400">No data recorded yet.</div>';
    return;
  }

  const entries = Object.entries(dataMap).sort((a, b) => b[1] - a[1]);
  const maxVal = Math.max(...entries.map(e => e[1]), 1);

  container.innerHTML = entries.map(([key, count]) => {
    const pct = Math.round((count / maxVal) * 100);
    return `
      <div>
        <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
          <span class="truncate max-w-[200px]" title="${key}">${key}</span>
          <span>${count} ${labelSuffix}</span>
        </div>
        <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r ${gradientClass} rounded-full" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function edgeStatusBadge(status = 200) {
  if (status === 201) return '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">201 CREATED</span>';
  if (status === 429) return '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">429 RATE LIMIT</span>';
  if (status === 401) return '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">401 AUTH</span>';
  if (status === 404) return '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300">404 NOT FOUND</span>';
  return '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">200 OK</span>';
}

function renderVisitorLogs(logs) {
  const visitorTbody = document.getElementById('visitor-logs-body');
  if (!visitorTbody) return;
  if (logs && logs.length) {
    visitorTbody.innerHTML = logs.map(v => `
      <tr class="hover:bg-slate-50 border-t border-slate-100">
        <td class="p-3 text-slate-500 whitespace-nowrap text-[11px]">${new Date(v.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
        <td class="p-3 font-semibold text-[#001e40]">${v.path}</td>
        <td class="p-3 whitespace-nowrap">${edgeStatusBadge(v.status || 200)}</td>
        <td class="p-3">
          <span class="inline-flex items-center gap-1 font-medium text-slate-700">
            📍 ${v.city || 'Kanpur'}, ${v.country || 'India'}
          </span>
        </td>
        <td class="p-3 text-slate-500 font-mono text-[11px]">${v.ip || '127.0.0.1'}</td>
        <td class="p-3 text-slate-500 max-w-[140px] truncate" title="${v.referrer}">${v.referrer}</td>
        <td class="p-3 text-slate-400 max-w-[180px] truncate" title="${v.user_agent}">${v.user_agent}</td>
      </tr>
    `).join('');
  } else {
    visitorTbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-slate-400">No matching edge visitor logs found.</td></tr>';
  }
}

// Load Stats & Visitor Logs
async function loadStats() {
  try {
    const stats = await adminFetch('/api/admin/stats');
    document.getElementById('stat-total').textContent = stats.totalInquiries || 0;
    document.getElementById('stat-new').textContent = stats.newInquiries || 0;
    document.getElementById('stat-quotes').textContent = stats.quoteRequests || 0;
    document.getElementById('stat-visitors').textContent = stats.totalVisitors || 0;

    // Render Product Demand Breakdown
    const topProductsEl = document.getElementById('top-products-container');
    if (topProductsEl) {
      if (!stats.topProducts || !stats.topProducts.length) {
        topProductsEl.innerHTML = '<div class="text-xs text-slate-400">No product demand data registered yet.</div>';
      } else {
        const maxCount = Math.max(...stats.topProducts.map(p => p.count), 1);
        topProductsEl.innerHTML = stats.topProducts.map(p => {
          const pct = Math.round((p.count / maxCount) * 100);
          return `
            <div>
              <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>${p.product_interest}</span>
                <span>${p.count} Inquiries</span>
              </div>
              <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-[#001e40] to-[#D4AF37] rounded-full" style="width: ${pct}%"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render Analytics Cards
    renderProgressBreakdown('top-pages-container', stats.pageViews, 'Views', 'from-indigo-600 to-purple-600');
    renderProgressBreakdown('top-cities-container', stats.cityViews, 'Visitors', 'from-emerald-600 to-teal-600');
    renderProgressBreakdown('top-referrers-container', stats.referrerViews, 'Visits', 'from-blue-600 to-cyan-600');

    // Store & Render Visitor Logs
    currentVisitorLogsData = stats.visitorLogs || [];
    renderVisitorLogs(currentVisitorLogsData);

  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

function statusBadge(status) {
  const colors = {
    new: 'bg-amber-100 text-amber-800 border-amber-300',
    contacted: 'bg-blue-100 text-blue-800 border-blue-300',
    closed: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  };
  return `<span class="px-2 py-0.5 rounded-full text-[11px] font-bold border ${colors[status] || 'bg-slate-100 text-slate-700'}">${status.toUpperCase()}</span>`;
}

async function updateStatus(id, newStatus) {
  try {
    await adminFetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    loadStats();
    loadInquiries();
  } catch (err) {
    alert('Failed to update status.');
  }
}

async function deleteInquiry(id) {
  if (!confirm('Are you sure you want to delete this customer contact record?')) return;
  try {
    await adminFetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
    loadStats();
    loadInquiries();
  } catch (err) {
    alert('Failed to delete inquiry.');
  }
}

async function loadInquiries() {
  const tbody = document.getElementById('inquiries-body');
  const status = document.getElementById('filter-status').value;
  const type = document.getElementById('filter-type').value;
  const q = document.getElementById('search-input').value.trim();

  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (type) params.set('type', type);
  if (q) params.set('q', q);

  try {
    const { inquiries } = await adminFetch(`/api/admin/inquiries?${params.toString()}`);
    currentInquiriesData = inquiries || [];

    if (!currentInquiriesData.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="p-8 text-center text-slate-400">No customer contacts match your filter.</td></tr>';
      return;
    }

    tbody.innerHTML = currentInquiriesData.map((inq) => {
      const cleanPhone = (inq.phone || '').replace(/[^0-9]/g, '');
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${inq.name}, thanking you for contacting Anmol Shine.`)}` : null;

      return `
        <tr class="border-t border-slate-100 hover:bg-slate-50/80 transition-colors align-top">
          <td class="p-3.5 whitespace-nowrap text-slate-500 text-xs">${new Date(inq.created_at).toLocaleDateString()}</td>
          <td class="p-3.5">
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${inq.type === 'quote' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}">
              ${inq.type}
            </span>
          </td>
          <td class="p-3.5">
            <div class="font-bold text-[#001e40]">${inq.name}</div>
            ${inq.company ? `<div class="text-xs text-slate-500 font-medium">${inq.company}</div>` : ''}
          </td>
          <td class="p-3.5">
            <div class="text-xs font-semibold text-slate-700">${inq.email}</div>
            ${inq.phone ? `<div class="text-xs text-slate-500">${inq.phone}</div>` : ''}
            
            <div class="flex items-center gap-1.5 mt-1.5">
              ${inq.phone ? `
                <a href="tel:${inq.phone}" class="bg-blue-50 text-blue-700 hover:bg-blue-100 p-1 rounded transition-colors" title="Call Customer">
                  <span class="material-symbols-outlined text-xs">call</span>
                </a>
              ` : ''}
              ${waLink ? `
                <a href="${waLink}" target="_blank" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 p-1 rounded transition-colors" title="WhatsApp Customer">
                  <span class="material-symbols-outlined text-xs">chat</span>
                </a>
              ` : ''}
              <a href="mailto:${inq.email}" class="bg-slate-100 text-slate-700 hover:bg-slate-200 p-1 rounded transition-colors" title="Email Customer">
                <span class="material-symbols-outlined text-xs">mail</span>
              </a>
            </div>
          </td>
          <td class="p-3.5">
            ${inq.product_interest ? `<span class="bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded text-xs font-bold">${inq.product_interest}</span>` : '<span class="text-slate-300">—</span>'}
          </td>
          <td class="p-3.5 max-w-[260px]">
            <p class="text-xs text-slate-700 line-clamp-2" title="${inq.message.replace(/"/g, '&quot;')}">${inq.message}</p>
          </td>
          <td class="p-3.5 whitespace-nowrap">
            <div class="flex flex-col gap-1">
              ${statusBadge(inq.status)}
              <select data-id="${inq.id}" class="status-select text-[11px] rounded border border-slate-300 px-1.5 py-0.5 bg-white">
                <option value="new" ${inq.status === 'new' ? 'selected' : ''}>New</option>
                <option value="contacted" ${inq.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                <option value="closed" ${inq.status === 'closed' ? 'selected' : ''}>Closed / Deal</option>
              </select>
            </div>
          </td>
          <td class="p-3.5 text-right whitespace-nowrap">
            <button onclick="deleteInquiry(${inq.id})" class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors" title="Delete Contact">
              <span class="material-symbols-outlined text-base">delete</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.status-select').forEach((select) => {
      select.addEventListener('change', (e) => updateStatus(e.target.dataset.id, e.target.value));
    });

  } catch (err) {
    console.error('Error loading inquiries:', err);
  }
}

// Add Contact Modal logic
const modal = document.getElementById('add-contact-modal');
document.getElementById('add-contact-btn').addEventListener('click', () => modal.classList.remove('hidden'));
document.getElementById('close-modal-btn').addEventListener('click', () => modal.classList.add('hidden'));

document.getElementById('add-contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const contactData = {
    name: document.getElementById('new-name').value.trim(),
    email: document.getElementById('new-email').value.trim(),
    phone: document.getElementById('new-phone').value.trim(),
    company: document.getElementById('new-company').value.trim(),
    type: document.getElementById('new-type').value,
    product_interest: document.getElementById('new-product').value.trim(),
    message: document.getElementById('new-message').value.trim() || 'Manual entry from Admin'
  };

  try {
    await adminFetch('/api/admin/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
    modal.classList.add('hidden');
    document.getElementById('add-contact-form').reset();
    loadStats();
    loadInquiries();
  } catch (err) {
    alert('Failed to add contact.');
  }
});

// Export to CSV
document.getElementById('export-csv-btn').addEventListener('click', () => {
  if (!currentInquiriesData.length) {
    alert('No customer contact records to export.');
    return;
  }

  const headers = ['ID', 'Date', 'Type', 'Name', 'Email', 'Phone', 'Company', 'Product Interest', 'Message', 'Status'];
  const rows = currentInquiriesData.map(i => [
    i.id,
    `"${new Date(i.created_at).toLocaleDateString()}"`,
    `"${i.type}"`,
    `"${(i.name || '').replace(/"/g, '""')}"`,
    `"${(i.email || '').replace(/"/g, '""')}"`,
    `"${(i.phone || '').replace(/"/g, '""')}"`,
    `"${(i.company || '').replace(/"/g, '""')}"`,
    `"${(i.product_interest || '').replace(/"/g, '""')}"`,
    `"${(i.message || '').replace(/"/g, '""')}"`,
    `"${i.status}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `anmol_shine_customers_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Event Listeners
document.getElementById('refresh-btn').addEventListener('click', () => { loadStats(); loadInquiries(); });
document.getElementById('filter-status').addEventListener('change', loadInquiries);
document.getElementById('filter-type').addEventListener('change', loadInquiries);

let searchTimeout;
document.getElementById('search-input').addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadInquiries, 300);
});

const visitorSearchInput = document.getElementById('visitor-search-input');
if (visitorSearchInput) {
  visitorSearchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      renderVisitorLogs(currentVisitorLogsData);
    } else {
      const filtered = currentVisitorLogsData.filter(v =>
        (v.path && v.path.toLowerCase().includes(q)) ||
        (v.city && v.city.toLowerCase().includes(q)) ||
        (v.ip && v.ip.toLowerCase().includes(q)) ||
        (v.referrer && v.referrer.toLowerCase().includes(q)) ||
        (v.country && v.country.toLowerCase().includes(q))
      );
      renderVisitorLogs(filtered);
    }
  });
}

// Auto Login check
async function checkAuthOnLoad() {
  if (!activeAdminKey) {
    showLogin();
    return;
  }
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: activeAdminKey })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showDashboard();
    } else {
      setAdminKey('');
      showLogin();
    }
  } catch (err) {
    // Fallback if offline/network error occurs
    showDashboard();
  }
}

checkAuthOnLoad();
