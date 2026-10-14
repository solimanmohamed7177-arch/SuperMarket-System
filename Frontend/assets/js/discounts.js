// ===== STATE =====
let allDiscounts = [];
let filteredDiscounts = [];
let currentPage = 1;
const pageSize = 10;
let deleteTargetId = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadDiscounts();
    setDefaultDates();
    setupSidebarToggle();
});

function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
        document.getElementById('userName').textContent    = user.name;
        document.getElementById('userRole').textContent   = user.role || 'Staff';
        document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    }
}

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const next  = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    document.getElementById('discStartDate').value = today;
    document.getElementById('discEndDate').value   = next;
}

// ===== LOAD DISCOUNTS =====
async function loadDiscounts() {
    // const data = await API.get('/discounts');
    allDiscounts = [
        {
            id: 1,
            name:        'Summer Sale',
            description: '20% off all beverages',
            type:        'percentage',
            value:       20,
            buy_x:       null,
            get_y:       null,
            applies_to:  'category',
            min_purchase: 0,
            start_date:  '2024-01-01',
            end_date:    '2024-01-31',
            status:      'active',
        },
        {
            id: 2,
            name:        'New Year Fixed',
            description: '$5 off orders above $50',
            type:        'fixed',
            value:       5,
            buy_x:       null,
            get_y:       null,
            applies_to:  'all',
            min_purchase: 50,
            start_date:  '2024-01-01',
            end_date:    '2024-01-15',
            status:      'expired',
        },
        {
            id: 3,
            name:        'Buy 2 Get 1 Free',
            description: 'Buy 2 snacks get 1 free',
            type:        'buy_x_get_y',
            value:       0,
            buy_x:       2,
            get_y:       1,
            applies_to:  'category',
            min_purchase: 0,
            start_date:  '2024-01-10',
            end_date:    '2024-02-10',
            status:      'active',
        },
        {
            id: 4,
            name:        'VIP Customer 15%',
            description: '15% off for VIP customers',
            type:        'percentage',
            value:       15,
            buy_x:       null,
            get_y:       null,
            applies_to:  'customer_type',
            min_purchase: 0,
            start_date:  '2024-01-01',
            end_date:    '2024-12-31',
            status:      'active',
        },
        {
            id: 5,
            name:        'Dairy Deal',
            description: '10% off all dairy products',
            type:        'percentage',
            value:       10,
            buy_x:       null,
            get_y:       null,
            applies_to:  'category',
            min_purchase: 0,
            start_date:  '2024-01-15',
            end_date:    '2024-01-20',
            status:      'inactive',
        },
        {
            id: 6,
            name:        'Weekend Special',
            description: '$10 off orders above $100',
            type:        'fixed',
            value:       10,
            buy_x:       null,
            get_y:       null,
            applies_to:  'all',
            min_purchase: 100,
            start_date:  '2024-01-20',
            end_date:    '2024-01-22',
            status:      'active',
        },
    ];

    filteredDiscounts = [...allDiscounts];
    updateStats();
    renderTable();
}

// ===== STATS =====
function updateStats() {
    const today    = new Date().toISOString().split('T')[0];
    const soon     = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const active   = allDiscounts.filter(d => d.status === 'active').length;
    const expired  = allDiscounts.filter(d => d.status === 'expired').length;
    const expiring = allDiscounts.filter(d =>
        d.status === 'active' &&
        d.end_date &&
        d.end_date >= today &&
        d.end_date <= soon
    ).length;

    document.getElementById('statTotal').textContent    = allDiscounts.length;
    document.getElementById('statActive').textContent   = active;
    document.getElementById('statExpiring').textContent = expiring;
    document.getElementById('statExpired').textContent  = expired;
}

// ===== FILTER =====
function filterDiscounts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const type   = document.getElementById('typeFilter').value;
    const status = document.getElementById('statusFilter').value;

    filteredDiscounts = allDiscounts.filter(d => {
        const matchSearch =
            d.name.toLowerCase().includes(search) ||
            (d.description && d.description.toLowerCase().includes(search));
        const matchType   = !type   || d.type === type;
        const matchStatus = !status || d.status === status;
        return matchSearch && matchType && matchStatus;
    });

    currentPage = 1;
    renderTable();
}

