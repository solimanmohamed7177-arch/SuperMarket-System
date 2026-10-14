// ===== STATE =====
let stockData = [];
let filteredStock = [];
let movements = [];
let filteredMovements = [];
let currentStockPage = 1;
let currentMovPage = 1;
const pageSize = 10;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadStockData();
    loadMovements();
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

// ===== LOAD STOCK =====
async function loadStockData() {
    // const data = await API.get('/inventory/stock');
    stockData = [
        { id: 1, product_id: 1, prod_name: 'Coca Cola 500ml', sku: 'BEV-001', branch: 'Main Branch', qty_after: 150, unit_type: 'bottle', low_threshold: 20, updated_at: new Date() },
        { id: 2, product_id: 2, prod_name: 'Full Cream Milk 1L', sku: 'DAI-001', branch: 'Main Branch', qty_after: 8, unit_type: 'liter', low_threshold: 10, updated_at: new Date() },
        { id: 3, product_id: 3, prod_name: 'White Bread Loaf', sku: 'BAK-001', branch: 'Main Branch', qty_after: 0, unit_type: 'pc', low_threshold: 5, updated_at: new Date() },
        { id: 4, product_id: 4, prod_name: 'Banana 1kg', sku: 'PRO-001', branch: 'Branch 2', qty_after: 45, unit_type: 'kg', low_threshold: 10, updated_at: new Date() },
        { id: 5, product_id: 5, prod_name: 'Chicken Breast 1kg', sku: 'MEA-001', branch: 'Main Branch', qty_after: 3, unit_type: 'kg', low_threshold: 5, updated_at: new Date() },
        { id: 6, product_id: 6, prod_name: 'Lays Chips 150g', sku: 'SNK-001', branch: 'Branch 2', qty_after: 200, unit_type: 'pc', low_threshold: 30, updated_at: new Date() },
        { id: 7, product_id: 7, prod_name: 'Orange Juice 1L', sku: 'BEV-002', branch: 'Main Branch', qty_after: 60, unit_type: 'liter', low_threshold: 15, updated_at: new Date() },
        { id: 8, product_id: 8, prod_name: 'Cheddar Cheese 200g', sku: 'DAI-002', branch: 'Main Branch', qty_after: 0, unit_type: 'pc', low_threshold: 10, updated_at: new Date() },
    ];

    filteredStock = [...stockData];
    updateStockStats();
    renderStockTable();
    populateAdjustProductDropdown();
}

// ===== LOAD MOVEMENTS =====
async function loadMovements() {
    // const data = await API.get('/inventory/movements');
    movements = [
        { id: 1, created_at: new Date(), prod_name: 'Coca Cola 500ml', branch: 'Main Branch', movement_type: 'purchase_receive', qty_change: 100, qty_after: 150, reference_type: 'PO', reference_id: 101, employee: 'John Doe' },
        { id: 2, created_at: new Date(), prod_name: 'Full Cream Milk 1L', branch: 'Main Branch', movement_type: 'sale', qty_change: -5, qty_after: 8, reference_type: 'Sale', reference_id: 1001, employee: 'Jane Smith' },
        { id: 3, created_at: new Date(), prod_name: 'White Bread Loaf', branch: 'Main Branch', movement_type: 'sale', qty_change: -12, qty_after: 0, reference_type: 'Sale', reference_id: 1002, employee: 'Jane Smith' },
        { id: 4, created_at: new Date(), prod_name: 'Banana 1kg', branch: 'Branch 2', movement_type: 'adjustment_in', qty_change: 20, qty_after: 45, reference_type: 'ADJ', reference_id: 5, employee: 'Bob Admin' },
        { id: 5, created_at: new Date(), prod_name: 'Chicken Breast 1kg', branch: 'Main Branch', movement_type: 'write_off', qty_change: -2, qty_after: 3, reference_type: 'ADJ', reference_id: 6, employee: 'Bob Admin' },
        { id: 6, created_at: new Date(), prod_name: 'Lays Chips 150g', branch: 'Branch 2', movement_type: 'transfer_in', qty_change: 50, qty_after: 200, reference_type: 'Transfer', reference_id: 3, employee: 'John Doe' },
    ];

    filteredMovements = [...movements];
    renderMovementsTable();
}

