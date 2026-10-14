// ===== STATE =====
let allEmployees    = [];
let filteredEmployees = [];
let currentPage     = 1;
const pageSize      = 10;
let deleteTargetId  = null;

let roles       = [];
let departments = [];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadRoles();
    loadDepartments();
    loadEmployees();
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

// ===== LOAD ROLES =====
async function loadRoles() {
    // const data = await API.get('/roles');
    roles = [
        { id: 1, r_name: 'Manager' },
        { id: 2, r_name: 'Cashier' },
        { id: 3, r_name: 'Stock Clerk' },
        { id: 4, r_name: 'Supervisor' },
        { id: 5, r_name: 'Accountant' },
    ];

    const roleFilter = document.getElementById('roleFilter');
    const roleSelect = document.getElementById('empRole');

    roles.forEach(r => {
        roleFilter.innerHTML += `<option value="${r.id}">${r.r_name}</option>`;
        roleSelect.innerHTML += `<option value="${r.id}">${r.r_name}</option>`;
    });
}

// ===== LOAD DEPARTMENTS =====
async function loadDepartments() {
    // const data = await API.get('/departments');
    departments = [
        { id: 1, dep_n: 'Sales' },
        { id: 2, dep_n: 'Inventory' },
        { id: 3, dep_n: 'Finance' },
        { id: 4, dep_n: 'HR' },
        { id: 5, dep_n: 'IT' },
    ];

    const deptFilter = document.getElementById('deptFilter');
    const deptSelect = document.getElementById('empDept');

    departments.forEach(d => {
        deptFilter.innerHTML += `<option value="${d.id}">${d.dep_n}</option>`;
        deptSelect.innerHTML += `<option value="${d.id}">${d.dep_n}</option>`;
    });
}

// ===== LOAD EMPLOYEES =====
async function loadEmployees() {
    // const data = await API.get('/employees');
    allEmployees = [
        {
            id: 1, first_n: 'John',    last_n: 'Doe',
            national_ID: 'NID-001', email: 'john.doe@market.com',
            dep_id: 1, dep_name: 'Sales',
            role_id: 1, role_name: 'Manager',
            salary: 5000.00, hire_date: '2020-03-15', is_active: 1
        },
        {
            id: 2, first_n: 'Jane',    last_n: 'Smith',
            national_ID: 'NID-002', email: 'jane.smith@market.com',
            dep_id: 1, dep_name: 'Sales',
            role_id: 2, role_name: 'Cashier',
            salary: 2500.00, hire_date: '2021-06-01', is_active: 1
        },
        {
            id: 3, first_n: 'Bob',     last_n: 'Johnson',
            national_ID: 'NID-003', email: 'bob.j@market.com',
            dep_id: 2, dep_name: 'Inventory',
            role_id: 3, role_name: 'Stock Clerk',
            salary: 2200.00, hire_date: '2022-01-10', is_active: 1
        },
        {
            id: 4, first_n: 'Alice',   last_n: 'Brown',
            national_ID: 'NID-004', email: 'alice.b@market.com',
            dep_id: 3, dep_name: 'Finance',
            role_id: 5, role_name: 'Accountant',
            salary: 3800.00, hire_date: '2021-09-20', is_active: 1
        },
        {
            id: 5, first_n: 'Charlie', last_n: 'Wilson',
            national_ID: 'NID-005', email: 'charlie.w@market.com',
            dep_id: 1, dep_name: 'Sales',
            role_id: 4, role_name: 'Supervisor',
            salary: 3500.00, hire_date: '2019-11-05', is_active: 0
        },
        {
            id: 6, first_n: 'Diana',   last_n: 'Prince',
            national_ID: 'NID-006', email: 'diana.p@market.com',
            dep_id: 4, dep_name: 'HR',
            role_id: 1, role_name: 'Manager',
            salary: 4800.00, hire_date: '2020-07-14', is_active: 1
        },
    ];

    filteredEmployees = [...allEmployees];
    updateStats();
    renderTable();
}

// ===== STATS =====
function updateStats() {
    const active   = allEmployees.filter(e => e.is_active);
    const managers = allEmployees.filter(e => e.role_name === 'Manager');
    const avgSalary = active.length
        ? active.reduce((s, e) => s + e.salary, 0) / active.length
        : 0;

    document.getElementById('statTotal').textContent    = allEmployees.length;
    document.getElementById('statActive').textContent   = active.length;
    document.getElementById('statManagers').textContent = managers.length;
    document.getElementById('statAvgSalary').textContent = formatCurrency(avgSalary);
}

