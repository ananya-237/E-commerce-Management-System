// =============================================
// orders.js — Order History
// =============================================
import { db, auth } from "./firebase-config.js";
import { collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { requireAuth } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

requireAuth();

const STATUS_COLOR = { pending: "#f59e0b", shipped: "#3b82f6", delivered: "#10b981", cancelled: "#ef4444" };

document.addEventListener("DOMContentLoaded", () => {
  // Success banner
  if (new URLSearchParams(location.search).get("success")) {
    const banner = document.getElementById("success-banner");
    if (banner) banner.style.display = "flex";
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const container = document.getElementById("orders-container");
    container.innerHTML = `<p class="loading-msg">Loading your orders…</p>`;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `<div class="empty-orders"><p>No orders yet.</p><a href="products.html" class="btn-primary">Start Shopping</a></div>`;
      return;
    }

    container.innerHTML = snap.docs.map(d => {
      const o = d.data();
      const date = o.createdAt?.toDate().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) || "—";
      const color = STATUS_COLOR[o.status] || "#6b7280";
      return `
        <div class="order-card">
          <div class="order-header">
            <div>
              <span class="order-id">#${d.id.slice(-8).toUpperCase()}</span>
              <span class="order-date">${date}</span>
            </div>
            <span class="order-status" style="background:${color}20;color:${color}">${o.status}</span>
          </div>
          <div class="order-items">
            ${o.items.map(i => `<div class="oi"><span>${i.name} × ${i.qty}</span><span>₹${(i.price * i.qty).toLocaleString()}</span></div>`).join("")}
          </div>
          <div class="order-footer">
            <span>Ship to: ${o.address?.name}, ${o.address?.city}</span>
            <strong>Total: ₹${o.total?.toLocaleString()}</strong>
          </div>
        </div>`;
    }).join("");
  });
});