// ===== STATS =====
function updateStockStats() {
    const total = stockData.length;
    const inStock = stockData.filter(s => s.qty_after > s.low_threshold).length;
    const lowStock = stockData.filter(s => s.qty_after > 0 && s.qty_after <= s.low_threshold).length;
    const outOfStock = stockData.filter(s => s.qty_after <= 0).length;

    document.getElementById('statTotalItems').textContent = total;
    document.getElementById('statInStock').textContent = inStock;
    document.getElementById('statLowStock').textContent = lowStock;
    document.getElementById('statOutOfStock').textContent = outOfStock;
}

// ===== STOCK STATUS HELPER =====
function getStockStatus(item) {
    if (item.qty_after <= 0) return { label: 'Out of Stock', class: 'badge-danger', key: 'out' };
    if (item.qty_after <= item.low_threshold) return { label: 'Low Stock', class: 'badge-warning', key: 'low' };
    return { label: 'In Stock', class: 'badge-success', key: 'ok' };
}

// ===== MOVEMENT TYPE BADGE =====
function getMovementBadge(type) {
    const map = {
        'purchase_receive': { class: 'badge-success', icon: 'fa-arrow-down' },
        'sale': { class: 'badge-primary', icon: 'fa-arrow-up' },
        'sale_return': { class: 'badge-info', icon: 'fa-undo' },
        'adjustment_in': { class: 'badge-success', icon: 'fa-plus' },
        'adjustment_out': { class: 'badge-warning', icon: 'fa-minus' },
        'transfer_in': { class: 'badge-info', icon: 'fa-arrow-right' },
        'transfer_out': { class: 'badge-secondary', icon: 'fa-arrow-left' },
        'write_off': { class: 'badge-danger', icon: 'fa-trash' },
        'opening stock': { class: 'badge-primary', icon: 'fa-box' },
    };
    const m = map[type] || { class: 'badge-secondary', icon: 'fa-circle' };
    return `<span class="badge ${m.class}"><i class="fas ${m.icon}"></i> ${type.replace(/_/g, ' ')}</span>`;
}

// ===== FILTER STOCK =====
function filterStock() {
    const search = document.getElementById('stockSearch').value.toLowerCase();
    const branch = document.getElementById('branchFilter').value;
    const statusFilter = document.getElementById('stockStatusFilter').value;

    filteredStock = stockData.filter(s => {
        const matchSearch = s.prod_name.toLowerCase().includes(search) || s.sku.toLowerCase().includes(search);
        const matchBranch = !branch || s.branch.includes(branch === '1' ? 'Main' : 'Branch 2');
        const status = getStockStatus(s);
        const matchStatus = !statusFilter || status.key === statusFilter;
        return matchSearch && matchBranch && matchStatus;
    });

    currentStockPage = 1;
    renderStockTable();
}

// ===== FILTER MOVEMENTS =====
function filterMovements() {
    const search = document.getElementById('movSearch').value.toLowerCase();
    const type = document.getElementById('movTypeFilter').value;
    const dateFrom = document.getElementById('movDateFrom').value;
    const dateTo = document.getElementById('movDateTo').value;

    filteredMovements = movements.filter(m => {
        const matchSearch = m.prod_name.toLowerCase().includes(search);
        const matchType = !type || m.movement_type === type;
        const matchFrom = !dateFrom || new Date(m.created_at) >= new Date(dateFrom);
        const matchTo = !dateTo || new Date(m.created_at) <= new Date(dateTo + 'T23:59:59');
        return matchSearch && matchType && matchFrom && matchTo;
    });

    currentMovPage = 1;
    renderMovementsTable();
}

