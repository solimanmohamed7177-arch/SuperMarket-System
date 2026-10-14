// ===== API CONFIGURATION =====
const API_BASE = 'http://localhost:8000/api';

// ===== HTTP HELPER =====
const API = {

    getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    },

    async get(endpoint) {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                headers: this.getHeaders()
            });
            if (res.status === 401) { logout(); return; }
            return await res.json();
        } catch (err) {
            console.error('GET Error:', err);
            showToast('Connection error', 'error');
        }
    },

    async post(endpoint, data) {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) {
            console.error('POST Error:', err);
            showToast('Connection error', 'error');
        }
    },

    async put(endpoint, data) {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) {
            console.error('PUT Error:', err);
            showToast('Connection error', 'error');
        }
    },

    async delete(endpoint) {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await res.json();
        } catch (err) {
            console.error('DELETE Error:', err);
            showToast('Connection error', 'error');
        }
    }
};

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ===== LOGOUT =====
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}

// ===== FORMAT HELPERS =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function getStatusBadge(status) {
    const map = {
        'completed': 'badge-success',
        'active': 'badge-success',
        'pending': 'badge-warning',
        'cancelled': 'badge-danger',
        'refunded': 'badge-info',
        'inactive': 'badge-secondary',
        'Ordered': 'badge-primary',
        'Received': 'badge-success',
        'Partially Received': 'badge-warning',
    };
    return `<span class="badge ${map[status] || 'badge-secondary'}">${status}</span>`;
}