// ===== RENDER TABLE =====
function renderTable() {
    const start    = (currentPage - 1) * pageSize;
    const pageData = filteredDiscounts.slice(start, start + pageSize);
    const tbody    = document.getElementById('discountsTable');

    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9"
                    style="text-align:center;padding:40px;color:var(--secondary)">
                    <i class="fas fa-percent fa-2x"></i><br><br>No discounts found
                </td>
            </tr>`;
        document.getElementById('paginationInfo').textContent = '';
        document.getElementById('paginationControls').innerHTML = '';
        return;
    }

    tbody.innerHTML = pageData.map(d => {
        // Type badge
        const typeMap = {
            percentage:  { label: 'Percentage',  class: 'badge-primary' },
            fixed:       { label: 'Fixed Amount', class: 'badge-info'    },
            buy_x_get_y: { label: 'Buy X Get Y',  class: 'badge-warning' },
        };
        const typeBadge = typeMap[d.type] || { label: d.type, class: 'badge-secondary' };

        // Value display
        let valueDisplay = '';
        if (d.type === 'percentage')  valueDisplay = `<strong style="color:var(--danger);font-size:16px;">${d.value}%</strong>`;
        if (d.type === 'fixed')       valueDisplay = `<strong style="color:var(--danger);font-size:16px;">-${formatCurrency(d.value)}</strong>`;
        if (d.type === 'buy_x_get_y') valueDisplay = `<strong style="color:var(--warning);">Buy ${d.buy_x} Get ${d.get_y}</strong>`;

        // Applies to badge
        const appliesToMap = {
            all:           { label: 'All Products',   class: 'badge-success'   },
            category:      { label: 'Category',       class: 'badge-info'      },
            product:       { label: 'Product',        class: 'badge-primary'   },
            customer_type: { label: 'Customer Type',  class: 'badge-warning'   },
        };
        const appBadge = appliesToMap[d.applies_to] || { label: d.applies_to, class: 'badge-secondary' };

        // Status badge
        const statusMap = {
            active:   'badge-success',
            inactive: 'badge-secondary',
            expired:  'badge-danger',
        };

        // Expiry warning
        const today = new Date().toISOString().split('T')[0];
        const soon  = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        const isExpiringSoon = d.status === 'active' && d.end_date && d.end_date >= today && d.end_date <= soon;

        return `
        <tr>
            <td>
                <div style="font-weight:700;">${d.name}</div>
                <div style="font-size:12px;color:var(--secondary);">
                    ${d.description || ''}
                </div>
                ${isExpiringSoon ? `
                <div style="font-size:11px;color:var(--warning);margin-top:3px;">
                    <i class="fas fa-exclamation-triangle"></i> Expiring soon
                </div>` : ''}
            </td>
            <td>
                <span class="badge ${typeBadge.class}">${typeBadge.label}</span>
            </td>
            <td>${valueDisplay}</td>
            <td>
                <span class="badge ${appBadge.class}">${appBadge.label}</span>
            </td>
            <td>
                ${d.min_purchase > 0
                    ? `<span style="color:var(--secondary);font-size:13px;">
                        Min: ${formatCurrency(d.min_purchase)}
                       </span>`
                    : '<span style="color:var(--secondary);font-size:12px;">No minimum</span>'}
            </td>
            <td style="font-size:12px;">${formatDate(d.start_date)}</td>
            <td style="font-size:12px;">
                ${d.end_date
                    ? `<span style="color:${isExpiringSoon ? 'var(--warning)' : 'inherit'};">
                        ${formatDate(d.end_date)}
                       </span>`
                    : '<span style="color:var(--secondary);">No expiry</span>'}
            </td>
            <td>
                <span class="badge ${statusMap[d.status] || 'badge-secondary'}">
                    ${d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                </span>
            </td>
            <td>
                <div style="display:flex;gap:6px;">
                    <button class="btn btn-outline btn-sm"
                        onclick="openEditModal(${d.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-${d.status === 'active' ? 'warning' : 'success'} btn-sm"
                        onclick="toggleStatus(${d.id})"
                        title="${d.status === 'active' ? 'Deactivate' : 'Activate'}">
                        <i class="fas fa-${d.status === 'active' ? 'pause' : 'play'}"></i>
                    </button>
                    <button class="btn btn-danger btn-sm"
                        onclick="openDeleteModal(${d.id},'${d.name}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');

    document.getElementById('paginationInfo').textContent =
        `Showing ${start + 1}–${Math.min(start + pageSize, filteredDiscounts.length)} ` +
        `of ${filteredDiscounts.length} discounts`;

    renderPagination();
}

// ===== PAGINATION =====
function renderPagination() {
    const totalPages = Math.ceil(filteredDiscounts.length / pageSize);
    const ctrl = document.getElementById('paginationControls');
    ctrl.innerHTML = '';
    if (totalPages <= 1) return;

    const prev = document.createElement('button');
    prev.className = 'page-btn';
    prev.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prev.disabled  = currentPage === 1;
    prev.onclick   = () => { currentPage--; renderTable(); };
    ctrl.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className   = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick     = () => { currentPage = i; renderTable(); };
        ctrl.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-btn';
    next.innerHTML = '<i class="fas fa-chevron-right"></i>';
    next.disabled  = currentPage === totalPages;
    next.onclick   = () => { currentPage++; renderTable(); };
    ctrl.appendChild(next);
}

// ===== TOGGLE DISCOUNT FIELDS =====
function toggleDiscountFields() {
    const type = document.getElementById('discType').value;

    const valueGroup = document.getElementById('discValueGroup');
    const buyXGroup  = document.getElementById('buyXGroup');
    const getYGroup  = document.getElementById('getYGroup');
    const valueLabel = document.getElementById('discValueLabel');

    if (type === 'percentage') {
        valueGroup.style.display = 'block';
        buyXGroup.style.display  = 'none';
        getYGroup.style.display  = 'none';
        valueLabel.textContent   = 'Discount Value (%) *';
        document.getElementById('discValue').placeholder = 'e.g. 20';
    } else if (type === 'fixed') {
        valueGroup.style.display = 'block';
        buyXGroup.style.display  = 'none';
        getYGroup.style.display  = 'none';
        valueLabel.textContent   = 'Discount Amount ($) *';
        document.getElementById('discValue').placeholder = 'e.g. 5.00';
    } else if (type === 'buy_x_get_y') {
        valueGroup.style.display = 'none';
        buyXGroup.style.display  = 'block';
        getYGroup.style.display  = 'block';
    }
}

// ===== ADD MODAL =====
function openAddModal() {
    document.getElementById('modalTitle').innerHTML =
        '<i class="fas fa-plus"></i> Add Discount';
    document.getElementById('discountId').value    = '';
    document.getElementById('discName').value      = '';
    document.getElementById('discDesc').value      = '';
    document.getElementById('discType').value      = 'percentage';
    document.getElementById('discValue').value     = '';
    document.getElementById('buyX').value          = '';
    document.getElementById('getY').value          = '';
    document.getElementById('discAppliesTo').value = 'all';
    document.getElementById('discMinPurchase').value = '0';
    document.getElementById('discStatus').value    = 'active';
    setDefaultDates();
    toggleDiscountFields();
    openModal('discountModal');
}

// ===== EDIT MODAL =====
function openEditModal(id) {
    const d = allDiscounts.find(x => x.id === id);
    if (!d) return;

    document.getElementById('modalTitle').innerHTML =
        '<i class="fas fa-edit"></i> Edit Discount';
    document.getElementById('discountId').value      = d.id;
    document.getElementById('discName').value        = d.name;
    document.getElementById('discDesc').value        = d.description || '';
    document.getElementById('discType').value        = d.type;
    document.getElementById('discValue').value       = d.value || '';
    document.getElementById('buyX').value            = d.buy_x || '';
    document.getElementById('getY').value            = d.get_y || '';
    document.getElementById('discAppliesTo').value   = d.applies_to;
    document.getElementById('discMinPurchase').value = d.min_purchase;
    document.getElementById('discStartDate').value   = d.start_date;
    document.getElementById('discEndDate').value     = d.end_date || '';
    document.getElementById('discStatus').value      = d.status;

    toggleDiscountFields();
    openModal('discountModal');
}

// ===== SAVE DISCOUNT =====
async function saveDiscount() {
    const id   = document.getElementById('discountId').value;
    const type = document.getElementById('discType').value;
    const name = document.getElementById('discName').value.trim();

    if (!name) { showToast('Discount name is required', 'warning'); return; }

    let value = parseFloat(document.getElementById('discValue').value) || 0;
    let buy_x = null;
    let get_y = null;

    if (type === 'percentage' && (value <= 0 || value > 100)) {
        showToast('Percentage must be between 1 and 100', 'warning');
        return;
    }
    if (type === 'fixed' && value <= 0) {
        showToast('Fixed amount must be greater than 0', 'warning');
        return;
    }
    if (type === 'buy_x_get_y') {
        buy_x = parseInt(document.getElementById('buyX').value) || 0;
        get_y = parseInt(document.getElementById('getY').value) || 0;
        value = 0;
        if (buy_x <= 0 || get_y <= 0) {
            showToast('Buy X and Get Y quantities must be greater than 0', 'warning');
            return;
        }
    }

    const payload = {
        name,
        description:  document.getElementById('discDesc').value.trim(),
        type,
        value,
        buy_x,
        get_y,
        applies_to:   document.getElementById('discAppliesTo').value,
        min_purchase: parseFloat(document.getElementById('discMinPurchase').value) || 0,
        start_date:   document.getElementById('discStartDate').value,
        end_date:     document.getElementById('discEndDate').value || null,
        status:       document.getElementById('discStatus').value,
    };

    if (!payload.start_date) {
        showToast('Start date is required', 'warning');
        return;
    }

    if (id) {
        // await API.put(`/discounts/${id}`, payload);
        const idx = allDiscounts.findIndex(d => d.id == id);
        allDiscounts[idx] = { ...allDiscounts[idx], ...payload };
        showToast('Discount updated successfully', 'success');
    } else {
        // await API.post('/discounts', payload);
        allDiscounts.unshift({ id: Date.now(), ...payload });
        showToast('Discount created successfully', 'success');
    }

    filteredDiscounts = [...allDiscounts];
    updateStats();
    renderTable();
    closeModal('discountModal');
}

// ===== TOGGLE STATUS =====
async function toggleStatus(id) {
    const d = allDiscounts.find(x => x.id === id);
    if (!d) return;

    const newStatus = d.status === 'active' ? 'inactive' : 'active';
    // await API.put(`/discounts/${id}`, { status: newStatus });

    d.status = newStatus;
    filteredDiscounts = [...allDiscounts];
    updateStats();
    renderTable();
    showToast(
        `Discount "${d.name}" ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
        newStatus === 'active' ? 'success' : 'warning'
    );
}

// ===== DELETE =====
function openDeleteModal(id, name) {
    deleteTargetId = id;
    document.getElementById('deleteDiscName').textContent = name;
    openModal('deleteModal');
}

async function confirmDelete() {
    // await API.delete(`/discounts/${deleteTargetId}`);
    allDiscounts      = allDiscounts.filter(d => d.id !== deleteTargetId);
    filteredDiscounts = filteredDiscounts.filter(d => d.id !== deleteTargetId);
    updateStats();
    renderTable();
    closeModal('deleteModal');
    showToast('Discount deleted successfully', 'success');
}

// ===== EXPORT CSV =====
function exportCSV() {
    const headers = [
        'Name', 'Description', 'Type', 'Value',
        'Buy X', 'Get Y', 'Applies To',
        'Min Purchase', 'Start Date', 'End Date', 'Status'
    ];
    const rows = filteredDiscounts.map(d => [
        d.name,
        d.description || '',
        d.type,
        d.value,
        d.buy_x || '',
        d.get_y || '',
        d.applies_to,
        d.min_purchase,
        d.start_date,
        d.end_date || '',
        d.status
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'discounts.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Discounts exported successfully', 'success');
}

// ===== HELPERS =====
function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}