// ===== STATE =====
let allCustomers = [];
let filteredCustomers = [];
let currentPage = 1;
const pageSize = 10;
let deleteTargetId = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadCustomers();
    setupSidebarToggle();
});

function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userRole').textContent = user.role || 'Staff';
        document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    }
}

// ===== LOAD CUSTOMERS =====
async function loadCustomers() {
    // const data = await API.get('/customers');
    allCustomers = [
        { id: 1, cus_name: 'John Doe',    type_c: 'Regular', registered_at: '2023-01-15', is_active: 1,
          loyalty: { card_num: 'LC-0001', points_balance: 1250, tier: 'Silver' } },
        { id: 2, cus_name: 'Jane Smith',  type_c: 'VIP',     registered_at: '2023-03-22', is_active: 1,
          loyalty: { card_num: 'LC-0002', points_balance: 8500, tier: 'Gold' } },
        { id: 3, cus_name: 'Bob Johnson', type_c: 'Regular', registered_at: '2023-06-10', is_active: 1,
          loyalty: { card_num: 'LC-0003', points_balance: 320,  tier: 'Basic' } },
        { id: 4, cus_name: 'Alice Brown', type_c: 'VIP',     registered_at: '2022-11-05', is_active: 1,
          loyalty: { card_num: 'LC-0004', points_balance: 22000, tier: 'Platinum' } },
        { id: 5, cus_name: 'Charlie Wilson', type_c: 'Regular', registered_at: '2024-01-02', is_active: 0,
          loyalty: null },
    ];

    filteredCustomers = [...allCustomers];
    updateCustomerStats();
    renderCustomerTable();
}

// ===== STATS =====
function updateCustomerStats() {
    document.getElementById('statTotal').textContent    = allCustomers.length;
    document.getElementById('statActive').textContent   = allCustomers.filter(c => c.is_active).length;
    document.getElementById('statVIP').textContent      = allCustomers.filter(c => c.type_c === 'VIP').length;
    document.getElementById('statLoyalty').textContent  = allCustomers.filter(c => c.loyalty).length;
}

// ===== FILTER =====
function filterCustomers() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const type   = document.getElementById('typeFilter').value;
    const status = document.getElementById('statusFilter').value;

    filteredCustomers = allCustomers.filter(c => {
        const matchSearch = c.cus_name.toLowerCase().includes(search);
        const matchType   = !type   || c.type_c === type;
        const matchStatus = status === '' || c.is_active == status;
        return matchSearch && matchType && matchStatus;
    });

    currentPage = 1;
    renderCustomerTable();
}

// ===== TIER BADGE =====
function getTierBadge(tier) {
    const map = {
        'Basic':    { class: 'badge-secondary', icon: 'fa-circle' },
        'Silver':   { class: 'badge-info',      icon: 'fa-medal' },
        'Gold':     { class: 'badge-warning',   icon: 'fa-star' },
        'Platinum': { class: 'badge-primary',   icon: 'fa-crown' },
    };
    const m = map[tier] || map['Basic'];
    return `<span class="badge ${m.class}"><i class="fas ${m.icon}"></i> ${tier}</span>`;
}

