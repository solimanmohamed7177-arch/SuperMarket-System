// ===== STATE =====
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const pageSize = 10;
let deleteTargetId = null;
let categories = [];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadCategories();
    loadProducts();
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

// ===== LOAD CATEGORIES =====
async function loadCategories() {
    // const data = await API.get('/categories');
    categories = [
        { id: 1, cat_name: 'Beverages' },
        { id: 2, cat_name: 'Dairy' },
        { id: 3, cat_name: 'Bakery' },
        { id: 4, cat_name: 'Produce' },
        { id: 5, cat_name: 'Meat & Poultry' },
        { id: 6, cat_name: 'Snacks' },
    ];

    const filterSel = document.getElementById('categoryFilter');
    const formSel = document.getElementById('categoryId');

    categories.forEach(c => {
        filterSel.innerHTML += `<option value="${c.id}">${c.cat_name}</option>`;
        formSel.innerHTML += `<option value="${c.id}">${c.cat_name}</option>`;
    });

    document.getElementById('statCategories').textContent = categories.length;
}

// ===== LOAD PRODUCTS =====
async function loadProducts() {
    // const data = await API.get('/products');
    allProducts = [
        { id: 1, sku: 'BEV-001', barcode: '1234567890', prod_name: 'Coca Cola 500ml', category_id: 1, category_name: 'Beverages', unit_price: 1.50, cost_price: 0.90, unit_type: 'bottle', tax_rate: 5.00, is_active: 1, image_url: '' },
        { id: 2, sku: 'DAI-001', barcode: '2345678901', prod_name: 'Full Cream Milk 1L', category_id: 2, category_name: 'Dairy', unit_price: 2.20, cost_price: 1.40, unit_type: 'liter', tax_rate: 0.00, is_active: 1, image_url: '' },
        { id: 3, sku: 'BAK-001', barcode: '3456789012', prod_name: 'White Bread Loaf', category_id: 3, category_name: 'Bakery', unit_price: 1.80, cost_price: 1.00, unit_type: 'pc', tax_rate: 0.00, is_active: 1, image_url: '' },
        { id: 4, sku: 'PRO-001', barcode: '4567890123', prod_name: 'Banana 1kg', category_id: 4, category_name: 'Produce', unit_price: 0.99, cost_price: 0.50, unit_type: 'kg', tax_rate: 0.00, is_active: 1, image_url: '' },
        { id: 5, sku: 'MEA-001', barcode: '5678901234', prod_name: 'Chicken Breast 1kg', category_id: 5, category_name: 'Meat & Poultry', unit_price: 8.50, cost_price: 5.20, unit_type: 'kg', tax_rate: 5.00, is_active: 1, image_url: '' },
        { id: 6, sku: 'SNK-001', barcode: '6789012345', prod_name: 'Lays Chips 150g', category_id: 6, category_name: 'Snacks', unit_price: 2.50, cost_price: 1.50, unit_type: 'pc', tax_rate: 5.00, is_active: 0, image_url: '' },
        { id: 7, sku: 'BEV-002', barcode: '7890123456', prod_name: 'Orange Juice 1L', category_id: 1, category_name: 'Beverages', unit_price: 3.20, cost_price: 1.80, unit_type: 'liter', tax_rate: 5.00, is_active: 1, image_url: '' },
        { id: 8, sku: 'DAI-002', barcode: '8901234567', prod_name: 'Cheddar Cheese 200g', category_id: 2, category_name: 'Dairy', unit_price: 4.50, cost_price: 2.80, unit_type: 'pc', tax_rate: 5.00, is_active: 1, image_url: '' },
    ];

    filteredProducts = [...allProducts];
    updateStats();
    renderTable();
}

// ===== UPDATE STATS =====
function updateStats() {
    document.getElementById('statTotal').textContent = allProducts.length;
    document.getElementById('statActive').textContent = allProducts.filter(p => p.is_active).length;
    document.getElementById('statLowStock').textContent = 3; // from inventory
}

// ===== FILTER =====
function filterProducts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const catFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredProducts = allProducts.filter(p => {
        const matchSearch = p.prod_name.toLowerCase().includes(search) ||
                            p.sku.toLowerCase().includes(search) ||
                            (p.barcode && p.barcode.includes(search));
        const matchCat = !catFilter || p.category_id == catFilter;
        const matchStatus = statusFilter === '' || p.is_active == statusFilter;
        return matchSearch && matchCat && matchStatus;
    });

    currentPage = 1;
    renderTable();
}

