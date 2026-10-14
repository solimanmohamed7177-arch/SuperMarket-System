// ===== STATE =====
let allShifts = [];
let filteredShifts = [];
let currentPage = 1;
const pageSize = 10;
let activeShift = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadShifts();
    updateStartTime();
    setInterval(updateStartTime, 1000);
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

function updateStartTime() {
    const el = document.getElementById('shiftStartTime');
    if (el) el.textContent = new Date().toLocaleString();
}

// ===== LOAD SHIFTS =====
async function loadShifts() {
    // const data = await API.get('/shifts');
    allShifts = [
        {
            id: 1, employee: 'Jane Smith',
            register: 'Register 1 — Main Branch',
            start_time: '2024-01-15 08:00',
            end_time:   '2024-01-15 16:00',
            opening_cash: 200.00,
            closing_cash: 1850.00,
            total_sales:  1650.00,
            total_orders: 42,
            status: 'closed'
        },
        {
            id: 2, employee: 'John Doe',
            register: 'Register 2 — Main Branch',
            start_time: '2024-01-15 08:00',
            end_time:   '2024-01-15 16:00',
            opening_cash: 150.00,
            closing_cash: 2100.00,
            total_sales:  1950.00,
            total_orders: 55,
            status: 'closed'
        },
        {
            id: 3, employee: 'Bob Johnson',
            register: 'Register 1 — Branch 2',
            start_time: '2024-01-15 16:00',
            end_time:   null,
            opening_cash: 200.00,
            closing_cash: null,
            total_sales:  0,
            total_orders: 0,
            status: 'open'
        },
        {
            id: 4, employee: 'Jane Smith',
            register: 'Register 1 — Main Branch',
            start_time: '2024-01-14 08:00',
            end_time:   '2024-01-14 16:00',
            opening_cash: 200.00,
            closing_cash: 1650.00,
            total_sales:  1450.00,
            total_orders: 38,
            status: 'closed'
        },
        {
            id: 5, employee: 'Diana Prince',
            register: 'Register 2 — Main Branch',
            start_time: '2024-01-14 16:00',
            end_time:   '2024-01-14 23:59',
            opening_cash: 300.00,
            closing_cash: 280.00,
            total_sales:  0,
            total_orders: 0,
            status: 'cancelled'
        },
        {
            id: 6, employee: 'John Doe',
            register: 'Register 1 — Main Branch',
            start_time: '2024-01-13 08:00',
            end_time:   '2024-01-13 16:00',
            opening_cash: 200.00,
            closing_cash: 2250.00,
            total_sales:  2050.00,
            total_orders: 61,
            status: 'closed'
        },
    ];

    // Check for active shift
    activeShift = allShifts.find(s => s.status === 'open') || null;
    updateActiveShiftBanner();

    filteredShifts = [...allShifts];
    updateStats();
    renderTable();
}

// ===== ACTIVE SHIFT BANNER =====
function updateActiveShiftBanner() {
    const banner = document.getElementById('activeShiftsBanner');
    if (!banner) return;

    if (activeShift) {
        banner.style.display = 'flex';
        document.getElementById('activeShiftInfo').textContent =
            `Active Shift: ${activeShift.employee} — ${activeShift.register} ` +
            `(Started: ${activeShift.start_time})`;
    } else {
        banner.style.display = 'none';
    }
}

// ===== STATS =====
function updateStats() {
    const open       = allShifts.filter(s => s.status === 'open').length;
    const totalCash  = allShifts.reduce((s, sh) => s + sh.opening_cash, 0);
    const registers  = [
        ...new Set(
            allShifts
                .filter(s => s.status === 'open')
                .map(s => s.register)
        )
    ].length;

    document.getElementById('statTotal').textContent     = allShifts.length;
    document.getElementById('statOpen').textContent      = open;
    document.getElementById('statCash').textContent      = formatCurrency(totalCash);
    document.getElementById('statRegisters').textContent = registers;
}

// ===== FILTER =====
function filterShifts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const date   = document.getElementById('dateFilter').value;

    filteredShifts = allShifts.filter(s => {
        const matchSearch =
            s.employee.toLowerCase().includes(search) ||
            s.register.toLowerCase().includes(search);
        const matchStatus = !status || s.status === status;
        const matchDate   = !date   || s.start_time.startsWith(date);
        return matchSearch && matchStatus && matchDate;
    });

    currentPage = 1;
    renderTable();
}

