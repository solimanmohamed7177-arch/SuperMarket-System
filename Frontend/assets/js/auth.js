// ===== LOGIN FORM =====
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.querySelector('.btn-login');

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    btn.disabled = true;

    try {
        // --- Real API call ---
        // const res = await fetch('http://localhost:8000/api/auth/login', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ email, password })
        // });
        // const data = await res.json();

        // Demo login (remove when backend is ready)
        await new Promise(r => setTimeout(r, 800));
        const data = {
            success: true,
            token: 'demo-token-123',
            user: { name: 'Admin User', role: 'Manager', email }
        };

        if (data.success || data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'pages/dashboard.html';
        } else {
            showLoginError(data.message || 'Invalid credentials');
        }

    } catch (err) {
        showLoginError('Cannot connect to server');
    } finally {
        btn.innerHTML = '<span>Login</span><i class="fas fa-arrow-right"></i>';
        btn.disabled = false;
    }
});

function showLoginError(msg) {
    const err = document.getElementById('loginError');
    document.getElementById('errorMsg').textContent = msg;
    err.style.display = 'flex';
    setTimeout(() => err.style.display = 'none', 4000);
}

// Toggle password visibility
document.getElementById('togglePass').addEventListener('click', () => {
    const input = document.getElementById('password');
    const icon = document.getElementById('togglePass');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});