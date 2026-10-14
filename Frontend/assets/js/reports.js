// ===== CHART INSTANCES =====
let charts = {};

// ===== DEMO DATA =====
const demoSales = [
    { id: 1001, customer: 'John Doe',      branch: 'Main Branch', items: 5,  subtotal: 125.50, discount: 10.00, tax: 5.78,  grand_total: 121.28, status: 'completed', date: '2024-01-15 09:23' },
    { id: 1002, customer: 'Walk-in',       branch: 'Branch 2',    items: 2,  subtotal: 45.00,  discount: 0,     tax: 2.25,  grand_total: 47.25,  status: 'completed', date: '2024-01-15 10:05' },
    { id: 1003, customer: 'Jane Smith',    branch: 'Main Branch', items: 8,  subtotal: 230.75, discount: 23.08, tax: 10.38, grand_total: 218.05, status: 'completed', date: '2024-01-15 11:30' },
    { id: 1004, customer: 'Alice Brown',   branch: 'Main Branch', items: 3,  subtotal: 89.00,  discount: 0,     tax: 4.45,  grand_total: 93.45,  status: 'refunded',  date: '2024-01-15 12:15' },
    { id: 1005, customer: 'Bob Johnson',   branch: 'Branch 2',    items: 12, subtotal: 345.20, discount: 34.52, tax: 15.53, grand_total: 326.21, status: 'completed', date: '2024-01-15 13:00' },
    { id: 1006, customer: 'Walk-in',       branch: 'Main Branch', items: 1,  subtotal: 15.00,  discount: 0,     tax: 0.75,  grand_total: 15.75,  status: 'completed', date: '2024-01-15 13:45' },
    { id: 1007, customer: 'Charlie Wilson',branch: 'Main Branch', items: 6,  subtotal: 178.90, discount: 17.89, tax: 8.05,  grand_total: 169.06, status: 'cancelled', date: '2024-01-15 14:20' },
    { id: 1008, customer: 'Diana Prince',  branch: 'Branch 2',    items: 4,  subtotal: 92.40,  discount: 0,     tax: 4.62,  grand_total: 97.02,  status: 'completed', date: '2024-01-15 15:10' },
];

const demoProducts = [
    { prod_name: 'Coca Cola 500ml',    sku: 'BEV-001', category: 'Beverages',      qty_sold: 520, revenue: 780.00,  cost: 468.00,  profit: 312.00,  margin: 40.0 },
    { prod_name: 'Full Cream Milk 1L', sku: 'DAI-001', category: 'Dairy',          qty_sold: 310, revenue: 682.00,  cost: 434.00,  profit: 248.00,  margin: 36.4 },
    { prod_name: 'White Bread Loaf',   sku: 'BAK-001', category: 'Bakery',         qty_sold: 290, revenue: 522.00,  cost: 290.00,  profit: 232.00,  margin: 44.4 },
    { prod_name: 'Banana 1kg',         sku: 'PRO-001', category: 'Produce',        qty_sold: 480, revenue: 475.20,  cost: 240.00,  profit: 235.20,  margin: 49.5 },
    { prod_name: 'Chicken Breast 1kg', sku: 'MEA-001', category: 'Meat & Poultry', qty_sold: 185, revenue: 1572.50, cost: 962.00,  profit: 610.50,  margin: 38.8 },
    { prod_name: 'Lays Chips 150g',    sku: 'SNK-001', category: 'Snacks',         qty_sold: 420, revenue: 1050.00, cost: 630.00,  profit: 420.00,  margin: 40.0 },
    { prod_name: 'Orange Juice 1L',    sku: 'BEV-002', category: 'Beverages',      qty_sold: 260, revenue: 832.00,  cost: 468.00,  profit: 364.00,  margin: 43.8 },
    { prod_name: 'Cheddar Cheese 200g',sku: 'DAI-002', category: 'Dairy',          qty_sold: 140, revenue: 630.00,  cost: 392.00,  profit: 238.00,  margin: 37.8 },
];

