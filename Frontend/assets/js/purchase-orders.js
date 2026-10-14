// ===== STATE =====
let allPOs = [];
let filteredPOs = [];
let currentPOPage = 1;
const pageSize = 10;
let editingPOId = null;

let suppliers = [];
let products = [];
let poItemRows = [];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadSuppliers();
    loadProducts();
    loadPOs();
    setDefaultDates();
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

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    document.getElementById('poOrderDate').value = today;
    document.getElementById('poExpectedDate').value = nextWeek;
}

// ===== LOAD SUPPLIERS =====
async function loadSuppliers() {
    // const data = await API.get('/suppliers');
    suppliers = [
        { id: 1, sup_n: 'Fresh Foods Co.', contact_n: 'Ali Hassan', phone: '+1-555-0101' },
        { id: 2, sup_n: 'Beverage World', contact_n: 'Sara Lee', phone: '+1-555-0202' },
        { id: 3, sup_n: 'Dairy Direct', contact_n: 'Tom Baker', phone: '+1-555-0303' },
        { id: 4, sup_n: 'Snack Masters', contact_n: 'Mia Wong', phone: '+1-555-0404' },
    ];

    const sel = document.getElementById('poSupplier');
    suppliers.forEach(s => {
        sel.innerHTML += `<option value="${s.id}">${s.sup_n}</option>`;
    });
}

// ===== LOAD PRODUCTS =====
async function loadProducts() {
    // const data = await API.get('/products?is_active=1');
    products = [
        { id: 1, sku: 'BEV-001', prod_name: 'Coca Cola 500ml', unit_type: 'bottle', cost_price: 0.90 },
        { id: 2, sku: 'DAI-001', prod_name: 'Full Cream Milk 1L', unit_type: 'liter', cost_price: 1.40 },
        { id: 3, sku: 'BAK-001', prod_name: 'White Bread Loaf', unit_type: 'pc', cost_price: 1.00 },
        { id: 4, sku: 'PRO-001', prod_name: 'Banana 1kg', unit_type: 'kg', cost_price: 0.50 },
        { id: 5, sku: 'MEA-001', prod_name: 'Chicken Breast 1kg', unit_type: 'kg', cost_price: 5.20 },
        { id: 6, sku: 'SNK-001', prod_name: 'Lays Chips 150g', unit_type: 'pc', cost_price: 1.50 },
        { id: 7, sku: 'BEV-002', prod_name: 'Orange Juice 1L', unit_type: 'liter', cost_price: 1.80 },
        { id: 8, sku: 'DAI-002', prod_name: 'Cheddar Cheese 200g', unit_type: 'pc', cost_price: 2.80 },
    ];
}

