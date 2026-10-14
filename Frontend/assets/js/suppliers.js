// ===== STATE =====
let allSuppliers = [];
let filteredSuppliers = [];
let currentPage = 1;
const pageSize = 10;
let deleteTargetId = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadSuppliers();
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

// ===== LOAD SUPPLIERS =====
async function loadSuppliers() {
    // const data = await API.get('/suppliers');
    allSuppliers = [
        {
            id: 1,
            sup_n:      'Fresh Foods Co.',
            contact_n:  'Ali Hassan',
            phone:      '+1-555-0101',
            email:      'ali@freshfoods.com',
            address:    '123 Market St, New York, NY 10001',
            tax_id:     'TAX-001234',
            pay_terms:  'Net 30',
            notes:      'Primary produce supplier. Delivers Mon/Wed/Fri.',
            is_active:  1,
            total_orders: 24,
            total_spend:  45200.00,
        },
        {
            id: 2,
            sup_n:      'Beverage World',
            contact_n:  'Sara Lee',
            phone:      '+1-555-0202',
            email:      'sara@bevworld.com',
            address:    '456 Drink Ave, Los Angeles, CA 90001',
            tax_id:     'TAX-002345',
            pay_terms:  'Net 15',
            notes:      'All beverages and soft drinks.',
            is_active:  1,
            total_orders: 18,
            total_spend:  32800.00,
        },
        {
            id: 3,
            sup_n:      'Dairy Direct',
            contact_n:  'Tom Baker',
            phone:      '+1-555-0303',
            email:      'tom@dairydirect.com',
            address:    '789 Milk Rd, Chicago, IL 60601',
            tax_id:     'TAX-003456',
            pay_terms:  'Net 7',
            notes:      'Fresh dairy products. Cold chain delivery.',
            is_active:  1,
            total_orders: 30,
            total_spend:  28500.00,
        },
        {
            id: 4,
            sup_n:      'Snack Masters',
            contact_n:  'Mia Wong',
            phone:      '+1-555-0404',
            email:      'mia@snackmasters.com',
            address:    '321 Snack Blvd, Houston, TX 77001',
            tax_id:     'TAX-004567',
            pay_terms:  'Net 30',
            notes:      'Chips, nuts, and packaged snacks.',
            is_active:  1,
            total_orders: 15,
            total_spend:  19750.00,
        },
        {
            id: 5,
            sup_n:      'Bakery Supplies Inc.',
            contact_n:  'James Brown',
            phone:      '+1-555-0505',
            email:      'james@bakerysupplies.com',
            address:    '654 Flour St, Phoenix, AZ 85001',
            tax_id:     'TAX-005678',
            pay_terms:  'COD',
            notes:      'Bread, pastries and baked goods.',
            is_active:  0,
            total_orders: 8,
            total_spend:  12300.00,
        },
        {
            id: 6,
            sup_n:      'Meat & More',
            contact_n:  'Carlos Rivera',
            phone:      '+1-555-0606',
            email:      'carlos@meatandmore.com',
            address:    '987 Butcher Lane, Philadelphia, PA 19101',
            tax_id:     'TAX-006789',
            pay_terms:  'Net 15',
            notes:      'Fresh and frozen meats. HACCP certified.',
            is_active:  1,
            total_orders: 20,
            total_spend:  38600.00,
        },
    ];

    filteredSuppliers = [...allSuppliers];
    updateStats();
    renderTable();
}

// ===== STATS =====
function updateStats() {
    const active      = allSuppliers.filter(s => s.is_active).length;
    const totalOrders = allSuppliers.reduce((s, x) => s + x.total_orders, 0);
    const totalSpend  = allSuppliers.reduce((s, x) => s + x.total_spend, 0);

    document.getElementById('statTotal').textContent  = allSuppliers.length;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statOrders').textContent = totalOrders;
    document.getElementById('statSpend').textContent  = formatCurrency(totalSpend);
}

// ===== FILTER =====
function filterSuppliers() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;

    filteredSuppliers = allSuppliers.filter(s => {
        const matchSearch =
            s.sup_n.toLowerCase().includes(search) ||
            s.contact_n.toLowerCase().includes(search) ||
            s.email.toLowerCase().includes(search) ||
            s.phone.includes(search);
        const matchStatus = status === '' || s.is_active == status;
        return matchSearch && matchStatus;
    });

    currentPage = 1;
    renderTable();
}