// ===== FILTER =====
function filterEmployees() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const roleId = document.getElementById('roleFilter').value;
    const deptId = document.getElementById('deptFilter').value;
    const status = document.getElementById('statusFilter').value;

    filteredEmployees = allEmployees.filter(e => {
        const fullName    = `${e.first_n} ${e.last_n}`.toLowerCase();
        const matchSearch = fullName.includes(search) ||
                            e.email.toLowerCase().includes(search) ||
                            (e.national_ID && e.national_ID.toLowerCase().includes(search));
        const matchRole   = !roleId || e.role_id == roleId;
        const matchDept   = !deptId || e.dep_id == deptId;
        const matchStatus = status === '' || e.is_active == status;
        return matchSearch && matchRole && matchDept && matchStatus;
    });

    currentPage = 1;
    renderTable();
}

// ===== RENDER TABLE =====
function renderTable() {
    const start    = (currentPage - 1) * pageSize;
    const pageData = filteredEmployees.slice(start, start + pageSize);
    const tbody    = document.getElementById('employeesTable');

    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;padding:40px;color:var(--secondary)">
                    <i class="fas fa-user-slash fa-2x"></i><br><br>No employees found
                </td>
            </tr>`;
        document.getElementById('paginationInfo').textContent = '';
        document.getElementById('paginationControls').innerHTML = '';
        return;
    }

    // Role color map
    const roleColors = {
        'Manager':     'badge-primary',
        'Supervisor':  'badge-info',
        'Cashier':     'badge-success',
        'Stock Clerk': 'badge-warning',
        'Accountant':  'badge-secondary',
    };

    tbody.innerHTML = pageData.map(e => `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:40px;height:40px;border-radius:50%;
                        background:linear-gradient(135deg,var(--primary),var(--info));
                        display:flex;align-items:center;justify-content:center;
                        color:white;font-weight:700;font-size:15px;flex-shrink:0;">
                        ${e.first_n.charAt(0)}${e.last_n.charAt(0)}
                    </div>
                    <div>
                        <div style="font-weight:600;">${e.first_n} ${e.last_n}</div>
                        <div style="font-size:11px;color:var(--secondary);">ID #${e.id}</div>
                    </div>
                </div>
            </td>
            <td>
                <code style="background:var(--light);padding:2px 8px;
                    border-radius:4px;font-size:12px;">
                    ${e.national_ID || '—'}
                </code>
            </td>
            <td style="font-size:13px;">${e.email}</td>
            <td>${e.dep_name || '—'}</td>
            <td>
                <span class="badge ${roleColors[e.role_name] || 'badge-secondary'}">
                    ${e.role_name}
                </span>
            </td>
            <td><strong style="color:var(--success);">${formatCurrency(e.salary)}</strong></td>
            <td style="font-size:13px;">${formatDate(e.hire_date)}</td>
            <td>
                ${e.is_active
                    ? '<span class="badge badge-success">Active</span>'
                    : '<span class="badge badge-danger">Inactive</span>'}
            </td>
            <td>
                <div style="display:flex;gap:6px;">
                    <button class="btn btn-outline btn-sm"
                        onclick="viewEmployee(${e.id})" title="View Profile">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline btn-sm"
                        onclick="openEditModal(${e.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm"
                        onclick="openDeleteModal(${e.id},'${e.first_n} ${e.last_n}')"
                        title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    document.getElementById('paginationInfo').textContent =
        `Showing ${start + 1}–${Math.min(start + pageSize, filteredEmployees.length)} of ${filteredEmployees.length} employees`;

    renderPagination();
}

// ===== PAGINATION =====
function renderPagination() {
    const totalPages = Math.ceil(filteredEmployees.length / pageSize);
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
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => { currentPage = i; renderTable(); };
        ctrl.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-btn';
    next.innerHTML = '<i class="fas fa-chevron-right"></i>';
    next.disabled  = currentPage === totalPages;
    next.onclick   = () => { currentPage++; renderTable(); };
    ctrl.appendChild(next);
}

// ===== VIEW EMPLOYEE =====
function viewEmployee(id) {
    const e = allEmployees.find(x => x.id === id);
    if (!e) return;

    document.getElementById('viewEmployeeBody').innerHTML = `
        <!-- Avatar & Name -->
        <div style="text-align:center;padding:20px 0 16px;">
            <div style="width:72px;height:72px;border-radius:50%;
                background:linear-gradient(135deg,var(--primary),var(--info));
                display:flex;align-items:center;justify-content:center;
                color:white;font-weight:700;font-size:26px;margin:0 auto 12px;">
                ${e.first_n.charAt(0)}${e.last_n.charAt(0)}
            </div>
            <h3 style="font-size:18px;font-weight:700;">${e.first_n} ${e.last_n}</h3>
            <span class="badge badge-primary" style="margin-top:4px;">${e.role_name}</span>
        </div>

        <!-- Info Grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 4px 8px;">
            ${[
                { icon: 'fa-id-card',      label: 'National ID',  value: e.national_ID || '—' },
                { icon: 'fa-envelope',     label: 'Email',        value: e.email },
                { icon: 'fa-building',     label: 'Department',   value: e.dep_name || '—' },
                { icon: 'fa-user-tag',     label: 'Role',         value: e.role_name },
                { icon: 'fa-dollar-sign',  label: 'Salary',       value: formatCurrency(e.salary) },
                { icon: 'fa-calendar-alt', label: 'Hire Date',    value: formatDate(e.hire_date) },
            ].map(item => `
                <div style="background:var(--light);border-radius:var(--radius);padding:12px;">
                    <div style="font-size:11px;color:var(--secondary);
                        text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">
                        <i class="fas ${item.icon}"></i> ${item.label}
                    </div>
                    <div style="font-weight:600;font-size:13px;">${item.value}</div>
                </div>
            `).join('')}
        </div>

        <!-- Status -->
        <div style="text-align:center;padding:8px 0;">
            ${e.is_active
                ? '<span class="badge badge-success" style="font-size:13px;padding:6px 16px;">● Active Employee</span>'
                : '<span class="badge badge-danger"  style="font-size:13px;padding:6px 16px;">● Inactive Employee</span>'}
        </div>`;

    openModal('viewEmployeeModal');
}

