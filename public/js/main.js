const API = '/api';

function getCurrentUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function setHeaderUser() {
  const span = document.getElementById('userInfo');
  const loginLink = document.getElementById('loginLink');
  const logoutLink = document.getElementById('logoutLink');

  if (!span || !loginLink || !logoutLink) return;

  const user = getCurrentUser();
  if (user) {
    span.textContent = `Hello, ${user.name} (${user.role})`;
    loginLink.style.display = 'none';
    logoutLink.style.display = 'inline';
    logoutLink.addEventListener('click', () => {
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  } else {
    span.textContent = 'Guest';
    loginLink.style.display = 'inline';
    logoutLink.style.display = 'none';
  }
}

function getCart() {
  const raw = localStorage.getItem('cart');
  return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

/* ----- index.html: show products, add to cart ----- */
async function loadProducts() {
  const container = document.getElementById('products');
  if (!container) return;

  const res = await fetch(`${API}/products`);
  const list = await res.json();

  container.innerHTML = '';
  list.forEach((p) => {
    const div = document.createElement('div');
    div.className = 'card product-card';
    div.innerHTML = `
        ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" class="product-img">` : ''}
        <h3>${p.name}</h3>
        <p>₹${p.price}</p>
        <p class="badge">${p.description || ''}</p>
        <button class="btn" data-id="${p._id}">Add to cart</button>
    `;
    container.appendChild(div);
  });

  container.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const id = e.target.getAttribute('data-id');
      const product = list.find((p) => p._id === id);
      if (!product) return;
      const cart = getCart();
      const existing = cart.find((c) => c._id === id);
      if (existing) existing.quantity += 1;
      else cart.push({ ...product, quantity: 1 });
      saveCart(cart);
      alert('Added to cart');
    }
  });
}

/* ----- cart.html ----- */
function loadCartPage() {
  const listDiv = document.getElementById('cartItems');
  const totalSpan = document.getElementById('cartTotal');
  const form = document.getElementById('orderForm');
  if (!listDiv || !totalSpan || !form) return;

  const cart = getCart();
  if (!cart.length) {
    listDiv.innerHTML = '<p>No items in cart.</p>';
    totalSpan.textContent = '0';
    return;
  }

  let total = 0;
  listDiv.innerHTML = '';
  cart.forEach((item) => {
    const line = document.createElement('div');
    line.innerHTML = `${item.name} x ${item.quantity} – ₹${item.price * item.quantity}`;
    listDiv.appendChild(line);
    total += item.price * item.quantity;
  });
  totalSpan.textContent = total;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      alert('Please login to place order');
      window.location.href = 'login.html';
      return;
    }

    const address = document.getElementById('address').value.trim();
    if (!address) {
      alert('Enter address');
      return;
    }

    const items = cart.map((item) => ({
      product: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, items, address })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Order failed');
      return;
    }

    localStorage.removeItem('cart');
    document.getElementById('orderMessage').textContent =
      'Order placed successfully! (COD).';
  });
}

/* ----- orders.html (my orders) ----- */
async function loadMyOrders() {
  const container = document.getElementById('ordersList');
  if (!container) return;

  const user = getCurrentUser();
  if (!user) {
    container.innerHTML = '<p>Please login to see your orders.</p>';
    return;
  }

  const res = await fetch(`${API}/orders/user/${user._id}`);
  const orders = await res.json();

  if (!orders.length) {
    container.innerHTML = '<p>No orders yet.</p>';
    return;
  }

  orders.forEach((o) => {
    const card = document.createElement('div');
    card.className = 'card';
    const itemsText = o.items
      .map((it) => `${it.name} x ${it.quantity}`)
      .join(', ');
    card.innerHTML = `
      <p><strong>Order ID:</strong> ${o._id}</p>
      <p><strong>Items:</strong> ${itemsText}</p>
      <p><strong>Total:</strong> ₹${o.total}</p>
      <p><strong>Status:</strong> ${o.status}</p>
      <p class="badge">${new Date(o.createdAt).toLocaleString()}</p>
    `;
    container.appendChild(card);
  });
}

/* ----- init for each page ----- */
setHeaderUser();
loadProducts();
loadCartPage();
loadMyOrders();