// ===== RENDER TABLE =====
function renderTable() {
    const start    = (currentPage - 1) * pageSize;
    const pageData = filteredShifts.slice(start, start + pageSize);
    const tbody    = document.getElementById('shiftsTable');

    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10"
                    style="text-align:center;padding:40px;color:var(--secondary)">
                    <i class="fas fa-clock fa-2x"></i><br><br>No shifts found
                </td>
            </tr>`;
        document.getElementById('paginationInfo').textContent = '';
        document.getElementById('paginationControls').innerHTML = '';
        return;
    }

    tbody.innerHTML = pageData.map(s => {
        const diff = s.closing_cash !== null
            ? s.closing_cash - s.opening_cash
            : null;

        const diffColor = diff === null
            ? 'var(--secondary)'
            : diff >= 0
            ? 'var(--success)'
            : 'var(--danger)';

        const statusClass = {
            open:      'badge-success',
            closed:    'badge-secondary',
            cancelled: 'badge-danger',
        }[s.status] || 'badge-secondary';

        const duration = s.end_time
            ? calcDuration(s.start_time, s.end_time)
            : `<span style="color:var(--success);font-weight:600;">
                <i class="fas fa-circle" style="font-size:8px;"></i> Running
               </span>`;

        return `
        <tr>
            <td>
                <strong>#SHF-${String(s.id).padStart(4, '0')}</strong>
            </td>
            <td>
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:34px;height:34px;border-radius:50%;
                        background:linear-gradient(135deg,var(--primary),var(--info));
                        display:flex;align-items:center;justify-content:center;
                        color:white;font-weight:700;font-size:12px;flex-shrink:0;">
                        ${s.employee.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span style="font-weight:600;">${s.employee}</span>
                </div>
            </td>
            <td style="font-size:12px;color:var(--secondary);">${s.register}</td>
            <td style="font-size:12px;">${s.start_time}</td>
            <td style="font-size:12px;">${s.end_time || duration}</td>
            <td>
                <strong>${formatCurrency(s.opening_cash)}</strong>
            </td>
            <td>
                ${s.closing_cash !== null
                    ? `<strong>${formatCurrency(s.closing_cash)}</strong>`
                    : '<span style="color:var(--secondary);">—</span>'}
            </td>
            <td>
                ${diff !== null
                    ? `<strong style="color:${diffColor};">
                        ${diff >= 0 ? '+' : ''}${formatCurrency(diff)}
                       </strong>`
                    : '<span style="color:var(--secondary);">—</span>'}
            </td>
            <td>
                <span class="badge ${statusClass}">
                    ${s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                </span>
            </td>
            <td>
                <div style="display:flex;gap:6px;">
                    <button class="btn btn-outline btn-sm"
                        onclick="viewShift(${s.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${s.status === 'open' ? `
                    <button class="btn btn-danger btn-sm"
                        onclick="openCloseShiftModal(${s.id})" title="Close Shift">
                        <i class="fas fa-stop"></i>
                    </button>` : ''}
                </div>
            </td>
        </tr>`;
    }).join('');

    document.getElementById('paginationInfo').textContent =
        `Showing ${start + 1}–${Math.min(start + pageSize, filteredShifts.length)} ` +
        `of ${filteredShifts.length} shifts`;

    renderPagination();
}

// ===== DURATION HELPER =====
function calcDuration(start, end) {
    const ms   = new Date(end) - new Date(start);
    const hrs  = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
}