const demoInventory = [
    { prod_name: 'Coca Cola 500ml',    sku: 'BEV-001', branch: 'Main Branch', qty: 150, unit_cost: 0.90, total_value: 135.00,  status: 'In Stock'     },
    { prod_name: 'Full Cream Milk 1L', sku: 'DAI-001', branch: 'Main Branch', qty: 8,   unit_cost: 1.40, total_value: 11.20,   status: 'Low Stock'    },
    { prod_name: 'White Bread Loaf',   sku: 'BAK-001', branch: 'Main Branch', qty: 0,   unit_cost: 1.00, total_value: 0,       status: 'Out of Stock' },
    { prod_name: 'Banana 1kg',         sku: 'PRO-001', branch: 'Branch 2',    qty: 45,  unit_cost: 0.50, total_value: 22.50,   status: 'In Stock'     },
    { prod_name: 'Chicken Breast 1kg', sku: 'MEA-001', branch: 'Main Branch', qty: 3,   unit_cost: 5.20, total_value: 15.60,   status: 'Low Stock'    },
    { prod_name: 'Lays Chips 150g',    sku: 'SNK-001', branch: 'Branch 2',    qty: 200, unit_cost: 1.50, total_value: 300.00,  status: 'In Stock'     },
    { prod_name: 'Orange Juice 1L',    sku: 'BEV-002', branch: 'Main Branch', qty: 60,  unit_cost: 1.80, total_value: 108.00,  status: 'In Stock'     },
    { prod_name: 'Cheddar Cheese 200g',sku: 'DAI-002', branch: 'Main Branch', qty: 0,   unit_cost: 2.80, total_value: 0,       status: 'Out of Stock' },
];

const demoEmployees = [
    { name: 'John Doe',      role: 'Manager',     dept: 'Sales',     total_sales: 45200.00, orders: 380, avg_order: 118.95, salary: 5000.00 },
    { name: 'Jane Smith',    role: 'Cashier',     dept: 'Sales',     total_sales: 38750.00, orders: 320, avg_order: 121.09, salary: 2500.00 },
    { name: 'Bob Johnson',   role: 'Stock Clerk', dept: 'Inventory', total_sales: 0,        orders: 0,   avg_order: 0,      salary: 2200.00 },
    { name: 'Alice Brown',   role: 'Accountant',  dept: 'Finance',   total_sales: 0,        orders: 0,   avg_order: 0,      salary: 3800.00 },
    { name: 'Diana Prince',  role: 'Manager',     dept: 'HR',        total_sales: 29800.00, orders: 245, avg_order: 121.63, salary: 4800.00 },
];

// ===========================
// ===== INIT ================
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    setDefaultDates();
    loadKPIs();
    initSalesCharts();
    loadSalesTable();
    setupSidebarToggle();
});

// ===== USER INFO =====
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
        document.getElementById('userName').textContent    = user.name;
        document.getElementById('userRole').textContent   = user.role || 'Staff';
        document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    }
}

// ===== DEFAULT DATES =====
function setDefaultDates() {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    document.getElementById('dateFrom').value = start.toISOString().split('T')[0];
    document.getElementById('dateTo').value   = now.toISOString().split('T')[0];
}

// ===========================
// ===== KPI CARDS ===========
// ===========================
function loadKPIs() {
    // const data = await API.get('/reports/kpis');
    const kpis = {
        revenue:       148250.75,
        profit:         52387.50,
        orders:          1243,
        avgOrder:         119.27,
        revenueChange:    12.5,
        profitChange:      8.3,
        ordersChange:     15.2,
        avgChange:        -2.1,
    };

    document.getElementById('kpiRevenue').textContent  = formatCurrency(kpis.revenue);
    document.getElementById('kpiProfit').textContent   = formatCurrency(kpis.profit);
    document.getElementById('kpiOrders').textContent   = kpis.orders.toLocaleString();
    document.getElementById('kpiAvgOrder').textContent = formatCurrency(kpis.avgOrder);

    setKPIChange('kpiRevenueChange', kpis.revenueChange);
    setKPIChange('kpiProfitChange',  kpis.profitChange);
    setKPIChange('kpiOrdersChange',  kpis.ordersChange);
    setKPIChange('kpiAvgChange',     kpis.avgChange);
}

function setKPIChange(elId, pct) {
    const el = document.getElementById(elId);
    const up = pct >= 0;
    el.className = `stat-change ${up ? 'up' : 'down'}`;
    el.innerHTML = `<i class="fas fa-arrow-${up ? 'up' : 'down'}"></i> ${Math.abs(pct)}%`;
}