// ===== RENDER STOCK TABLE =====
function renderStockTable() {
    const start = (currentStockPage - 1) * pageSize;
    const pageData = filteredStock.slice(start, start + pageSize);
    const tbody = document.getElementById('stockTable');

    if (pageData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--secondary)">
            <i class="fas fa-box-open fa-2x"></i><br><br>No stock data found</td></tr>`;
        return;
    }

    tbody.innerHTML = pageData.map(s => {
        const status = getStockStatus(s);
        const qtyColor = s.qty_after <= 0 ? 'var(--danger)' : s.qty_after <= s.low_threshold ? 'var(--warning)' : 'var(--success)';
        return `
        <tr>
            <td>
                <div style="font-weight:600;">${s.prod_name}</div>
            </td>
            <td><code style="background:var(--light);padding:2px 8px;border-radius:4px;font-size:12px;">${s.sku}</code></td>
            <td>${s.branch}</td>
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <strong style="font-size:16px;color:${qtyColor};">${s.qty_after}</strong>
                    <div style="flex:1;background:var(--border);border-radius:4px;height:6px;min-width:60px;">
                        <div style="width:${Math.min(100, (s.qty_after / (s.low_threshold * 3)) * 100)}%;
                            background:${qtyColor};height:100%;border-radius:4px;transition:width 0.3s;"></div>
                    </div>
                </div>
            </td>
            <td><span class="badge badge-secondary">${s.unit_type}</span></td>
            <td><span class="badge ${status.class}">${status.label}</span></td>
            <td style="font-size:12px;color:var(--secondary);">${formatDateTime(s.updated_at)}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="quickAdjust(${s.product_id}, '${s.prod_name}', ${s.qty_after})">
                    <i class="fas fa-sliders-h"></i> Adjust
                </button>
            </td>
        </tr>`;
    }).join('');

    document.getElementById('stockPaginationInfo').textContent =
        `Showing ${start + 1}–${Math.min(start + pageSize, filteredStock.length)} of ${filteredStock.length} items`;
    renderPagination('stockPaginationControls', currentStockPage, filteredStock.length, (p) => { currentStockPage = p; renderStockTable(); });
}

// ===== RENDER MOVEMENTS TABLE =====
function renderMovementsTable() {
    const start = (currentMovPage - 1) * pageSize;
    const pageData = filteredMovements.slice(start, start + pageSize);
    const tbody = document.getElementById('movementsTable');

    if (pageData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--secondary)">
            <i class="fas fa-exchange-alt fa-2x"></i><br><br>No movements found</td></tr>`;
        return;
    }

    tbody.innerHTML = pageData.map(m => `
        <tr>
            <td style="font-size:12px;">${formatDateTime(m.created_at)}</td>
            <td><strong>${m.prod_name}</strong></td>
            <td>${m.branch}</td>
            <td>${getMovementBadge(m.movement_type)}</td>
            <td>
                <strong style="color:${m.qty_change > 0 ? 'var(--success)' : 'var(--danger)'};">
                    ${m.qty_change > 0 ? '+' : ''}${m.qty_change}
                </strong>
            </td>
            <td><strong>${m.qty_after}</strong></td>
            <td style="font-size:12px;">${m.reference_type} #${m.reference_id}</td>
            <td style="font-size:12px;">${m.employee}</td>
        </tr>
    `).join('');

    document.getElementById('movPaginationInfo').textContent =
        `Showing ${start + 1}–${Math.min(start + pageSize, filteredMovements.length)} of ${filteredMovements.length} movements`;
    renderPagination('movPaginationControls', currentMovPage, filteredMovements.length, (p) => { currentMovPage = p; renderMovementsTable(); });
}