// ===== PAGINATION =====
function renderPagination() {
    const totalPages = Math.ceil(filteredShifts.length / pageSize);
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

// ===== START SHIFT =====
function openStartShiftModal() {
    openModal('startShiftModal');
}

async function startShift() {
    const employeeSelect = document.getElementById('shiftEmployee');
    const registerSelect = document.getElementById('shiftRegister');
    const openingCash    = parseFloat(document.getElementById('openingCash').value) || 0;

    const employeeText = employeeSelect.options[employeeSelect.selectedIndex].text;
    const registerText = registerSelect.options[registerSelect.selectedIndex].text;

    if (openingCash < 0) {
        showToast('Opening cash cannot be negative', 'warning');
        return;
    }

    // await API.post('/shifts', { employee_id, register_id, opening_cash });

    const newShift = {
        id:           allShifts.length + 1,
        employee:     employeeText,
        register:     registerText,
        start_time:   new Date().toLocaleString(),
        end_time:     null,
        opening_cash: openingCash,
        closing_cash: null,
        total_sales:  0,
        total_orders: 0,
        status:       'open',
    };

    allShifts.unshift(newShift);
    activeShift    = newShift;
    filteredShifts = [...allShifts];

    updateActiveShiftBanner();
    updateStats();
    renderTable();
    closeModal('startShiftModal');
    showToast(`Shift started for ${employeeText}`, 'success');
}

// ===== CLOSE SHIFT =====
function openCloseShiftModal(shiftId) {
    const shift = shiftId
        ? allShifts.find(s => s.id === shiftId)
        : activeShift;

    if (!shift) return;
    activeShift = shift;

    document.getElementById('closeShiftInfo').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;">
            <div>
                <span style="color:var(--secondary);">Employee:</span>
                <strong style="margin-left:6px;">${shift.employee}</strong>
            </div>
            <div>
                <span style="color:var(--secondary);">Register:</span>
                <strong style="margin-left:6px;">${shift.register}</strong>
            </div>
            <div>
                <span style="color:var(--secondary);">Started:</span>
                <strong style="margin-left:6px;">${shift.start_time}</strong>
            </div>
            <div>
                <span style="color:var(--secondary);">Opening Cash:</span>
                <strong style="margin-left:6px;">${formatCurrency(shift.opening_cash)}</strong>
            </div>
        </div>`;

    document.getElementById('closingCash').value = '';
    document.getElementById('cashDiffDisplay').style.display = 'none';
    openModal('closeShiftModal');
}

function calcCashDiff() {
    const closing = parseFloat(document.getElementById('closingCash').value) || 0;
    const opening = activeShift?.opening_cash || 0;
    const diff    = closing - opening;
    const display = document.getElementById('cashDiffDisplay');

    display.style.display    = 'block';
    display.style.background = diff >= 0 ? '#dcfce7' : '#fee2e2';
    display.style.color      = diff >= 0 ? 'var(--success)' : 'var(--danger)';
    display.innerHTML = `
        <i class="fas fa-${diff >= 0 ? 'check' : 'exclamation-triangle'}"></i>
        Cash Difference: <strong>${diff >= 0 ? '+' : ''}${formatCurrency(diff)}</strong>
        ${Math.abs(diff) > 50
            ? `<div style="font-size:12px;margin-top:4px;opacity:0.8;">
                ⚠️ Large discrepancy detected</div>`
            : ''}`;
}

async function closeShift() {
    const closingCash = parseFloat(document.getElementById('closingCash').value);

    if (isNaN(closingCash) || closingCash < 0) {
        showToast('Please enter a valid closing cash amount', 'warning');
        return;
    }

    // await API.put(`/shifts/${activeShift.id}`, { closing_cash: closingCash, status: 'closed' });

    const idx = allShifts.findIndex(s => s.id === activeShift.id);
    if (idx !== -1) {
        allShifts[idx].closing_cash = closingCash;
        allShifts[idx].end_time     = new Date().toLocaleString();
        allShifts[idx].status       = 'closed';
    }

    activeShift    = null;
    filteredShifts = [...allShifts];

    updateActiveShiftBanner();
    updateStats();
    renderTable();
    closeModal('closeShiftModal');
    showToast('Shift closed successfully', 'success');
}

// ===== VIEW SHIFT =====
function viewShift(id) {
    const s = allShifts.find(x => x.id === id);
    if (!s) return;

    const diff = s.closing_cash !== null
        ? s.closing_cash - s.opening_cash
        : null;

    const diffColor = diff === null
        ? 'var(--secondary)'
        : diff >= 0
        ? 'var(--success)'
        : 'var(--danger)';

    const statusClass = {
        open:      'badge-success',
        closed:    'badge-secondary',
        cancelled: 'badge-danger',
    }[s.status] || 'badge-secondary';

    document.getElementById('viewShiftBody').innerHTML = `
        <!-- Avatar & Name -->
        <div style="text-align:center;padding:16px 0 20px;">
            <div style="width:64px;height:64px;border-radius:50%;
                background:linear-gradient(135deg,var(--primary),var(--info));
                display:flex;align-items:center;justify-content:center;
                color:white;font-weight:700;font-size:22px;margin:0 auto 10px;">
                ${s.employee.split(' ').map(n => n[0]).join('')}
            </div>
            <h3 style="font-size:17px;font-weight:700;">${s.employee}</h3>
            <div style="font-size:13px;color:var(--secondary);margin-top:4px;">
                ${s.register}
            </div>
            <span class="badge ${statusClass}" style="margin-top:8px;font-size:13px;padding:5px 14px;">
                ${s.status.charAt(0).toUpperCase() + s.status.slice(1)}
            </span>
        </div>

        <!-- Info Grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
            ${[
                {
                    icon:  'fa-play',
                    label: 'Start Time',
                    value: s.start_time,
                    color: 'var(--success)'
                },
                {
                    icon:  'fa-stop',
                    label: 'End Time',
                    value: s.end_time || 'Still Running',
                    color: s.end_time ? 'var(--dark)' : 'var(--success)'
                },
                {
                    icon:  'fa-hourglass-half',
                    label: 'Duration',
                    value: s.end_time
                        ? calcDuration(s.start_time, s.end_time)
                        : 'Ongoing',
                    color: 'var(--dark)'
                },
                {
                    icon:  'fa-shopping-cart',
                    label: 'Total Orders',
                    value: s.total_orders,
                    color: 'var(--primary)'
                },
                {
                    icon:  'fa-money-bill-wave',
                    label: 'Opening Cash',
                    value: formatCurrency(s.opening_cash),
                    color: 'var(--dark)'
                },
                {
                    icon:  'fa-cash-register',
                    label: 'Closing Cash',
                    value: s.closing_cash !== null
                        ? formatCurrency(s.closing_cash)
                        : '—',
                    color: 'var(--dark)'
                },
                {
                    icon:  'fa-chart-line',
                    label: 'Total Sales',
                    value: formatCurrency(s.total_sales),
                    color: 'var(--success)'
                },
                {
                    icon:  'fa-balance-scale',
                    label: 'Cash Difference',
                    value: diff !== null
                        ? `${diff >= 0 ? '+' : ''}${formatCurrency(diff)}`
                        : '—',
                    color: diffColor
                },
            ].map(item => `
                <div style="background:var(--light);border-radius:var(--radius);padding:12px;">
                    <div style="font-size:11px;color:var(--secondary);
                        text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">
                        <i class="fas ${item.icon}"></i> ${item.label}
                    </div>
                    <div style="font-weight:700;font-size:14px;color:${item.color};">
                        ${item.value}
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Cash Difference Alert -->
        ${diff !== null && Math.abs(diff) > 50 ? `
        <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:var(--radius);
            padding:12px;font-size:13px;color:#92400e;display:flex;align-items:center;gap:8px;">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Large cash discrepancy detected. Please review this shift.</span>
        </div>` : ''}`;

    openModal('viewShiftModal');
}

// ===== EXPORT CSV =====
function exportCSV() {
    const headers = [
        'Shift ID', 'Employee', 'Register',
        'Start Time', 'End Time', 'Duration',
        'Opening Cash', 'Closing Cash', 'Difference',
        'Total Sales', 'Total Orders', 'Status'
    ];
    const rows = filteredShifts.map(s => {
        const diff = s.closing_cash !== null
            ? s.closing_cash - s.opening_cash
            : '';
        return [
            `SHF-${String(s.id).padStart(4, '0')}`,
            s.employee,
            s.register,
            s.start_time,
            s.end_time || '',
            s.end_time ? calcDuration(s.start_time, s.end_time) : 'Ongoing',
            s.opening_cash,
            s.closing_cash ?? '',
            diff,
            s.total_sales,
            s.total_orders,
            s.status
        ];
    });

    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'shifts.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Shifts exported successfully', 'success');
}

// ===== HELPERS =====
function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}