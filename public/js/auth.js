const API_BASE = '/api';

function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

// REGISTER
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('regEmail').value.trim(),
      password: document.getElementById('regPassword').value.trim(),
      phone: document.getElementById('phone').value.trim()
    };

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Register failed');
      return;
    }
    alert('Registration successful. Please log in.');
    window.location.href = 'login.html';
  });
}

// LOGIN
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = {
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value.trim()
    };

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Login failed');
      return;
    }

    saveUser(data);
    if (data.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
  });
}