// ===========================
// ===== TAB SWITCH ==========
// ===========================
function switchReportTab(tab) {
    const tabs = ['sales', 'products', 'inventory', 'employees'];

    const btnMap = {
        sales:     'tabSales',
        products:  'tabProducts',
        inventory: 'tabInventory',
        employees: 'tabEmployees',
    };

    const panelMap = {
        sales:     'reportSales',
        products:  'reportProducts',
        inventory: 'reportInventory',
        employees: 'reportEmployees',
    };

    // Show / hide panels and toggle button styles
    tabs.forEach(t => {
        document.getElementById(panelMap[t]).style.display =
            t === tab ? 'block' : 'none';
        document.getElementById(btnMap[t]).className =
            t === tab ? 'btn btn-primary' : 'btn btn-outline';
    });

    // Lazy-load charts only on first open
    if (tab === 'products'  && !charts.topProducts)  initProductsCharts();
    if (tab === 'inventory' && !charts.inventory)     loadInventoryTable();
    if (tab === 'employees' && !charts.dept)          initEmployeesCharts();
}

// ===========================
// ===== REFRESH ALL =========
// ===========================
function refreshAllReports() {
    loadKPIs();
    if (charts.revenue) updateRevenueChart();
    loadSalesTable();
}

// ===========================
// ===== SALES CHARTS ========
// ===========================
function initSalesCharts() {
    initRevenueChart();
    initPaymentChart();
    initBranchChart();
    initHourlyChart();
}

// ----- Revenue / Profit Bar Chart -----
function initRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');

    charts.revenue = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            datasets: [
                {
                    label: 'Revenue ($)',
                    data: [12000,15000,13500,18000,16500,21000,19500,22000,20000,24000,22500,26000],
                    backgroundColor: 'rgba(37,99,235,0.85)',
                    borderRadius: 5,
                    order: 2,
                },
                {
                    label: 'Profit ($)',
                    data: [4200,5250,4725,6300,5775,7350,6825,7700,7000,8400,7875,9100],
                    backgroundColor: 'rgba(22,163,74,0.85)',
                    borderRadius: 5,
                    order: 1,
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => '$' + v.toLocaleString() }
                }
            }
        }
    });
}

// ----- Update Revenue Chart by Period -----
function updateRevenueChart() {
    if (!charts.revenue) return;

    const period = document.getElementById('revenueChartPeriod').value;

    const dataMap = {
        daily: {
            labels:  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            revenue: [3200, 4100, 2900, 5200, 4800, 7100, 6300],
            profit:  [1120, 1435, 1015, 1820, 1680, 2485, 2205],
        },
        weekly: {
            labels:  ['Week 1','Week 2','Week 3','Week 4'],
            revenue: [18000, 21000, 19500, 24000],
            profit:  [6300,  7350,  6825,  8400],
        },
        monthly: {
            labels:  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            revenue: [12000,15000,13500,18000,16500,21000,19500,22000,20000,24000,22500,26000],
            profit:  [4200, 5250, 4725, 6300, 5775, 7350, 6825, 7700, 7000, 8400, 7875, 9100],
        },
    };

    const d = dataMap[period];
    charts.revenue.data.labels             = d.labels;
    charts.revenue.data.datasets[0].data   = d.revenue;
    charts.revenue.data.datasets[1].data   = d.profit;
    charts.revenue.update();
}