// ===== RENDER TABLE =====
function renderTable() {
    const start    = (currentPage - 1) * pageSize;
    const pageData = filteredSuppliers.slice(start, start + pageSize);
    const tbody    = document.getElementById('suppliersTable');

    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9"
                    style="text-align:center;padding:40px;color:var(--secondary)">
                    <i class="fas fa-industry fa-2x"></i><br><br>No suppliers found
                </td>
            </tr>`;
        document.getElementById('paginationInfo').textContent = '';
        document.getElementById('paginationControls').innerHTML = '';
        return;
    }

    tbody.innerHTML = pageData.map(s => `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:42px;height:42px;border-radius:var(--radius);
                        background:linear-gradient(135deg,var(--primary),var(--info));
                        display:flex;align-items:center;justify-content:center;
                        color:white;font-weight:700;font-size:16px;flex-shrink:0;">
                        ${s.sup_n.charAt(0)}
                    </div>
                    <div>
                        <div style="font-weight:700;">${s.sup_n}</div>
                        <div style="font-size:11px;color:var(--secondary);">
                            ${s.tax_id || '—'}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <div style="font-weight:600;">${s.contact_n}</div>
            </td>
            <td style="font-size:13px;">${s.phone}</td>
            <td style="font-size:13px;">
                <a href="mailto:${s.email}"
                    style="color:var(--primary);text-decoration:none;">
                    ${s.email}
                </a>
            </td>
            <td style="font-size:12px;color:var(--secondary);
                max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                ${s.address || '—'}
            </td>
            <td style="text-align:center;">
                <strong>${s.total_orders}</strong>
            </td>
            <td>
                <strong style="color:var(--success);">
                    ${formatCurrency(s.total_spend)}
                </strong>
            </td>
            <td>
                ${s.is_active
                    ? '<span class="badge badge-success">Active</span>'
                    : '<span class="badge badge-danger">Inactive</span>'}
            </td>
            <td>
                <div style="display:flex;gap:6px;">
                    <button class="btn btn-outline btn-sm"
                        onclick="viewSupplier(${s.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-sm"
                        onclick="openEditModal(${s.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm"
                        onclick="openDeleteModal(${s.id},'${s.sup_n}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    document.getElementById('paginationInfo').textContent =
        `Showing ${start + 1}–${Math.min(start + pageSize, filteredSuppliers.length)} ` +
        `of ${filteredSuppliers.length} suppliers`;

    renderPagination();
}