// ===== ADD / EDIT MODALS =====
function openAddModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus"></i> Add Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    document.getElementById('hireDate').value   = new Date().toISOString().split('T')[0];
    openModal('employeeModal');
}

function openEditModal(id) {
    const e = allEmployees.find(x => x.id === id);
    if (!e) return;

    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Employee';
    document.getElementById('employeeId').value = e.id;
    document.getElementById('firstName').value  = e.first_n;
    document.getElementById('lastName').value   = e.last_n;
    document.getElementById('nationalId').value = e.national_ID || '';
    document.getElementById('empEmail').value   = e.email;
    document.getElementById('empDept').value    = e.dep_id || '';
    document.getElementById('empRole').value    = e.role_id || '';
    document.getElementById('empSalary').value  = e.salary;
    document.getElementById('hireDate').value   = e.hire_date;
    document.getElementById('empStatus').value  = e.is_active;

    openModal('employeeModal');
}

async function saveEmployee() {
    const id = document.getElementById('employeeId').value;

    const payload = {
        first_n:     document.getElementById('firstName').value.trim(),
        last_n:      document.getElementById('lastName').value.trim(),
        national_ID: document.getElementById('nationalId').value.trim(),
        email:       document.getElementById('empEmail').value.trim(),
        dep_id:      parseInt(document.getElementById('empDept').value) || null,
        role_id:     parseInt(document.getElementById('empRole').value) || null,
        salary:      parseFloat(document.getElementById('empSalary').value) || 0,
        hire_date:   document.getElementById('hireDate').value,
        is_active:   parseInt(document.getElementById('empStatus').value),
    };

    if (!payload.first_n || !payload.last_n || !payload.email) {
        showToast('Please fill all required fields', 'warning');
        return;
    }

    const dept = departments.find(d => d.id === payload.dep_id);
    const role = roles.find(r => r.id === payload.role_id);

    if (id) {
        // await API.put(`/employees/${id}`, payload);
        const idx = allEmployees.findIndex(e => e.id == id);
        allEmployees[idx] = {
            ...allEmployees[idx], ...payload,
            dep_name:  dept?.dep_n   || '—',
            role_name: role?.r_name  || '—',
        };
        showToast('Employee updated successfully', 'success');
    } else {
        // await API.post('/employees', payload);
        allEmployees.unshift({
            id: Date.now(), ...payload,
            dep_name:  dept?.dep_n  || '—',
            role_name: role?.r_name || '—',
        });
        showToast('Employee added successfully', 'success');
    }

    filteredEmployees = [...allEmployees];
    updateStats();
    renderTable();
    closeModal('employeeModal');
}

// ===== DELETE =====
function openDeleteModal(id, name) {
    deleteTargetId = id;
    document.getElementById('deleteEmployeeName').textContent = name;
    openModal('deleteModal');
}

async function confirmDelete() {
    // await API.delete(`/employees/${deleteTargetId}`);
    allEmployees      = allEmployees.filter(e => e.id !== deleteTargetId);
    filteredEmployees = filteredEmployees.filter(e => e.id !== deleteTargetId);
    updateStats();
    renderTable();
    closeModal('deleteModal');
    showToast('Employee deleted successfully', 'success');
}

// ===== EXPORT CSV =====
function exportCSV() {
    const headers = ['Name', 'National ID', 'Email', 'Department', 'Role', 'Salary', 'Hire Date', 'Status'];
    const rows = filteredEmployees.map(e => [
        `${e.first_n} ${e.last_n}`,
        e.national_ID || '',
        e.email,
        e.dep_name || '',
        e.role_name,
        e.salary,
        e.hire_date,
        e.is_active ? 'Active' : 'Inactive'
    ]);
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'employees.csv'; a.click();
    showToast('Employees exported successfully', 'success');
}

// ===== HELPERS =====
function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}