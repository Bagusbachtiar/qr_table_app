let menuItems = [];
let cart = [];

async function loadMenu(){
    const response = await fetch('/api/menu');
    menuItems = await response.json();

    const menuList = document.getElementById('menu-list');
    menuList.innerHTML = menuItems.map(item => `
        <div class="menu-item">
          <div class="menu-item-info">
            <h3>${item.name}</h3>
            <p class="menu-item-desc">${item.description || ''}</p>
            <span class="menu-item-price">$${item.price}</span>
          </div>
          <button class="btn-add" onclick="addToCart(${item.id})">Add</button>
        </div>
    `).join('');

}

function addToCart(id) {
    const item = menuItems.find(m => m.id === id);
    const existing = cart.find(c => c.id === id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, qty:1});
    }

    renderCart();
}

function renderCart() {
  const cartList = document.getElementById('cart-list');
  cartList.innerHTML = cart.map(c => `
    <div class="cart-item">
      <span>${c.name} x${c.qty}</span>
      <span>$${(c.price * c.qty).toFixed(2)}</span>
      <button class="btn-remove" onclick="removeFromCart(${c.id})">×</button>
    </div>
`).join('');


    const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  document.getElementById('cart-total').textContent = total.toFixed(2);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  renderCart();
}

async function checkout() {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cart.map(c => ({ menuItemId: c.id, quantity: c.qty })),
    }),
  });

  const data = await response.json();
  window.location.href = data.checkoutUrl;
}

loadMenu();