// ===== PAGINATION =====
function renderPagination() {
    const totalPages = Math.ceil(filteredSuppliers.length / pageSize);
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

// ===== VIEW SUPPLIER =====
function viewSupplier(id) {
    const s = allSuppliers.find(x => x.id === id);
    if (!s) return;

    document.getElementById('viewSupplierBody').innerHTML = `
        <!-- Header -->
        <div style="text-align:center;padding:16px 0 20px;">
            <div style="width:70px;height:70px;border-radius:var(--radius-lg);
                background:linear-gradient(135deg,var(--primary),var(--info));
                display:flex;align-items:center;justify-content:center;
                color:white;font-weight:800;font-size:28px;margin:0 auto 12px;">
                ${s.sup_n.charAt(0)}
            </div>
            <h3 style="font-size:18px;font-weight:700;">${s.sup_n}</h3>
            <div style="margin-top:6px;">
                ${s.is_active
                    ? '<span class="badge badge-success">Active Supplier</span>'
                    : '<span class="badge badge-danger">Inactive Supplier</span>'}
            </div>
        </div>

        <!-- Info Grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
            ${[
                { icon: 'fa-user',        label: 'Contact Person', value: s.contact_n },
                { icon: 'fa-phone',       label: 'Phone',          value: s.phone },
                { icon: 'fa-envelope',    label: 'Email',          value: s.email },
                { icon: 'fa-file-invoice',label: 'Tax ID',         value: s.tax_id || '—' },
                { icon: 'fa-handshake',   label: 'Payment Terms',  value: s.pay_terms },
                { icon: 'fa-map-marker-alt', label: 'Address',     value: s.address || '—' },
            ].map(item => `
                <div style="background:var(--light);border-radius:var(--radius);padding:12px;">
                    <div style="font-size:11px;color:var(--secondary);
                        text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">
                        <i class="fas ${item.icon}"></i> ${item.label}
                    </div>
                    <div style="font-weight:600;font-size:13px;
                        word-break:break-word;">${item.value}</div>
                </div>
            `).join('')}
        </div>

        <!-- Performance -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
            <div style="background:linear-gradient(135deg,var(--primary),var(--info));
                border-radius:var(--radius);padding:14px;color:white;text-align:center;">
                <div style="font-size:11px;opacity:0.8;text-transform:uppercase;
                    letter-spacing:1px;margin-bottom:6px;">Total Orders</div>
                <div style="font-size:28px;font-weight:800;">${s.total_orders}</div>
            </div>
            <div style="background:linear-gradient(135deg,var(--success),#15803d);
                border-radius:var(--radius);padding:14px;color:white;text-align:center;">
                <div style="font-size:11px;opacity:0.8;text-transform:uppercase;
                    letter-spacing:1px;margin-bottom:6px;">Total Spend</div>
                <div style="font-size:22px;font-weight:800;">
                    ${formatCurrency(s.total_spend)}
                </div>
            </div>
        </div>

        <!-- Notes -->
        ${s.notes ? `
        <div style="background:var(--light);border-radius:var(--radius);padding:12px;">
            <div style="font-size:11px;color:var(--secondary);
                text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                <i class="fas fa-sticky-note"></i> Notes
            </div>
            <div style="font-size:13px;color:var(--dark);">${s.notes}</div>
        </div>` : ''}`;

    document.getElementById('viewSupplierFooter').innerHTML = `
        <button class="btn btn-outline" onclick="closeModal('viewSupplierModal')">Close</button>
        <button class="btn btn-primary" onclick="closeModal('viewSupplierModal');openEditModal(${s.id})">
            <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-success"
            onclick="closeModal('viewSupplierModal');window.location.href='purchase-orders.html'">
            <i class="fas fa-truck"></i> View Orders
        </button>`;

    openModal('viewSupplierModal');
}

// ===== ADD MODAL =====
function openAddModal() {
    document.getElementById('modalTitle').innerHTML =
        '<i class="fas fa-plus"></i> Add Supplier';
    document.getElementById('supplierId').value  = '';
    document.getElementById('supName').value     = '';
    document.getElementById('supContact').value  = '';
    document.getElementById('supPhone').value    = '';
    document.getElementById('supEmail').value    = '';
    document.getElementById('supTaxId').value    = '';
    document.getElementById('supAddress').value  = '';
    document.getElementById('supPayTerms').value = 'Net 30';
    document.getElementById('supStatus').value   = '1';
    document.getElementById('supNotes').value    = '';
    openModal('supplierModal');
}

// ===== EDIT MODAL =====
function openEditModal(id) {
    const s = allSuppliers.find(x => x.id === id);
    if (!s) return;

    document.getElementById('modalTitle').innerHTML =
        '<i class="fas fa-edit"></i> Edit Supplier';
    document.getElementById('supplierId').value  = s.id;
    document.getElementById('supName').value     = s.sup_n;
    document.getElementById('supContact').value  = s.contact_n;
    document.getElementById('supPhone').value    = s.phone;
    document.getElementById('supEmail').value    = s.email;
    document.getElementById('supTaxId').value    = s.tax_id || '';
    document.getElementById('supAddress').value  = s.address || '';
    document.getElementById('supPayTerms').value = s.pay_terms;
    document.getElementById('supStatus').value   = s.is_active;
    document.getElementById('supNotes').value    = s.notes || '';
    openModal('supplierModal');
}

// ===== SAVE SUPPLIER =====
async function saveSupplier() {
    const id = document.getElementById('supplierId').value;

    const payload = {
        sup_n:     document.getElementById('supName').value.trim(),
        contact_n: document.getElementById('supContact').value.trim(),
        phone:     document.getElementById('supPhone').value.trim(),
        email:     document.getElementById('supEmail').value.trim(),
        tax_id:    document.getElementById('supTaxId').value.trim(),
        address:   document.getElementById('supAddress').value.trim(),
        pay_terms: document.getElementById('supPayTerms').value,
        is_active: parseInt(document.getElementById('supStatus').value),
        notes:     document.getElementById('supNotes').value.trim(),
    };

    if (!payload.sup_n) {
        showToast('Company name is required', 'warning'); return;
    }
    if (!payload.contact_n) {
        showToast('Contact person is required', 'warning'); return;
    }
    if (!payload.phone) {
        showToast('Phone number is required', 'warning'); return;
    }

    if (id) {
        // await API.put(`/suppliers/${id}`, payload);
        const idx = allSuppliers.findIndex(s => s.id == id);
        allSuppliers[idx] = { ...allSuppliers[idx], ...payload };
        showToast('Supplier updated successfully', 'success');
    } else {
        // await API.post('/suppliers', payload);
        allSuppliers.unshift({
            id:           Date.now(),
            ...payload,
            total_orders: 0,
            total_spend:  0,
        });
        showToast('Supplier added successfully', 'success');
    }

    filteredSuppliers = [...allSuppliers];
    updateStats();
    renderTable();
    closeModal('supplierModal');
}

// ===== DELETE =====
function openDeleteModal(id, name) {
    deleteTargetId = id;
    document.getElementById('deleteSupName').textContent = name;
    openModal('deleteModal');
}

async function confirmDelete() {
    // await API.delete(`/suppliers/${deleteTargetId}`);
    allSuppliers      = allSuppliers.filter(s => s.id !== deleteTargetId);
    filteredSuppliers = filteredSuppliers.filter(s => s.id !== deleteTargetId);
    updateStats();
    renderTable();
    closeModal('deleteModal');
    showToast('Supplier deleted successfully', 'success');
}

// ===== EXPORT CSV =====
function exportCSV() {
    const headers = [
        'Company', 'Contact', 'Phone', 'Email',
        'Address', 'Tax ID', 'Payment Terms',
        'Total Orders', 'Total Spend', 'Status'
    ];
    const rows = filteredSuppliers.map(s => [
        s.sup_n, s.contact_n, s.phone, s.email,
        `"${s.address || ''}"`,
        s.tax_id || '',
        s.pay_terms,
        s.total_orders,
        s.total_spend,
        s.is_active ? 'Active' : 'Inactive'
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'suppliers.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Suppliers exported successfully', 'success');
}

// ===== HELPERS =====
function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}