// ----- Payment Methods Doughnut -----
function initPaymentChart() {
    const ctx = document.getElementById('paymentChart').getContext('2d');

    charts.payment = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Cash','Card','Mobile Money','Loyalty Points','Bank Transfer'],
            datasets: [{
                data: [45, 30, 15, 7, 3],
                backgroundColor: ['#16a34a','#2563eb','#0891b2','#d97706','#7c3aed'],
                borderWidth: 2,
                borderColor: '#fff',
            }]
        },
        options: {
            responsive: true,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 11 }, padding: 10 }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.label}: ${ctx.parsed}%`
                    }
                }
            }
        }
    });
}

// ----- Sales by Branch Bar -----
function initBranchChart() {
    const ctx = document.getElementById('branchChart').getContext('2d');

    charts.branch = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Main Branch', 'Branch 2'],
            datasets: [
                {
                    label: 'Revenue ($)',
                    data: [98500, 49750],
                    backgroundColor: ['rgba(37,99,235,0.85)', 'rgba(8,145,178,0.85)'],
                    borderRadius: 6,
                },
                {
                    label: 'Orders',
                    data: [820, 423],
                    backgroundColor: ['rgba(22,163,74,0.85)', 'rgba(16,185,129,0.85)'],
                    borderRadius: 6,
                    yAxisID: 'y2',
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: {
                y:  { beginAtZero: true, ticks: { callback: v => '$' + v.toLocaleString() } },
                y2: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });
}

// ----- Hourly Sales Line -----
function initHourlyChart() {
    const ctx = document.getElementById('hourlyChart').getContext('2d');
    const hours = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`); // 08:00 – 21:00

    charts.hourly = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Sales ($)',
                data: [120,350,580,920,1100,1350,980,1420,1680,1250,980,750,420,180],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.08)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2563eb',
                pointRadius: 3,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { callback: v => '$' + v } }
            }
        }
    });
}

// ----- Sales Table -----
function loadSalesTable() {
    // const data = await API.get('/sales?limit=50');
    const tbody = document.getElementById('salesReportTable');

    tbody.innerHTML = demoSales.map(s => `
        <tr>
            <td><strong style="color:var(--primary);">#${s.id}</strong></td>
            <td>${s.customer}</td>
            <td>${s.branch}</td>
            <td style="text-align:center;">${s.items}</td>
            <td>${formatCurrency(s.subtotal)}</td>
            <td style="color:var(--danger);">-${formatCurrency(s.discount)}</td>
            <td>${formatCurrency(s.tax)}</td>
            <td><strong style="color:var(--success);">${formatCurrency(s.grand_total)}</strong></td>
            <td>${getStatusBadge(s.status)}</td>
            <td style="font-size:12px;color:var(--secondary);">${s.date}</td>
        </tr>
    `).join('');
}

// ===========================
// ===== PRODUCTS CHARTS =====
// ===========================
function initProductsCharts() {
    initTopProductsChart();
    initCategoryReportChart();
    loadProductsTable();
}

// ----- Top Products Horizontal Bar -----
function initTopProductsChart() {
    const ctx = document.getElementById('topProductsChart').getContext('2d');
    const sorted = [...demoProducts].sort((a, b) => b.revenue - a.revenue).slice(0, 6);

    charts.topProducts = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(p => p.prod_name.length > 18 ? p.prod_name.slice(0, 18) + '…' : p.prod_name),
            datasets: [
                {
                    label: 'Revenue ($)',
                    data: sorted.map(p => p.revenue),
                    backgroundColor: 'rgba(37,99,235,0.85)',
                    borderRadius: 5,
                },
                {
                    label: 'Profit ($)',
                    data: sorted.map(p => p.profit),
                    backgroundColor: 'rgba(22,163,74,0.85)',
                    borderRadius: 5,
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: {
                x: { beginAtZero: true, ticks: { callback: v => '$' + v } }
            }
        }
    });
}

// ----- Category Pie -----
function initCategoryReportChart() {
    const ctx = document.getElementById('categoryReportChart').getContext('2d');

    // Group revenue by category
    const catMap = {};
    demoProducts.forEach(p => {
        catMap[p.category] = (catMap[p.category] || 0) + p.revenue;
    });

    charts.categoryReport = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(catMap),
            datasets: [{
                data: Object.values(catMap),
                backgroundColor: ['#2563eb','#16a34a','#d97706','#0891b2','#dc2626','#7c3aed','#db2777'],
                borderWidth: 2,
                borderColor: '#fff',
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8 } },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.label}: $${ctx.parsed.toLocaleString()}`
                    }
                }
            }
        }
    });
}

// ----- Products Performance Table -----
function loadProductsTable() {
    const tbody = document.getElementById('productsReportTable');

    tbody.innerHTML = demoProducts.map(p => {
        const marginColor = p.margin >= 40
            ? 'var(--success)'
            : p.margin >= 30
            ? 'var(--warning)'
            : 'var(--danger)';

        return `
        <tr>
            <td>
                <div style="font-weight:600;">${p.prod_name}</div>
            </td>
            <td>
                <code style="background:var(--light);padding:2px 8px;
                    border-radius:4px;font-size:12px;">${p.sku}</code>
            </td>
            <td><span class="badge badge-info">${p.category}</span></td>
            <td style="text-align:center;font-weight:600;">${p.qty_sold.toLocaleString()}</td>
            <td><strong style="color:var(--primary);">${formatCurrency(p.revenue)}</strong></td>
            <td style="color:var(--secondary);">${formatCurrency(p.cost)}</td>
            <td><strong style="color:var(--success);">${formatCurrency(p.profit)}</strong></td>
            <td>
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="flex:1;background:var(--border);border-radius:4px;height:6px;min-width:50px;">
                        <div style="width:${p.margin}%;background:${marginColor};
                            height:100%;border-radius:4px;"></div>
                    </div>
                    <span style="font-weight:700;color:${marginColor};font-size:13px;">
                        ${p.margin}%
                    </span>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// ===========================