// ===== RENDER TABLE =====
function renderTable() {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredProducts.slice(start, end);

    const tbody = document.getElementById('productsTable');

    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;padding:40px;color:var(--secondary)">
                    <i class="fas fa-box-open fa-2x"></i><br><br>No products found
                </td>
            </tr>`;
        document.getElementById('paginationInfo').textContent = 'No products found';
        document.getElementById('paginationControls').innerHTML = '';
        return;
    }

    tbody.innerHTML = pageData.map(p => `
        <tr>
            <td><input type="checkbox" class="row-check" value="${p.id}"></td>
            <td><code style="background:var(--light);padding:2px 8px;border-radius:4px;font-size:12px;">${p.sku}</code></td>
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;background:var(--primary-light);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--primary);">
                        <i class="fas fa-box" style="font-size:14px;"></i>
                    </div>
                    <div>
                        <div style="font-weight:600;">${p.prod_name}</div>
                        <div style="font-size:11px;color:var(--secondary);">${p.barcode || 'No barcode'}</div>
                    </div>
                </div>
            </td>
            <td><span class="badge badge-info">${p.category_name}</span></td>
            <td><strong style="color:var(--success);">${formatCurrency(p.unit_price)}</strong></td>
            <td style="color:var(--secondary);">${formatCurrency(p.cost_price)}</td>
            <td><span class="badge badge-secondary">${p.unit_type}</span></td>
            <td>${p.tax_rate}%</td>
            <td>${p.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'}</td>
            <td>
                <div style="display:flex;gap:6px;">
                    <button class="btn btn-outline btn-sm" onclick="openEditModal(${p.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${p.id}, '${p.prod_name}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Pagination info
    document.getElementById('paginationInfo').textContent =
        `Showing ${start + 1}–${Math.min(end, filteredProducts.length)} of ${filteredProducts.length} products`;

    renderPagination();
}

// ===== PAGINATION =====
function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const ctrl = document.getElementById('paginationControls');
    ctrl.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { currentPage--; renderTable(); };
    ctrl.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => { currentPage = i; renderTable(); };
        ctrl.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { currentPage++; renderTable(); };
    ctrl.appendChild(nextBtn);
}

// ===== MODALS =====
function openAddModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus"></i> Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    openModal('productModal');
}

function openEditModal(id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Product';
    document.getElementById('productId').value = p.id;
    document.getElementById('sku').value = p.sku;
    document.getElementById('barcode').value = p.barcode || '';
    document.getElementById('prodName').value = p.prod_name;
    document.getElementById('categoryId').value = p.category_id;
    document.getElementById('unitType').value = p.unit_type;
    document.getElementById('unitPrice').value = p.unit_price;
    document.getElementById('costPrice').value = p.cost_price;
    document.getElementById('taxRate').value = p.tax_rate;
    document.getElementById('isActive').value = p.is_active;
    document.getElementById('imageUrl').value = p.image_url || '';

    openModal('productModal');
}

function openDeleteModal(id, name) {
    deleteTargetId = id;
    document.getElementById('deleteProductName').textContent = name;
    openModal('deleteModal');
}

async function saveProduct() {
    const id = document.getElementById('productId').value;
    const payload = {
        sku: document.getElementById('sku').value,
        barcode: document.getElementById('barcode').value,
        prod_name: document.getElementById('prodName').value,
        category_id: parseInt(document.getElementById('categoryId').value),
        unit_type: document.getElementById('unitType').value,
        unit_price: parseFloat(document.getElementById('unitPrice').value),
        cost_price: parseFloat(document.getElementById('costPrice').value),
        tax_rate: parseFloat(document.getElementById('taxRate').value),
        is_active: parseInt(document.getElementById('isActive').value),
        image_url: document.getElementById('imageUrl').value,
    };

    if (!payload.sku || !payload.prod_name || !payload.category_id || !payload.unit_type) {
        showToast('Please fill all required fields', 'warning');
        return;
    }

    if (id) {
        // await API.put(`/products/${id}`, payload);
        const idx = allProducts.findIndex(p => p.id == id);
        const cat = categories.find(c => c.id == payload.category_id);
        allProducts[idx] = { ...allProducts[idx], ...payload, category_name: cat?.cat_name || '' };
        showToast('Product updated successfully', 'success');
    } else {
        // await API.post('/products', payload);
        const cat = categories.find(c => c.id == payload.category_id);
        const newProd = { id: Date.now(), ...payload, category_name: cat?.cat_name || '' };
        allProducts.unshift(newProd);
        showToast('Product added successfully', 'success');
    }

    filteredProducts = [...allProducts];
    renderTable();
    updateStats();
    closeModal('productModal');
}

async function confirmDelete() {
    // await API.delete(`/products/${deleteTargetId}`);
    allProducts = allProducts.filter(p => p.id !== deleteTargetId);
    filteredProducts = filteredProducts.filter(p => p.id !== deleteTargetId);
    renderTable();
    updateStats();
    closeModal('deleteModal');
    showToast('Product deleted successfully', 'success');
}

// ===== SELECT ALL =====
function toggleSelectAll() {
    const checked = document.getElementById('selectAll').checked;
    document.querySelectorAll('.row-check').forEach(cb => cb.checked = checked);
}

// ===== EXPORT CSV =====
function exportCSV() {
    const headers = ['SKU', 'Product Name', 'Category', 'Unit Price', 'Cost Price', 'Unit Type', 'Tax Rate', 'Status'];
    const rows = filteredProducts.map(p => [
        p.sku, p.prod_name, p.category_name, p.unit_price, p.cost_price, p.unit_type, p.tax_rate, p.is_active ? 'Active' : 'Inactive'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    showToast('Products exported successfully', 'success');
}

// ===== HELPERS =====
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}