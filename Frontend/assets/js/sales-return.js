// ===== STATE =====
let allReturns = [];
let filteredReturns = [];
let currentPage = 1;
const pageSize = 10;
let foundSale = null;

// Demo sales data to search from
const demoSales = [
    {
        id: 1001, customer: 'John Doe', grand_total: 121.28,
        items: [
            { id: 1, prod_name: 'Coca Cola 500ml',    qty: 5, unit_price: 1.50,  line_total: 7.50  },
            { id: 2, prod_name: 'Full Cream Milk 1L', qty: 2, unit_price: 2.20,  line_total: 4.40  },
            { id: 3, prod_name: 'Chicken Breast 1kg', qty: 1, unit_price: 8.50,  line_total: 8.50  },
        ]
    },
    {
        id: 1002, customer: 'Walk-in', grand_total: 47.25,
        items: [
            { id: 4, prod_name: 'White Bread Loaf',   qty: 3, unit_price: 1.80,  line_total: 5.40  },
            { id: 5, prod_name: 'Orange Juice 1L',    qty: 2, unit_price: 3.20,  line_total: 6.40  },
        ]
    },
    {
        id: 1003, customer: 'Jane Smith', grand_total: 218.05,
        items: [
            { id: 6, prod_name: 'Cheddar Cheese 200g',qty: 4, unit_price: 4.50,  line_total: 18.00 },
            { id: 7, prod_name: 'Lays Chips 150g',    qty: 6, unit_price: 2.50,  line_total: 15.00 },
            { id: 8, prod_name: 'Banana 1kg',         qty: 3, unit_price: 0.99,  line_total: 2.97  },
        ]
    },
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadReturns();
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

// ===== LOAD RETURNS =====
async function loadReturns() {
    // const data = await API.get('/sales-returns');
    allReturns = [
        {
            id: 1, original_sale_id: 1001, customer: 'John Doe',
            items_returned: 2, total_refund: 11.90,
            reason: 'Defective product', employee: 'Jane Smith',
            return_date: '2024-01-15 14:30',
            items: [
                { prod_name: 'Coca Cola 500ml',    qty_return: 2, refund_amount: 3.00 },
                { prod_name: 'Full Cream Milk 1L', qty_return: 1, refund_amount: 2.20 },
            ]
        },
        {
            id: 2, original_sale_id: 1003, customer: 'Jane Smith',
            items_returned: 1, total_refund: 15.00,
            reason: 'Wrong item received', employee: 'John Doe',
            return_date: '2024-01-16 10:15',
            items: [
                { prod_name: 'Lays Chips 150g', qty_return: 6, refund_amount: 15.00 },
            ]
        },
        {
            id: 3, original_sale_id: 1002, customer: 'Walk-in',
            items_returned: 1, total_refund: 5.40,
            reason: 'Expired product', employee: 'Jane Smith',
            return_date: '2024-01-16 11:45',
            items: [
                { prod_name: 'White Bread Loaf', qty_return: 3, refund_amount: 5.40 },
            ]
        },
    ];

    filteredReturns = [...allReturns];
    updateStats();
    renderTable();
}

// ===== STATS =====
function updateStats() {
    const totalRefunded = allReturns.reduce((s, r) => s + r.total_refund, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayReturns = allReturns.filter(r => r.return_date.startsWith(today)).length;

    document.getElementById('statTotal').textContent    = allReturns.length;
    document.getElementById('statRefunded').textContent = formatCurrency(totalRefunded);
    document.getElementById('statToday').textContent    = todayReturns;
    document.getElementById('statRate').textContent     = '2.4%';
}

// ===== FILTER =====
function filterReturns() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const date   = document.getElementById('dateFilter').value;

    filteredReturns = allReturns.filter(r => {
        const matchSearch =
            String(r.original_sale_id).includes(search) ||
            r.customer.toLowerCase().includes(search) ||
            r.reason.toLowerCase().includes(search);
        const matchDate = !date || r.return_date.startsWith(date);
        return matchSearch && matchDate;
    });

    currentPage = 1;
    renderTable();
}

// ===== RENDER TABLE =====
function renderTable() {
    const start    = (currentPage - 1) * pageSize;
    const pageData = filteredReturns.slice(start, start + pageSize);
    const tbody    = document.getElementById('returnsTable');

    if (pageData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--secondary)">
            <i class="fas fa-undo fa-2x"></i><br><br>No returns found</td></tr>`;
        document.getElementById('paginationInfo').textContent = '';
        document.getElementById('paginationControls').innerHTML = '';
        return;
    }

    tbody.innerHTML = pageData.map(r => `
        <tr>
            <td><strong style="color:var(--danger);">#RET-${String(r.id).padStart(4,'0')}</strong></td>
            <td>
                <span style="color:var(--primary);font-weight:600;cursor:pointer;">
                    #${r.original_sale_id}
                </span>
            </td>
            <td>${r.customer}</td>
            <td style="text-align:center;">
                <span class="badge badge-info">${r.items_returned} item(s)</span>
            </td>
            <td>
                <strong style="color:var(--danger);">-${formatCurrency(r.total_refund)}</strong>
            </td>
            <td style="font-size:12px;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                ${r.reason}
            </td>
            <td style="font-size:13px;">${r.employee}</td>
            <td style="font-size:12px;color:var(--secondary);">${r.return_date}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="viewReturn(${r.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');

    document.getElementById('paginationInfo').textContent =
        `Showing ${start + 1}–${Math.min(start + pageSize, filteredReturns.length)} of ${filteredReturns.length} returns`;

    renderPagination();
}

// ===== PAGINATION =====
function renderPagination() {
    const totalPages = Math.ceil(filteredReturns.length / pageSize);
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

// ===== NEW RETURN MODAL =====
function openNewReturnModal() {
    foundSale = null;
    document.getElementById('saleSearchInput').value = '';
    document.getElementById('step2').style.display   = 'none';
    document.getElementById('saleNotFound').style.display = 'none';
    document.getElementById('processReturnBtn').style.display = 'none';
    openModal('newReturnModal');
}

// ===== FIND SALE =====
function findSale() {
    const saleId = parseInt(document.getElementById('saleSearchInput').value.trim());
    const sale   = demoSales.find(s => s.id === saleId);

    if (!sale) {
        document.getElementById('saleNotFound').style.display = 'flex';
        document.getElementById('step2').style.display = 'none';
        document.getElementById('processReturnBtn').style.display = 'none';
        return;
    }

    foundSale = sale;
    document.getElementById('saleNotFound').style.display = 'none';
    document.getElementById('foundSaleId').textContent    = sale.id;
    document.getElementById('foundCustomer').textContent  = sale.customer;
    document.getElementById('foundTotal').textContent     = formatCurrency(sale.grand_total);

    // Render items
    document.getElementById('returnItemsBody').innerHTML = sale.items.map((item, idx) => `
        <tr>
            <td style="padding:8px;">
                <input type="checkbox" class="return-check" data-idx="${idx}"
                    onchange="updateReturnTotal()">
            </td>
            <td style="padding:8px;font-weight:600;">${item.prod_name}</td>
            <td style="padding:8px;text-align:center;">${item.qty}</td>
            <td style="padding:8px;">${formatCurrency(item.unit_price)}</td>
            <td style="padding:8px;">
                <input type="number" class="form-control return-qty"
                    data-idx="${idx}"
                    data-price="${item.unit_price}"
                    data-max="${item.qty}"
                    value="1" min="1" max="${item.qty}"
                    style="width:80px;font-size:13px;"
                    oninput="updateReturnTotal()" disabled>
            </td>
            <td style="padding:8px;">
                <strong class="item-refund" id="itemRefund_${idx}" style="color:var(--danger);">
                    $0.00
                </strong>
            </td>
        </tr>
    `).join('');

    // Enable qty input when checkbox checked
    document.querySelectorAll('.return-check').forEach(cb => {
        cb.addEventListener('change', function() {
            const idx = this.dataset.idx;
            const qtyInput = document.querySelector(`.return-qty[data-idx="${idx}"]`);
            qtyInput.disabled = !this.checked;
            updateReturnTotal();
        });
    });

    document.getElementById('step2').style.display = 'block';
    document.getElementById('processReturnBtn').style.display = 'inline-flex';
    document.getElementById('totalRefundDisplay').textContent = '$0.00';
}

// ===== UPDATE RETURN TOTAL =====
function updateReturnTotal() {
    let total = 0;

    document.querySelectorAll('.return-check').forEach(cb => {
        const idx      = cb.dataset.idx;
        const qtyInput = document.querySelector(`.return-qty[data-idx="${idx}"]`);
        const refundEl = document.getElementById(`itemRefund_${idx}`);

        if (cb.checked) {
            const qty    = parseFloat(qtyInput.value) || 1;
            const price  = parseFloat(qtyInput.dataset.price);
            const amount = qty * price;
            total += amount;
            refundEl.textContent = formatCurrency(amount);
        } else {
            refundEl.textContent = '$0.00';
        }
    });

    document.getElementById('totalRefundDisplay').textContent = formatCurrency(total);
}

// ===== PROCESS RETURN =====
async function processReturn() {
    const reason = document.getElementById('returnReason').value;
    if (!reason) { showToast('Please select a return reason', 'warning'); return; }

    const selectedItems = [];
    document.querySelectorAll('.return-check:checked').forEach(cb => {
        const idx      = cb.dataset.idx;
        const qtyInput = document.querySelector(`.return-qty[data-idx="${idx}"]`);
        const item     = foundSale.items[idx];
        selectedItems.push({
            sale_item_id:  item.id,
            prod_name:     item.prod_name,
            qty_return:    parseFloat(qtyInput.value),
            refund_amount: parseFloat(qtyInput.value) * item.unit_price,
        });
    });

    if (selectedItems.length === 0) {
        showToast('Please select at least one item to return', 'warning');
        return;
    }

    const totalRefund = selectedItems.reduce((s, i) => s + i.refund_amount, 0);

    const payload = {
        original_sale_id: foundSale.id,
        employee_id:      1,
        reason:           reason + (document.getElementById('returnNotes').value
                            ? ' — ' + document.getElementById('returnNotes').value : ''),
        total_refund:     totalRefund,
        items:            selectedItems,
    };

    // await API.post('/sales-returns', payload);

    const newReturn = {
        id:               allReturns.length + 1,
        original_sale_id: foundSale.id,
        customer:         foundSale.customer,
        items_returned:   selectedItems.length,
        total_refund:     totalRefund,
        reason:           reason,
        employee:         'Admin',
        return_date:      new Date().toLocaleString(),
        items:            selectedItems,
    };

    allReturns.unshift(newReturn);
    filteredReturns = [...allReturns];
    updateStats();
    renderTable();
    closeModal('newReturnModal');
    showToast(`Return processed. Refund: ${formatCurrency(totalRefund)}`, 'success');
}

// ===== VIEW RETURN =====
function viewReturn(id) {
    const r = allReturns.find(x => x.id === id);
    if (!r) return;

    document.getElementById('viewReturnBody').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
            ${[
                { label: 'Return ID',     value: `#RET-${String(r.id).padStart(4,'0')}` },
                { label: 'Original Sale', value: `#${r.original_sale_id}` },
                { label: 'Customer',      value: r.customer },
                { label: 'Processed By',  value: r.employee },
                { label: 'Return Date',   value: r.return_date },
                { label: 'Reason',        value: r.reason },
            ].map(f => `
                <div style="background:var(--light);border-radius:var(--radius);padding:12px;">
                    <div style="font-size:11px;color:var(--secondary);
                        text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
                        ${f.label}
                    </div>
                    <div style="font-weight:600;font-size:13px;">${f.value}</div>
                </div>
            `).join('')}
        </div>

        <h4 style="font-size:14px;font-weight:700;margin-bottom:10px;">Returned Items</h4>
        <table style="font-size:13px;width:100%;border-collapse:collapse;">
            <thead>
                <tr style="background:var(--light);">
                    <th style="padding:10px;text-align:left;">Product</th>
                    <th style="padding:10px;text-align:center;">Qty</th>
                    <th style="padding:10px;text-align:right;">Refund</th>
                </tr>
            </thead>
            <tbody>
                ${r.items.map(i => `
                    <tr style="border-bottom:1px solid var(--border);">
                        <td style="padding:10px;">${i.prod_name}</td>
                        <td style="padding:10px;text-align:center;">${i.qty_return}</td>
                        <td style="padding:10px;text-align:right;color:var(--danger);font-weight:600;">
                            -${formatCurrency(i.refund_amount)}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="padding:12px;text-align:right;font-weight:700;">
                        Total Refund:
                    </td>
                    <td style="padding:12px;text-align:right;font-weight:700;
                        font-size:16px;color:var(--danger);">
                        -${formatCurrency(r.total_refund)}
                    </td>
                </tr>
            </tfoot>
        </table>`;

    openModal('viewReturnModal');
}

function printReturn() { window.print(); }

function exportCSV() {
    const headers = ['Return ID','Sale ID','Customer','Items','Total Refund','Reason','Employee','Date'];
    const rows = filteredReturns.map(r => [
        `RET-${String(r.id).padStart(4,'0')}`,
        r.original_sale_id, r.customer, r.items_returned,
        r.total_refund, r.reason, r.employee, r.return_date
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'sales_returns.csv'; a.click();
    showToast('Returns exported', 'success');
}

function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}