// ===== INVENTORY TABLE =====
// ===========================
function loadInventoryTable() {
    // const data = await API.get('/reports/inventory');
    const tbody = document.getElementById('inventoryReportTable');

    const totalValue = demoInventory.reduce((s, i) => s + i.total_value, 0);

    tbody.innerHTML = demoInventory.map(i => {
        const statusClass = {
            'In Stock':     'badge-success',
            'Low Stock':    'badge-warning',
            'Out of Stock': 'badge-danger',
        }[i.status] || 'badge-secondary';

        return `
        <tr>
            <td><strong>${i.prod_name}</strong></td>
            <td>
                <code style="background:var(--light);padding:2px 8px;
                    border-radius:4px;font-size:12px;">${i.sku}</code>
            </td>
            <td>${i.branch}</td>
            <td>
                <strong style="font-size:16px;color:${
                    i.qty <= 0
                        ? 'var(--danger)'
                        : i.qty <= 10
                        ? 'var(--warning)'
                        : 'var(--success)'
                };">${i.qty}</strong>
            </td>
            <td>${formatCurrency(i.unit_cost)}</td>
            <td>
                <strong style="color:var(--primary);">${formatCurrency(i.total_value)}</strong>
            </td>
            <td><span class="badge ${statusClass}">${i.status}</span></td>
        </tr>`;
    }).join('');

    // Append total row
    tbody.innerHTML += `
        <tr style="background:var(--light);font-weight:700;">
            <td colspan="5" style="text-align:right;padding:12px 16px;">
                Total Inventory Value:
            </td>
            <td style="padding:12px 16px;">
                <strong style="color:var(--success);font-size:15px;">
                    ${formatCurrency(totalValue)}
                </strong>
            </td>
            <td></td>
        </tr>`;

    charts.inventory = true; // mark as loaded
}

// ===========================
// ===== EMPLOYEES CHARTS ====
// ===========================
function initEmployeesCharts() {
    initDeptChart();
    initEmpSalesChart();
    loadEmployeesTable();
}

// ----- Staff by Department Doughnut -----
function initDeptChart() {
    const ctx = document.getElementById('deptChart').getContext('2d');

    charts.dept = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Sales', 'Inventory', 'Finance', 'HR', 'IT'],
            datasets: [{
                data: [8, 5, 3, 2, 2],
                backgroundColor: ['#2563eb','#16a34a','#d97706','#0891b2','#7c3aed'],
                borderWidth: 2,
                borderColor: '#fff',
            }]
        },
        options: {
            responsive: true,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 11 }, padding: 10 }
                }
            }
        }
    });
}