// ===== LOAD POs =====
async function loadPOs() {
    // const data = await API.get('/purchase-orders');
    allPOs = [
        {
            id: 1, po_number: 'PO-2024-001', sup_id: 1, supplier_name: 'Fresh Foods Co.',
            br_id: 1, branch: 'Main Branch', order_date: '2024-01-10',
            expected_date: '2024-01-17', received_date: null,
            total_amount: 450.00, pr_status: 'Received',
            items: [
                { id: 1, product_id: 4, prod_name: 'Banana 1kg', qty_ordered: 100, qty_received: 100, unit_cost: 0.50, line_total: 50.00 },
                { id: 2, product_id: 5, prod_name: 'Chicken Breast 1kg', qty_ordered: 50, qty_received: 50, unit_cost: 5.20, line_total: 260.00 },
                { id: 3, product_id: 3, prod_name: 'White Bread Loaf', qty_ordered: 140, qty_received: 140, unit_cost: 1.00, line_total: 140.00 },
            ]
        },
        {
            id: 2, po_number: 'PO-2024-002', sup_id: 2, supplier_name: 'Beverage World',
            br_id: 1, branch: 'Main Branch', order_date: '2024-01-12',
            expected_date: '2024-01-19', received_date: null,
            total_amount: 324.00, pr_status: 'Ordered',
            items: [
                { id: 4, product_id: 1, prod_name: 'Coca Cola 500ml', qty_ordered: 200, qty_received: 0, unit_cost: 0.90, line_total: 180.00 },
                { id: 5, product_id: 7, prod_name: 'Orange Juice 1L', qty_ordered: 80, qty_received: 0, unit_cost: 1.80, line_total: 144.00 },
            ]
        },
        {
            id: 3, po_number: 'PO-2024-003', sup_id: 3, supplier_name: 'Dairy Direct',
            br_id: 2, branch: 'Branch 2', order_date: '2024-01-14',
            expected_date: '2024-01-21', received_date: null,
            total_amount: 196.00, pr_status: 'Pending',
            items: [
                { id: 6, product_id: 2, prod_name: 'Full Cream Milk 1L', qty_ordered: 100, qty_received: 0, unit_cost: 1.40, line_total: 140.00 },
                { id: 7, product_id: 8, prod_name: 'Cheddar Cheese 200g', qty_ordered: 20, qty_received: 0, unit_cost: 2.80, line_total: 56.00 },
            ]
        },
        {
            id: 4, po_number: 'PO-2024-004', sup_id: 4, supplier_name: 'Snack Masters',
            br_id: 1, branch: 'Main Branch', order_date: '2024-01-15',
            expected_date: '2024-01-22', received_date: null,
            total_amount: 225.00, pr_status: 'Partially Received',
            items: [
                { id: 8, product_id: 6, prod_name: 'Lays Chips 150g', qty_ordered: 150, qty_received: 80, unit_cost: 1.50, line_total: 225.00 },
            ]
        },
        {
            id: 5, po_number: 'PO-2024-005', sup_id: 1, supplier_name: 'Fresh Foods Co.',
            br_id: 2, branch: 'Branch 2', order_date: '2024-01-08',
            expected_date: '2024-01-15', received_date: null,
            total_amount: 120.00, pr_status: 'Cancelled',
            items: [
                { id: 9, product_id: 4, prod_name: 'Banana 1kg', qty_ordered: 80, qty_received: 0, unit_cost: 0.50, line_total: 40.00 },
                { id: 10, product_id: 3, prod_name: 'White Bread Loaf', qty_ordered: 80, qty_received: 0, unit_cost: 1.00, line_total: 80.00 },
            ]
        },
    ];

    filteredPOs = [...allPOs];
    updatePOStats();
    renderPOTable();
}

// ===== STATS =====
function updatePOStats() {
    document.getElementById('statTotal').textContent = allPOs.length;
    document.getElementById('statPending').textContent = allPOs.filter(p => p.pr_status === 'Pending').length;
    document.getElementById('statOrdered').textContent = allPOs.filter(p => p.pr_status === 'Ordered').length;
    document.getElementById('statReceived').textContent = allPOs.filter(p => p.pr_status === 'Received').length;
    document.getElementById('statCancelled').textContent = allPOs.filter(p => p.pr_status === 'Cancelled').length;
}

// ===== FILTER =====
function filterPOs() {
    const search = document.getElementById('poSearch').value.toLowerCase();
    const status = document.getElementById('poStatusFilter').value;

    filteredPOs = allPOs.filter(po => {
        const matchSearch =
            po.po_number.toLowerCase().includes(search) ||
            po.supplier_name.toLowerCase().includes(search) ||
            po.branch.toLowerCase().includes(search);
        const matchStatus = !status || po.pr_status === status;
        return matchSearch && matchStatus;
    });

    currentPOPage = 1;
    renderPOTable();
}