// ===== PAGINATION HELPER =====
function renderPagination(containerId, currentPage, totalItems, onPageChange) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const ctrl = document.getElementById(containerId);
    ctrl.innerHTML = '';
    if (totalPages <= 1) return;

    const prev = document.createElement('button');
    prev.className = 'page-btn';
    prev.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prev.disabled = currentPage === 1;
    prev.onclick = () => onPageChange(currentPage - 1);
    ctrl.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => onPageChange(i);
        ctrl.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-btn';
    next.innerHTML = '<i class="fas fa-chevron-right"></i>';
    next.disabled = currentPage === totalPages;
    next.onclick = () => onPageChange(currentPage + 1);
    ctrl.appendChild(next);
}

// ===== TAB SWITCH =====
function switchTab(tab) {
    const isStock = tab === 'stock';
    document.getElementById('stockPanel').style.display = isStock ? 'block' : 'none';
    document.getElementById('movementsPanel').style.display = isStock ? 'none' : 'block';
    document.getElementById('tabStock').className = isStock ? 'btn btn-primary' : 'btn btn-outline';
    document.getElementById('tabMovements').className = isStock ? 'btn btn-outline' : 'btn btn-primary';
}

// ===== ADJUSTMENT MODAL =====
function populateAdjustProductDropdown() {
    const sel = document.getElementById('adjProduct');
    stockData.forEach(s => {
        sel.innerHTML += `<option value="${s.product_id}" data-qty="${s.qty_after}">${s.prod_name} (${s.qty_after} ${s.unit_type})</option>`;
    });
    sel.onchange = function() {
        const opt = this.options[this.selectedIndex];
        document.getElementById('currentStockDisplay').textContent = opt.dataset.qty || '0';
    };
}

function openAdjustModal() {
    document.getElementById('adjProduct').value = '';
    document.getElementById('adjQty').value = '';
    document.getElementById('adjReason').value = '';
    document.getElementById('currentStockDisplay').textContent = 'Select a product';
    openModal('adjustModal');
}

function quickAdjust(productId, name, currentQty) {
    document.getElementById('adjProduct').value = productId;
    document.getElementById('currentStockDisplay').textContent = currentQty;
    openModal('adjustModal');
}

async function saveAdjustment() {
    const productId = document.getElementById('adjProduct').value;
    const adjType = document.getElementById('adjType').value;
    const qty = parseFloat(document.getElementById('adjQty').value);
    const reason = document.getElementById('adjReason').value;

    if (!productId || !qty || qty <= 0) {
        showToast('Please fill all required fields', 'warning');
        return;
    }

    const payload = {
        product_id: parseInt(productId),
        branch_id: parseInt(document.getElementById('adjBranch').value),
        movement_type: adjType,
        qty_change: adjType.includes('out') || adjType === 'write_off' ? -qty : qty,
        description: reason
    };

    // await API.post('/inventory/adjust', payload);

    // Update local data
    const stockItem = stockData.find(s => s.product_id == productId);
    if (stockItem) {
        stockItem.qty_after += payload.qty_change;
        stockItem.qty_after = Math.max(0, stockItem.qty_after);
        stockItem.updated_at = new Date();
    }

    // Add to movements
    movements.unshift({
        id: Date.now(),
        created_at: new Date(),
        prod_name: stockItem?.prod_name || '',
        branch: 'Main Branch',
        movement_type: adjType,
        qty_change: payload.qty_change,
        qty_after: stockItem?.qty_after || 0,
        reference_type: 'ADJ',
        reference_id: Date.now(),
        employee: 'Admin'
    });

    filteredStock = [...stockData];
    filteredMovements = [...movements];
    updateStockStats();
    renderStockTable();
    renderMovementsTable();
    closeModal('adjustModal');
    showToast('Stock adjustment saved successfully', 'success');
}

function exportStockCSV() {
    const headers = ['Product', 'SKU', 'Branch', 'Current Stock', 'Unit', 'Status'];
    const rows = filteredStock.map(s => {
        const status = getStockStatus(s);
        return [s.prod_name, s.sku, s.branch, s.qty_after, s.unit_type, status.label];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_stock.csv';
    a.click();
    showToast('Stock data exported', 'success');
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}