// ----- Sales by Employee Bar -----
function initEmpSalesChart() {
    const ctx = document.getElementById('empSalesChart').getContext('2d');
    const sellers = demoEmployees.filter(e => e.total_sales > 0);

    charts.empSales = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sellers.map(e => e.name),
            datasets: [
                {
                    label: 'Total Sales ($)',
                    data: sellers.map(e => e.total_sales),
                    backgroundColor: 'rgba(37,99,235,0.85)',
                    borderRadius: 5,
                    yAxisID: 'y',
                },
                {
                    label: 'Orders',
                    data: sellers.map(e => e.orders),
                    backgroundColor: 'rgba(22,163,74,0.85)',
                    borderRadius: 5,
                    yAxisID: 'y2',
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: {
                y:  { beginAtZero: true, ticks: { callback: v => '$' + v.toLocaleString() } },
                y2: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });
}

// ----- Employees Performance Table -----
function loadEmployeesTable() {
    // const data = await API.get('/reports/employees');
    const tbody = document.getElementById('employeesReportTable');

    tbody.innerHTML = demoEmployees.map(e => {
        const roleColors = {
            'Manager':     'badge-primary',
            'Supervisor':  'badge-info',
            'Cashier':     'badge-success',
            'Stock Clerk': 'badge-warning',
            'Accountant':  'badge-secondary',
        };

        return `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;border-radius:50%;
                        background:linear-gradient(135deg,var(--primary),var(--info));
                        display:flex;align-items:center;justify-content:center;
                        color:white;font-weight:700;font-size:13px;flex-shrink:0;">
                        ${e.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <strong>${e.name}</strong>
                </div>
            </td>
            <td>
                <span class="badge ${roleColors[e.role] || 'badge-secondary'}">
                    ${e.role}
                </span>
            </td>
            <td>${e.dept}</td>
            <td>
                <strong style="color:${e.total_sales > 0 ? 'var(--success)' : 'var(--secondary)'};">
                    ${e.total_sales > 0 ? formatCurrency(e.total_sales) : '—'}
                </strong>
            </td>
            <td style="text-align:center;">
                ${e.orders > 0 ? `<strong>${e.orders}</strong>` : '—'}
            </td>
            <td>
                ${e.avg_order > 0 ? formatCurrency(e.avg_order) : '—'}
            </td>
            <td>
                <strong style="color:var(--primary);">${formatCurrency(e.salary)}</strong>
            </td>
        </tr>`;
    }).join('');
}

// ===========================
// ===== EXPORT FUNCTIONS ====
// ===========================

// ----- Export Sales CSV -----
function exportSalesCSV() {
    const headers = ['Sale ID','Customer','Branch','Items','Subtotal','Discount','Tax','Grand Total','Status','Date'];
    const rows = demoSales.map(s => [
        s.id, s.customer, s.branch, s.items,
        s.subtotal, s.discount, s.tax, s.grand_total,
        s.status, s.date
    ]);
    downloadCSV('sales_report.csv', headers, rows);
    showToast('Sales report exported', 'success');
}

// ----- Export Products CSV -----
function exportProductsCSV() {
    const headers = ['Product','SKU','Category','Qty Sold','Revenue','Cost','Profit','Margin %'];
    const rows = demoProducts.map(p => [
        p.prod_name, p.sku, p.category,
        p.qty_sold, p.revenue, p.cost, p.profit, p.margin
    ]);
    downloadCSV('products_report.csv', headers, rows);
    showToast('Products report exported', 'success');
}

// ----- Export Inventory CSV -----
function exportInventoryCSV() {
    const headers = ['Product','SKU','Branch','Qty on Hand','Unit Cost','Total Value','Status'];
    const rows = demoInventory.map(i => [
        i.prod_name, i.sku, i.branch,
        i.qty, i.unit_cost, i.total_value, i.status
    ]);
    downloadCSV('inventory_report.csv', headers, rows);
    showToast('Inventory report exported', 'success');
}

// ----- Export Employees CSV -----
function exportEmployeesCSV() {
    const headers = ['Employee','Role','Department','Total Sales','Orders','Avg Order','Salary'];
    const rows = demoEmployees.map(e => [
        e.name, e.role, e.dept,
        e.total_sales, e.orders, e.avg_order, e.salary
    ]);
    downloadCSV('employees_report.csv', headers, rows);
    showToast('Employees report exported', 'success');
}

// ----- CSV Download Helper -----
function downloadCSV(filename, headers, rows) {
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ----- Export All as PDF -----
function exportAllPDF() {
    // When backend is ready:
    // window.open(`${API_BASE}/reports/export-pdf?from=${dateFrom}&to=${dateTo}`, '_blank');

    showToast('Preparing PDF export… (connect to backend)', 'info');

    // Simple print fallback
    setTimeout(() => {
        window.print();
    }, 500);
}

// ===========================
// ===== HELPERS =============
// ===========================
function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}