// ===== RENDER TABLE =====
function renderCustomerTable() {
    const start    = (currentPage - 1) * pageSize;
    const pageData = filteredCustomers.slice(start, start + pageSize);
    const tbody    = document.getElementById('customersTable');

    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:40px;color:var(--secondary)">
                    <i class="fas fa-users fa-2x"></i><br><br>No customers found
                </td>
            </tr>`;
        document.getElementById('paginationInfo').textContent = '';
        document.getElementById('paginationControls').innerHTML = '';
        return;
    }

    tbody.innerHTML = pageData.map(c => `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:38px;height:38px;background:var(--primary-light);
                        border-radius:50%;display:flex;align-items:center;
                        justify-content:center;font-weight:700;color:var(--primary);">
                        ${c.cus_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight:600;">${c.cus_name}</div>
                        <div style="font-size:11px;color:var(--secondary);">ID: #${c.id}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge ${c.type_c === 'VIP' ? 'badge-warning' : 'badge-secondary'}">
                    ${c.type_c === 'VIP' ? '<i class="fas fa-crown"></i> ' : ''}${c.type_c}
                </span>
            </td>
            <td>${formatDate(c.registered_at)}</td>
            <td>
                ${c.loyalty
                    ? `<code style="background:var(--light);padding:2px 8px;border-radius:4px;font-size:12px;">
                        ${c.loyalty.card_num}</code>`
                    : '<span style="color:var(--secondary);font-size:12px;">No card</span>'}
            </td>
            <td>
                ${c.loyalty
                    ? `<strong style="color:var(--primary);">
                        ${c.loyalty.points_balance.toLocaleString()} pts</strong>`
                    : '—'}
            </td>
            <td>${c.loyalty ? getTierBadge(c.loyalty.tier) : '—'}</td>
            <td>
                ${c.is_active
                    ? '<span class="badge badge-success">Active</span>'
                    : '<span class="badge badge-danger">Inactive</span>'}
            </td>
            <td>
                <div style="display:flex;gap:6px;">
                    <button class="btn btn-outline btn-sm" onclick="openEditModal(${c.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="viewLoyalty(${c.id})" title="Loyalty">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${c.id}, '${c.cus_name}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    document.getElementById('paginationInfo').textContent =
        `Showing ${start + 1}–${Math.min(start + pageSize, filteredCustomers.length)} of ${filteredCustomers.length} customers`;

    renderPagination();
}

// ===== PAGINATION =====
function renderPagination() {
    const totalPages = Math.ceil(filteredCustomers.length / pageSize);
    const ctrl = document.getElementById('paginationControls');
    ctrl.innerHTML = '';
    if (totalPages <= 1) return;

    const prev = document.createElement('button');
    prev.className = 'page-btn';
    prev.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prev.disabled = currentPage === 1;
    prev.onclick = () => { currentPage--; renderCustomerTable(); };
    ctrl.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => { currentPage = i; renderCustomerTable(); };
        ctrl.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-btn';
    next.innerHTML = '<i class="fas fa-chevron-right"></i>';
    next.disabled = currentPage === totalPages;
    next.onclick = () => { currentPage++; renderCustomerTable(); };
    ctrl.appendChild(next);
}

// ===== MODALS =====
function openAddModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus"></i> Add Customer';
    document.getElementById('customerForm').reset();
    document.getElementById('customerId').value = '';
    openModal('customerModal');
}

function openEditModal(id) {
    const c = allCustomers.find(x => x.id === id);
    if (!c) return;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Customer';
    document.getElementById('customerId').value  = c.id;
    document.getElementById('cusName').value     = c.cus_name;
    document.getElementById('cusType').value     = c.type_c;
    document.getElementById('cusStatus').value   = c.is_active;
    openModal('customerModal');
}

async function saveCustomer() {
    const id      = document.getElementById('customerId').value;
    const payload = {
        cus_name:  document.getElementById('cusName').value,
        type_c:    document.getElementById('cusType').value,
        is_active: parseInt(document.getElementById('cusStatus').value),
    };

    if (!payload.cus_name) { showToast('Customer name is required', 'warning'); return; }

    if (id) {
        // await API.put(`/customers/${id}`, payload);
        const idx = allCustomers.findIndex(c => c.id == id);
        allCustomers[idx] = { ...allCustomers[idx], ...payload };
        showToast('Customer updated successfully', 'success');
    } else {
        // await API.post('/customers', payload);
        allCustomers.unshift({
            id: Date.now(), ...payload,
            registered_at: new Date().toISOString().split('T')[0],
            loyalty: null
        });
        showToast('Customer added successfully', 'success');
    }

    filteredCustomers = [...allCustomers];
    updateCustomerStats();
    renderCustomerTable();
    closeModal('customerModal');
}

function openDeleteModal(id, name) {
    deleteTargetId = id;
    document.getElementById('deleteCustomerName').textContent = name;
    openModal('deleteModal');
}

async function confirmDelete() {
    // await API.delete(`/customers/${deleteTargetId}`);
    allCustomers      = allCustomers.filter(c => c.id !== deleteTargetId);
    filteredCustomers = filteredCustomers.filter(c => c.id !== deleteTargetId);
    updateCustomerStats();
    renderCustomerTable();
    closeModal('deleteModal');
    showToast('Customer deleted successfully', 'success');
}

function viewLoyalty(id) {
    const c = allCustomers.find(x => x.id === id);
    if (!c || !c.loyalty) {
        showToast('This customer has no loyalty card', 'info');
        return;
    }
    showToast(`${c.cus_name} — ${c.loyalty.tier} | ${c.loyalty.points_balance} pts`, 'info');
}

function exportCSV() {
    const headers = ['Name', 'Type', 'Registered', 'Loyalty Card', 'Points', 'Tier', 'Status'];
    const rows = filteredCustomers.map(c => [
        c.cus_name, c.type_c, c.registered_at,
        c.loyalty?.card_num || '',
        c.loyalty?.points_balance || 0,
        c.loyalty?.tier || '',
        c.is_active ? 'Active' : 'Inactive'
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'customers.csv'; a.click();
    showToast('Customers exported', 'success');
}

function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}