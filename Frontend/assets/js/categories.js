// ===== STATE =====
let allCategories = [];
let filteredCategories = [];
let deleteTargetId = null;
let selectedColor  = '#2563eb';

const colorOptions = [
    '#2563eb','#16a34a','#d97706','#dc2626',
    '#0891b2','#7c3aed','#db2777','#ea580c',
    '#65a30d','#0284c7','#9333ea','#e11d48',
];

const categoryIcons = {
    'Beverages':      'fa-wine-bottle',
    'Dairy':          'fa-cheese',
    'Bakery':         'fa-bread-slice',
    'Produce':        'fa-apple-alt',
    'Meat & Poultry': 'fa-drumstick-bite',
    'Snacks':         'fa-cookie',
    'Frozen Foods':   'fa-snowflake',
    'Personal Care':  'fa-pump-soap',
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    buildColorPicker();
    loadCategories();
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

// ===== COLOR PICKER =====
function buildColorPicker() {
    const container = document.getElementById('colorPicker');
    colorOptions.forEach(color => {
        const btn = document.createElement('button');
        btn.style.cssText = `
            width:30px;height:30px;border-radius:50%;
            background:${color};border:3px solid transparent;
            cursor:pointer;transition:all 0.2s;`;
        btn.title   = color;
        btn.onclick = () => selectColor(color, btn);
        if (color === selectedColor) {
            btn.style.borderColor = '#000';
            btn.style.transform   = 'scale(1.2)';
        }
        container.appendChild(btn);
    });
}

function selectColor(color, btn) {
    selectedColor = color;
    document.querySelectorAll('#colorPicker button').forEach(b => {
        b.style.borderColor = 'transparent';
        b.style.transform   = 'scale(1)';
    });
    btn.style.borderColor = '#000';
    btn.style.transform   = 'scale(1.2)';
}

function previewIcon() {
    const iconClass = document.getElementById('catIcon').value.trim();
    const preview   = document.getElementById('iconPreview');
    preview.innerHTML = `<i class="fas ${iconClass || 'fa-tag'}"></i>`;
}

// ===== LOAD CATEGORIES =====
async function loadCategories() {
    // const data = await API.get('/categories');
    allCategories = [
        { id: 1, cat_name: 'Beverages',      description: 'Drinks and beverages',       icon: 'fa-wine-bottle',    color: '#2563eb', product_count: 12, created_at: '2023-01-01' },
        { id: 2, cat_name: 'Dairy',          description: 'Milk, cheese and dairy',     icon: 'fa-cheese',         color: '#16a34a', product_count: 8,  created_at: '2023-01-01' },
        { id: 3, cat_name: 'Bakery',         description: 'Bread, cakes and pastries',  icon: 'fa-bread-slice',    color: '#d97706', product_count: 15, created_at: '2023-01-01' },
        { id: 4, cat_name: 'Produce',        description: 'Fresh fruits and vegetables',icon: 'fa-apple-alt',      color: '#16a34a', product_count: 22, created_at: '2023-01-01' },
        { id: 5, cat_name: 'Meat & Poultry', description: 'Fresh and frozen meats',     icon: 'fa-drumstick-bite', color: '#dc2626', product_count: 10, created_at: '2023-01-01' },
        { id: 6, cat_name: 'Snacks',         description: 'Chips, nuts and snacks',     icon: 'fa-cookie',         color: '#ea580c', product_count: 18, created_at: '2023-01-01' },
        { id: 7, cat_name: 'Frozen Foods',   description: 'Frozen meals and items',     icon: 'fa-snowflake',      color: '#0891b2', product_count: 9,  created_at: '2023-02-15' },
        { id: 8, cat_name: 'Personal Care',  description: 'Hygiene and personal care',  icon: 'fa-pump-soap',      color: '#7c3aed', product_count: 14, created_at: '2023-02-15' },
    ];

    filteredCategories = [...allCategories];
    renderCards();
    renderTable();
}

// ===== RENDER CARDS =====
function renderCards() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = allCategories.map(c => `
        <div style="background:var(--white);border:1px solid var(--border);
            border-radius:var(--radius-lg);padding:20px;
            transition:all 0.2s;cursor:pointer;position:relative;overflow:hidden;"
            onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'"
            onmouseout="this.style.transform='';this.style.boxShadow=''">

            <!-- Color accent bar -->
            <div style="position:absolute;top:0;left:0;right:0;height:4px;
                background:${c.color};border-radius:var(--radius-lg) var(--radius-lg) 0 0;">
            </div>

            <div style="display:flex;align-items:flex-start;gap:14px;margin-top:8px;">
                <div style="width:52px;height:52px;border-radius:var(--radius);
                    background:${c.color}20;display:flex;align-items:center;
                    justify-content:center;font-size:22px;color:${c.color};flex-shrink:0;">
                    <i class="fas ${c.icon}"></i>
                </div>
                <div style="flex:1;min-width:0;">
                    <h4 style="font-size:15px;font-weight:700;margin-bottom:4px;">
                        ${c.cat_name}
                    </h4>
                    <p style="font-size:12px;color:var(--secondary);
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${c.description || 'No description'}
                    </p>
                </div>
            </div>

            <div style="display:flex;justify-content:space-between;
                align-items:center;margin-top:16px;padding-top:12px;
                border-top:1px solid var(--border);">
                <span style="font-size:13px;color:var(--secondary);">
                    <strong style="color:${c.color};font-size:18px;">
                        ${c.product_count}
                    </strong> products
                </span>
                <div style="display:flex;gap:6px;">
                    <button class="btn btn-outline btn-sm"
                        onclick="openEditModal(${c.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm"
                        onclick="openDeleteModal(${c.id},'${c.cat_name}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== RENDER TABLE =====
function renderTable() {
    const tbody = document.getElementById('categoriesTable');

    if (filteredCategories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--secondary)">
            <i class="fas fa-tags fa-2x"></i><br><br>No categories found</td></tr>`;
        return;
    }

    tbody.innerHTML = filteredCategories.map(c => `
        <tr>
            <td>
                <div style="width:40px;height:40px;border-radius:var(--radius);
                    background:${c.color}20;display:flex;align-items:center;
                    justify-content:center;font-size:18px;color:${c.color};">
                    <i class="fas ${c.icon}"></i>
                </div>
            </td>
            <td>
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:10px;height:10px;border-radius:50%;
                        background:${c.color};flex-shrink:0;"></div>
                    <strong>${c.cat_name}</strong>
                </div>
            </td>
            <td style="color:var(--secondary);font-size:13px;">
                ${c.description || '—'}
            </td>
            <td>
                <span class="badge badge-info">${c.product_count} products</span>
            </td>
            <td style="font-size:12px;color:var(--secondary);">
                ${formatDate(c.created_at)}
            </td>
            <td>
                <div style="display:flex;gap:6px;">
                    <button class="btn btn-outline btn-sm"
                        onclick="openEditModal(${c.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm"
                        onclick="openDeleteModal(${c.id},'${c.cat_name}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ===== FILTER =====
function filterCategories() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    filteredCategories = allCategories.filter(c =>
        c.cat_name.toLowerCase().includes(search) ||
        (c.description && c.description.toLowerCase().includes(search))
    );
    renderTable();
}

// ===== MODALS =====
function openAddModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus"></i> Add Category';
    document.getElementById('categoryId').value = '';
    document.getElementById('catName').value    = '';
    document.getElementById('catDesc').value    = '';
    document.getElementById('catIcon').value    = '';
    document.getElementById('iconPreview').innerHTML = '<i class="fas fa-tag"></i>';
    selectedColor = '#2563eb';
    document.querySelectorAll('#colorPicker button').forEach((b, i) => {
        b.style.borderColor = colorOptions[i] === selectedColor ? '#000' : 'transparent';
        b.style.transform   = colorOptions[i] === selectedColor ? 'scale(1.2)' : 'scale(1)';
    });
    openModal('categoryModal');
}

function openEditModal(id) {
    const c = allCategories.find(x => x.id === id);
    if (!c) return;

    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Category';
    document.getElementById('categoryId').value = c.id;
    document.getElementById('catName').value    = c.cat_name;
    document.getElementById('catDesc').value    = c.description || '';
    document.getElementById('catIcon').value    = c.icon;
    document.getElementById('iconPreview').innerHTML = `<i class="fas ${c.icon}"></i>`;

    selectedColor = c.color;
    document.querySelectorAll('#colorPicker button').forEach((b, i) => {
        b.style.borderColor = colorOptions[i] === selectedColor ? '#000' : 'transparent';
        b.style.transform   = colorOptions[i] === selectedColor ? 'scale(1.2)' : 'scale(1)';
    });

    openModal('categoryModal');
}

async function saveCategory() {
    const id      = document.getElementById('categoryId').value;
    const catName = document.getElementById('catName').value.trim();
    const catDesc = document.getElementById('catDesc').value.trim();
    const catIcon = document.getElementById('catIcon').value.trim() || 'fa-tag';

    if (!catName) { showToast('Category name is required', 'warning'); return; }

    const payload = {
        cat_name:    catName,
        description: catDesc,
        icon:        catIcon,
        color:       selectedColor,
    };

    if (id) {
        // await API.put(`/categories/${id}`, payload);
        const idx = allCategories.findIndex(c => c.id == id);
        allCategories[idx] = { ...allCategories[idx], ...payload };
        showToast('Category updated successfully', 'success');
    } else {
        // await API.post('/categories', payload);
        allCategories.unshift({
            id:            Date.now(),
            ...payload,
            product_count: 0,
            created_at:    new Date().toISOString().split('T')[0],
        });
        showToast('Category added successfully', 'success');
    }

    filteredCategories = [...allCategories];
    renderCards();
    renderTable();
    closeModal('categoryModal');
}

function openDeleteModal(id, name) {
    deleteTargetId = id;
    document.getElementById('deleteCatName').textContent = name;
    openModal('deleteModal');
}

async function confirmDelete() {
    // await API.delete(`/categories/${deleteTargetId}`);
    allCategories      = allCategories.filter(c => c.id !== deleteTargetId);
    filteredCategories = filteredCategories.filter(c => c.id !== deleteTargetId);
    renderCards();
    renderTable();
    closeModal('deleteModal');
    showToast('Category deleted successfully', 'success');
}

function exportCSV() {
    const headers = ['Name', 'Description', 'Icon', 'Color', 'Products', 'Created'];
    const rows = filteredCategories.map(c => [
        c.cat_name, c.description || '', c.icon, c.color, c.product_count, c.created_at
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'categories.csv'; a.click();
    showToast('Categories exported', 'success');
}

function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}