// ===== RENDER TABLE =====
function renderPOTable() {
    const start = (currentPOPage - 1) * pageSize;
    const pageData = filteredPOs.slice(start, start + pageSize);
    const tbody = document.getElementById('poTable');

    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:40px;color:var(--secondary)">
                    <i class="fas fa-truck fa-2x"></i><br><br>No purchase orders found
                </td>
            </tr>`;
        document.getElementById('poPaginationInfo').textContent = '';
        document.getElementById('poPaginationControls').innerHTML = '';
        return;
    }

    tbody.innerHTML = pageData.map(po => {
        const statusMap = {
            'Pending':            'badge-warning',
            'Ordered':            'badge-primary',
            'Received':           'badge-success',
            'Partially Received': 'badge-info',
            'Cancelled':          'badge-danger',
        };

        const canReceive = po.pr_status === 'Ordered' || po.pr_status === 'Partially Received';
        const canCancel  = po.pr_status === 'Pending'  || po.pr_status === 'Ordered';

        return `
        <tr>
            <td>
                <strong style="color:var(--primary);cursor:pointer;" onclick="viewPO(${po.id})">
                    ${po.po_number}
                </strong>
                <div style="font-size:11px;color:var(--secondary);">${po.items.length} item(s)</div>
            </td>
            <td>
                <div style="font-weight:600;">${po.supplier_name}</div>
            </td>
            <td>${po.branch}</td>
            <td>${formatDate(po.order_date)}</td>
            <td>${formatDate(po.expected_date)}</td>
            <td><strong style="color:var(--success);">${formatCurrency(po.total_amount)}</strong></td>
            <td>
                <span class="badge ${statusMap[po.pr_status] || 'badge-secondary'}">
                    ${po.pr_status}
                </span>
            </td>
            <td>
                <div style="display:flex;gap:5px;flex-wrap:wrap;">
                    <button class="btn btn-outline btn-sm" onclick="viewPO(${po.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${canReceive ? `
                    <button class="btn btn-success btn-sm" onclick="openReceiveModal(${po.id})" title="Receive Items">
                        <i class="fas fa-check"></i> Receive
                    </button>` : ''}
                    ${canCancel ? `
                    <button class="btn btn-danger btn-sm" onclick="cancelPO(${po.id})" title="Cancel">
                        <i class="fas fa-times"></i>
                    </button>` : ''}
                </div>
            </td>
        </tr>`;
    }).join('');

    document.getElementById('poPaginationInfo').textContent =
        `Showing ${start + 1}–${Math.min(start + pageSize, filteredPOs.length)} of ${filteredPOs.length} orders`;

    renderPagination();
}

// ===== PAGINATION =====
function renderPagination() {
    const totalPages = Math.ceil(filteredPOs.length / pageSize);
    const ctrl = document.getElementById('poPaginationControls');
    ctrl.innerHTML = '';
    if (totalPages <= 1) return;

    const prev = document.createElement('button');
    prev.className = 'page-btn';
    prev.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prev.disabled = currentPOPage === 1;
    prev.onclick = () => { currentPOPage--; renderPOTable(); };
    ctrl.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPOPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => { currentPOPage = i; renderPOTable(); };
        ctrl.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-btn';
    next.innerHTML = '<i class="fas fa-chevron-right"></i>';
    next.disabled = currentPOPage === totalPages;
    next.onclick = () => { currentPOPage++; renderPOTable(); };
    ctrl.appendChild(next);
}

// ===== CREATE PO MODAL =====
function openCreatePOModal() {
    editingPOId = null;
    document.getElementById('poModalTitle').innerHTML = '<i class="fas fa-plus"></i> Create Purchase Order';
    document.getElementById('poSupplier').value = '';
    document.getElementById('poBranch').value = '1';
    setDefaultDates();
    poItemRows = [];
    renderPOItemRows();
    addPOItemRow();
    openModal('createPOModal');
}

// ===== PO ITEM ROWS =====
function addPOItemRow() {
    const rowId = Date.now();
    poItemRows.push({ rowId, product_id: '', qty_ordered: 1, unit_cost: 0, line_total: 0 });
    renderPOItemRows();
}

