// =============================================
// cart.js — Cart Management (localStorage)
// =============================================

const CART_KEY = "ec_cart";

// ── Get cart ──────────────────────────────────
export function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

// ── Save cart ─────────────────────────────────
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// ── Add item ──────────────────────────────────
export function addToCart(product, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx > -1) {
    cart[idx].qty += qty;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, qty });
  }
  saveCart(cart);
}

// ── Remove item ───────────────────────────────
export function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
}

// ── Update quantity ───────────────────────────
export function updateQty(productId, qty) {
  const cart = getCart().map(i => i.id === productId ? { ...i, qty: Math.max(1, qty) } : i);
  saveCart(cart);
}

// ── Clear cart ────────────────────────────────
export function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

// ── Cart total ────────────────────────────────
export function cartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

// ── Cart item count ───────────────────────────
export function cartCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}

// ── Badge update ──────────────────────────────
export function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (badge) {
    const n = cartCount();
    badge.textContent = n;
    badge.style.display = n > 0 ? "flex" : "none";
  }
}

// ── Render cart table ─────────────────────────
export function renderCart(containerId, summaryId) {
  const cart = getCart();
  const container = document.getElementById(containerId);
  const summary = document.getElementById(summaryId);
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart"><p>Your cart is empty.</p><a href="products.html" class="btn-primary">Shop Now</a></div>`;
    if (summary) summary.innerHTML = "";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.imageUrl || 'assets/placeholder.png'}" alt="${item.name}"/>
      <div class="item-info">
        <h4>${item.name}</h4>
        <span class="item-price">₹${item.price.toLocaleString()}</span>
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
        <span>${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
      </div>
      <span class="item-subtotal">₹${(item.price * item.qty).toLocaleString()}</span>
      <button class="btn-remove" data-id="${item.id}">✕</button>
    </div>`).join("");

  if (summary) {
    const total = cartTotal();
    summary.innerHTML = `
      <div class="summary-box">
        <h3>Order Summary</h3>
        <div class="summary-row"><span>Items (${cartCount()})</span><span>₹${total.toLocaleString()}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${total > 999 ? 'FREE' : '₹99'}</span></div>
        <div class="summary-row total"><span>Total</span><span>₹${(total > 999 ? total : total + 99).toLocaleString()}</span></div>
        <a href="checkout.html" class="btn-primary btn-block">Proceed to Checkout</a>
      </div>`;
  }

  // Event listeners
  container.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const item = getCart().find(i => i.id === id);
      if (btn.dataset.action === "inc") updateQty(id, item.qty + 1);
      else updateQty(id, item.qty - 1);
      renderCart(containerId, summaryId);
    });
  });
  container.querySelectorAll(".btn-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.dataset.id);
      renderCart(containerId, summaryId);
    });
  });
}