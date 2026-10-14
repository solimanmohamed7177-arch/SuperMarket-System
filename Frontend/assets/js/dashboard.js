// ===== DASHBOARD INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setCurrentDate();
    loadUserInfo();
    loadDashboardStats();
    loadRecentSales();
    initSalesChart();
    initCategoryChart();
    setupSidebarToggle();
});

function setCurrentDate() {
    const now = new Date();
    document.getElementById('currentDate').textContent =
        now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userRole').textContent = user.role || 'Staff';
        document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    }
}

async function loadDashboardStats() {
    // --- Replace with real API calls ---
    // const stats = await API.get('/dashboard/stats');

    // Demo data for now
    const stats = {
        todaySales: 12450.75,
        todayOrders: 87,
        totalProducts: 342,
        lowStock: 12,
        totalCustomers: 1205,
        pendingPOs: 5
    };

    document.getElementById('todaySales').textContent = formatCurrency(stats.todaySales);
    document.getElementById('todayOrders').textContent = stats.todayOrders;
    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('lowStock').textContent = stats.lowStock;
    document.getElementById('totalCustomers').textContent = stats.totalCustomers;
    document.getElementById('pendingOrders').textContent = stats.pendingPOs;
    document.getElementById('pendingPO').textContent = stats.pendingPOs;
}

async function loadRecentSales() {
    // const sales = await API.get('/sales?limit=10');

    // Demo data
    const sales = [
        { id: 1001, customer: 'John Doe', branch: 'Main Branch', items: 5, total: 125.50, status: 'completed', date: new Date() },
        { id: 1002, customer: 'Walk-in', branch: 'Branch 2', items: 2, total: 45.00, status: 'completed', date: new Date() },
        { id: 1003, customer: 'Jane Smith', branch: 'Main Branch', items: 8, total: 230.75, status: 'pending', date: new Date() },
    ];

    const tbody = document.getElementById('recentSalesTable');
    tbody.innerHTML = sales.map(s => `
        <tr>
            <td><strong>#${s.id}</strong></td>
            <td>${s.customer}</td>
            <td>${s.branch}</td>
            <td>${s.items} items</td>
            <td><strong>${formatCurrency(s.total)}</strong></td>
            <td>${getStatusBadge(s.status)}</td>
            <td>${formatDateTime(s.date)}</td>
        </tr>
    `).join('');
}

function initSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [4200, 5800, 3900, 7200, 6100, 9500, 8300];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Sales ($)',
                data,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.1)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2563eb',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: val => '$' + val.toLocaleString()
                    }
                }
            }
        }
    });
}

function initCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Beverages', 'Dairy', 'Bakery', 'Produce', 'Meat', 'Other'],
            datasets: [{
                data: [25, 20, 15, 18, 12, 10],
                backgroundColor: ['#2563eb', '#16a34a', '#d97706', '#0891b2', '#dc2626', '#7c3aed'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 11 }, padding: 10 }
                }
            }
        }
    });
}

function setupSidebarToggle() {
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
}