function renderPOItemRows() {
    const tbody = document.getElementById('poItemsBody');

    if (poItemRows.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:20px;color:var(--secondary);">
                    <i class="fas fa-plus-circle"></i> Click "Add Item" to add products
                </td>
            </tr>`;
        updatePOTotal();
        return;
    }

    tbody.innerHTML = poItemRows.map((row, index) => `
        <tr id="poRow_${row.rowId}">
            <td style="padding:8px;">
                <select class="form-control form-select" style="font-size:13px;"
                    onchange="onPOProductChange(${index}, this.value)">
                    <option value="">Select Product</option>
                    ${products.map(p =>
                        `<option value="${p.id}" ${row.product_id == p.id ? 'selected' : ''}
                            data-cost="${p.cost_price}">
                            ${p.prod_name} (${p.sku})
                        </option>`
                    ).join('')}
                </select>
            </td>
            <td style="padding:8px;">
                <input type="number" class="form-control" style="font-size:13px;"
                    value="${row.qty_ordered}" min="0.001" step="0.001"
                    onchange="onPOQtyChange(${index}, this.value)">
            </td>
            <td style="padding:8px;">
                <input type="number" class="form-control" style="font-size:13px;"
                    value="${row.unit_cost}" min="0" step="0.01"
                    onchange="onPOCostChange(${index}, this.value)">
            </td>
            <td style="padding:8px;">
                <strong style="color:var(--primary);">${formatCurrency(row.line_total)}</strong>
            </td>
            <td style="padding:8px;">
                <button class="btn btn-danger btn-sm" onclick="removePOItemRow(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    updatePOTotal();
}

function onPOProductChange(index, productId) {
    const product = products.find(p => p.id == productId);
    poItemRows[index].product_id = productId;
    if (product) {
        poItemRows[index].unit_cost = product.cost_price;
        poItemRows[index].line_total = product.cost_price * poItemRows[index].qty_ordered;
    }
    renderPOItemRows();
}

function onPOQtyChange(index, value) {
    poItemRows[index].qty_ordered = parseFloat(value) || 0;
    poItemRows[index].line_total = poItemRows[index].qty_ordered * poItemRows[index].unit_cost;
    renderPOItemRows();
}

function onPOCostChange(index, value) {
    poItemRows[index].unit_cost = parseFloat(value) || 0;
    poItemRows[index].line_total = poItemRows[index].qty_ordered * poItemRows[index].unit_cost;
    renderPOItemRows();
}

function removePOItemRow(index) {
    poItemRows.splice(index, 1);
    renderPOItemRows();
}

function updatePOTotal() {
    const total = poItemRows.reduce((sum, row) => sum + (row.line_total || 0), 0);
    document.getElementById('poTotalAmount').textContent = formatCurrency(total);
}

// ===== SAVE PO =====
async function savePO(status) {
    const supplierId = document.getElementById('poSupplier').value;
    const branchId   = document.getElementById('poBranch').value;
    const orderDate  = document.getElementById('poOrderDate').value;
    const expectedDate = document.getElementById('poExpectedDate').value;

    if (!supplierId) { showToast('Please select a supplier', 'warning'); return; }
    if (poItemRows.length === 0) { showToast('Please add at least one item', 'warning'); return; }

    const invalidItems = poItemRows.filter(r => !r.product_id || r.qty_ordered <= 0);
    if (invalidItems.length > 0) {
        showToast('Please fill all item details correctly', 'warning');
        return;
    }

    const totalAmount = poItemRows.reduce((s, r) => s + r.line_total, 0);
    const supplier = suppliers.find(s => s.id == supplierId);

    const payload = {
        sup_id: parseInt(supplierId),
        br_id: parseInt(branchId),
        pr_status: status,
        order_date: orderDate,
        expected_date: expectedDate,
        total_amount: totalAmount,
        items: poItemRows.map(r => ({
            product_id: parseInt(r.product_id),
            qty_ordered: r.qty_ordered,
            qty_received: 0,
            unit_cost: r.unit_cost,
            line_total: r.line_total
        }))
    };

    // await API.post('/purchase-orders', payload);

    // Simulate save
    const newPO = {
        id: allPOs.length + 1,
        po_number: `PO-2024-00${allPOs.length + 1}`,
        sup_id: payload.sup_id,
        supplier_name: supplier?.sup_n || 'Unknown',
        br_id: payload.br_id,
        branch: payload.br_id == 1 ? 'Main Branch' : 'Branch 2',
        order_date: orderDate,
        expected_date: expectedDate,
        received_date: null,
        total_amount: totalAmount,
        pr_status: status,
        items: poItemRows.map(r => {
            const prod = products.find(p => p.id == r.product_id);
            return {
                id: Date.now() + Math.random(),
                product_id: parseInt(r.product_id),
                prod_name: prod?.prod_name || '',
                qty_ordered: r.qty_ordered,
                qty_received: 0,
                unit_cost: r.unit_cost,
                line_total: r.line_total
            };
        })
    };

    allPOs.unshift(newPO);
    filteredPOs = [...allPOs];
    updatePOStats();
    renderPOTable();
    closeModal('createPOModal');
    showToast(`Purchase Order ${newPO.po_number} created successfully`, 'success');
}

// ===== VIEW PO =====
function viewPO(id) {
    const po = allPOs.find(p => p.id === id);
    if (!po) return;

    const statusMap = {
        'Pending':            'badge-warning',
        'Ordered':            'badge-primary',
        'Received':           'badge-success',
        'Partially Received': 'badge-info',
        'Cancelled':          'badge-danger',
    };

    document.getElementById('viewPOTitle').innerHTML =
        `<i class="fas fa-file-alt"></i> ${po.po_number}`;

    document.getElementById('viewPOBody').innerHTML = `
        <!-- PO Info Grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
            <div style="background:var(--light);border-radius:var(--radius);padding:14px;">
                <div style="font-size:11px;color:var(--secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                    Supplier Info
                </div>
                <div style="font-weight:700;font-size:15px;">${po.supplier_name}</div>
            </div>
            <div style="background:var(--light);border-radius:var(--radius);padding:14px;">
                <div style="font-size:11px;color:var(--secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                    Branch
                </div>
                <div style="font-weight:700;font-size:15px;">${po.branch}</div>
            </div>
            <div style="background:var(--light);border-radius:var(--radius);padding:14px;">
                <div style="font-size:11px;color:var(--secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                    Order Date
                </div>
                <div style="font-weight:700;">${formatDate(po.order_date)}</div>
            </div>
            <div style="background:var(--light);border-radius:var(--radius);padding:14px;">
                <div style="font-size:11px;color:var(--secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                    Expected Date
                </div>
                <div style="font-weight:700;">${formatDate(po.expected_date)}</div>
            </div>
            <div style="background:var(--light);border-radius:var(--radius);padding:14px;">
                <div style="font-size:11px;color:var(--secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                    Status
                </div>
                <span class="badge ${statusMap[po.pr_status]}">${po.pr_status}</span>
            </div>
            <div style="background:var(--light);border-radius:var(--radius);padding:14px;">
                <div style="font-size:11px;color:var(--secondary);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                    Total Amount
                </div>
                <div style="font-weight:700;font-size:16px;color:var(--success);">
                    ${formatCurrency(po.total_amount)}
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <h4 style="font-size:14px;font-weight:700;margin-bottom:10px;">
            <i class="fas fa-list" style="color:var(--primary)"></i> Order Items
        </h4>
        <div style="overflow-x:auto;">
            <table style="font-size:13px;">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty Ordered</th>
                        <th>Qty Received</th>
                        <th>Unit Cost</th>
                        <th>Line Total</th>
                        <th>Progress</th>
                    </tr>
                </thead>
                <tbody>
                    ${po.items.map(item => {
                        const pct = item.qty_ordered > 0
                            ? Math.round((item.qty_received / item.qty_ordered) * 100)
                            : 0;
                        const barColor = pct >= 100
                            ? 'var(--success)'
                            : pct > 0
                            ? 'var(--warning)'
                            : 'var(--border)';
                        return `
                        <tr>
                            <td><strong>${item.prod_name}</strong></td>
                            <td>${item.qty_ordered}</td>
                            <td>
                                <strong style="color:${item.qty_received >= item.qty_ordered
                                    ? 'var(--success)'
                                    : item.qty_received > 0
                                    ? 'var(--warning)'
                                    : 'var(--secondary)'};">
                                    ${item.qty_received}
                                </strong>
                            </td>
                            <td>${formatCurrency(item.unit_cost)}</td>
                            <td><strong>${formatCurrency(item.line_total)}</strong></td>
                            <td style="min-width:100px;">
                                <div style="background:var(--border);border-radius:4px;height:8px;">
                                    <div style="width:${pct}%;background:${barColor};
                                        height:100%;border-radius:4px;transition:width 0.3s;">
                                    </div>
                                </div>
                                <div style="font-size:11px;color:var(--secondary);margin-top:2px;">
                                    ${pct}%
                                </div>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" style="text-align:right;font-weight:700;padding:12px 16px;">
                            Total:
                        </td>
                        <td style="padding:12px 16px;">
                            <strong style="color:var(--success);font-size:15px;">
                                ${formatCurrency(po.total_amount)}
                            </strong>
                        </td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </div>`;

    const canReceive = po.pr_status === 'Ordered' || po.pr_status === 'Partially Received';
    const canCancel  = po.pr_status === 'Pending'  || po.pr_status === 'Ordered';

    document.getElementById('viewPOFooter').innerHTML = `
        <button class="btn btn-outline" onclick="closeModal('viewPOModal')">Close</button>
        ${canReceive ? `
        <button class="btn btn-success" onclick="closeModal('viewPOModal'); openReceiveModal(${po.id})">
            <i class="fas fa-check"></i> Receive Items
        </button>` : ''}
        ${canCancel ? `
        <button class="btn btn-danger" onclick="closeModal('viewPOModal'); cancelPO(${po.id})">
            <i class="fas fa-times"></i> Cancel PO
        </button>` : ''}`;

    openModal('viewPOModal');
}

// ===== RECEIVE ITEMS =====
function openReceiveModal(id) {
    const po = allPOs.find(p => p.id === id);
    if (!po) return;

    document.getElementById('viewPOTitle').innerHTML =
        `<i class="fas fa-check-circle" style="color:var(--success)"></i> Receive Items — ${po.po_number}`;

    document.getElementById('viewPOBody').innerHTML = `
        <p style="color:var(--secondary);font-size:13px;margin-bottom:16px;">
            Enter the quantity received for each item below.
        </p>
        <div style="overflow-x:auto;">
            <table style="font-size:13px;">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty Ordered</th>
                        <th>Already Received</th>
                        <th>Remaining</th>
                        <th>Qty Receiving Now</th>
                    </tr>
                </thead>
                <tbody>
                    ${po.items.map(item => {
                        const remaining = item.qty_ordered - item.qty_received;
                        return `
                        <tr>
                            <td><strong>${item.prod_name}</strong></td>
                            <td>${item.qty_ordered}</td>
                            <td style="color:var(--success);">${item.qty_received}</td>
                            <td style="color:${remaining > 0 ? 'var(--warning)' : 'var(--success)'};">
                                ${remaining}
                            </td>
                            <td>
                                <input type="number" class="form-control receive-qty-input"
                                    data-item-id="${item.id}"
                                    data-max="${remaining}"
                                    value="${remaining}"
                                    min="0" max="${remaining}"
                                    style="width:100px;font-size:13px;"
                                    ${remaining <= 0 ? 'disabled' : ''}>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`;

    document.getElementById('viewPOFooter').innerHTML = `
        <button class="btn btn-outline" onclick="closeModal('viewPOModal')">Cancel</button>
        <button class="btn btn-success" onclick="confirmReceive(${po.id})">
            <i class="fas fa-check"></i> Confirm Receipt
        </button>`;

    openModal('viewPOModal');
}

async function confirmReceive(poId) {
    const po = allPOs.find(p => p.id === poId);
    if (!po) return;

    const inputs = document.querySelectorAll('.receive-qty-input');
    let allReceived = true;
    let anyReceived = false;

    inputs.forEach(input => {
        const itemId = input.dataset.itemId;
        const qty = parseFloat(input.value) || 0;
        const item = po.items.find(i => i.id == itemId);
        if (item) {
            item.qty_received += qty;
            if (item.qty_received < item.qty_ordered) allReceived = false;
            if (qty > 0) anyReceived = true;
        }
    });

    if (!anyReceived) {
        showToast('Please enter at least one received quantity', 'warning');
        return;
    }

    // await API.post(`/purchase-orders/${poId}/receive`, { items: [...] });

    po.pr_status = allReceived ? 'Received' : 'Partially Received';
    if (allReceived) po.received_date = new Date().toISOString().split('T')[0];

    filteredPOs = [...allPOs];
    updatePOStats();
    renderPOTable();
    closeModal('viewPOModal');
    showToast(
        allReceived
            ? 'All items received successfully!'
            : 'Partial receipt recorded successfully!',
        'success'
    );
}

// ===== CANCEL PO =====
async function cancelPO(id) {
    const po = allPOs.find(p => p.id === id);
    if (!po) return;
    if (!confirm(`Cancel Purchase Order ${po.po_number}? This cannot be undone.`)) return;

    // await API.put(`/purchase-orders/${id}`, { pr_status: 'Cancelled' });

    po.pr_status = 'Cancelled';
    filteredPOs = [...allPOs];
    updatePOStats();
    renderPOTable();
    showToast(`${po.po_number} has been cancelled`, 'warning');
}

// ===== EXPORT CSV =====
function exportPOCSV() {
    const headers = ['PO Number', 'Supplier', 'Branch', 'Order Date', 'Expected Date', 'Total Amount', 'Status'];
    const rows = filteredPOs.map(po => [
        po.po_number, po.supplier_name, po.branch,
        po.order_date, po.expected_date,
        po.total_amount, po.pr_status
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchase_orders.csv';
    a.click();
    showToast('Purchase orders exported', 'success');
}

// ===== HELPERS =====
function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}