const API2 = '/api';

function getAdminUser() {
  const raw = localStorage.getItem('user');
  const u = raw ? JSON.parse(raw) : null;
  if (!u || u.role !== 'admin') return null;
  return u;
}

// protect admin page
const adminUser = getAdminUser();
if (!adminUser) {
  alert('Admin only. Please login as admin.');
  window.location.href = 'login.html';
}

// add product
const productForm = document.getElementById('productForm');
if (productForm) {
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = {
      name: document.getElementById('pName').value.trim(),
      price: Number(document.getElementById('pPrice').value),
      imageUrl: document.getElementById('pImage').value.trim(),
      description: document.getElementById('pDesc').value.trim()
    };

    const res = await fetch(`${API2}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Add product failed');
      return;
    }

    productForm.reset();
    loadAdminProducts();
  });
}

// load products
async function loadAdminProducts() {
  const container = document.getElementById('adminProducts');
  if (!container) return;

  const res = await fetch(`${API2}/products`);
  const list = await res.json();

  if (!list.length) {
    container.innerHTML = '<p>No products.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'table';
  table.innerHTML = `
    <thead>
      <tr><th>Name</th><th>Price</th><th>Actions</th></tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');

  list.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>₹${p.price}</td>
      <td><button class="btn danger" data-id="${p._id}">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });

  container.innerHTML = '';
  container.appendChild(table);

  tbody.addEventListener('click', async (e) => {
    if (e.target.tagName === 'BUTTON') {
      const id = e.target.getAttribute('data-id');
      if (!confirm('Delete this product?')) return;
      await fetch(`${API2}/products/${id}`, { method: 'DELETE' });
      loadAdminProducts();
    }
  });
}

// load orders
async function loadAdminOrders() {
  const container = document.getElementById('adminOrders');
  if (!container) return;

  const res = await fetch(`${API2}/orders`);
  const orders = await res.json();

  if (!orders.length) {
    container.innerHTML = '<p>No orders yet.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'table';
  table.innerHTML = `
    <thead>
      <tr><th>Order ID</th><th>User</th><th>Total</th><th>Status</th></tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');

  orders.forEach((o) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o._id}</td>
      <td>${o.user ? o.user.name : 'N/A'}</td>
      <td>₹${o.total}</td>
      <td>${o.status}</td>
    `;
    tbody.appendChild(tr);
  });

  container.innerHTML = '';
  container.appendChild(table);
}

loadAdminProducts();
loadAdminOrders();
