// =============================================
// products.js — Fetch & Display Products
// =============================================
import { db } from "./firebase-config.js";
import {
  collection, getDocs, doc, getDoc, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { addToCart } from "./cart.js";

// ── Fetch all products ────────────────────────
export async function fetchProducts(category = null) {
  let q = collection(db, "products");
  if (category) q = query(q, where("category", "==", category), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Fetch single product ──────────────────────
export async function fetchProduct(id) {
  const snap = await getDoc(doc(db, "products", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Render product cards ──────────────────────
export function renderProductCards(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = `<p class="empty-msg">No products found.</p>`;
    return;
  }

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <a href="product-detail.html?id=${p.id}" class="card-img-link">
        <img src="${p.imageUrl || 'assets/placeholder.png'}" alt="${p.name}" loading="lazy"/>
        ${p.stock === 0 ? '<span class="badge-out">Out of Stock</span>' : ''}
      </a>
      <div class="card-body">
        <span class="card-category">${p.category || 'General'}</span>
        <h3 class="card-title">${p.name}</h3>
        <p class="card-desc">${p.description?.slice(0, 80) || ''}…</p>
        <div class="card-footer">
          <span class="card-price">₹${p.price?.toLocaleString()}</span>
          <button class="btn-cart" data-id="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
            ${p.stock === 0 ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>`;
    container.appendChild(card);
  });

  // Attach add-to-cart listeners
  container.querySelectorAll(".btn-cart").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const product = products.find(p => p.id === id);
      await addToCart(product);
      showToast(`"${product.name}" added to cart`);
    });
  });
}

// ── Simple toast notification ─────────────────
export function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}