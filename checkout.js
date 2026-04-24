// =============================================
// checkout.js — Place Orders to Firestore
// =============================================
import { db, auth } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getCart, cartTotal, clearCart } from "./cart.js";
import { requireAuth } from "./auth.js";

requireAuth();

document.addEventListener("DOMContentLoaded", () => {
  const cart = getCart();
  const total = cartTotal();

  // Render order preview
  const preview = document.getElementById("order-preview");
  if (preview) {
    preview.innerHTML = cart.map(i => `
      <div class="preview-item">
        <span>${i.name} × ${i.qty}</span>
        <span>₹${(i.price * i.qty).toLocaleString()}</span>
      </div>`).join("") +
      `<div class="preview-total"><strong>Total</strong><strong>₹${(total > 999 ? total : total + 99).toLocaleString()}</strong></div>`;
  }

  // Handle form submit
  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Placing Order…";

      try {
        const user = auth.currentUser;
        const address = {
          name: form.fullName.value,
          phone: form.phone.value,
          line1: form.address.value,
          city: form.city.value,
          pincode: form.pincode.value,
          state: form.state.value
        };

        await addDoc(collection(db, "orders"), {
          userId: user.uid,
          userEmail: user.email,
          items: cart,
          address,
          total: total > 999 ? total : total + 99,
          status: "pending",
          createdAt: serverTimestamp()
        });

        clearCart();
        window.location.href = `orders.html?success=1`;
      } catch (err) {
        alert("Order failed: " + err.message);
        btn.disabled = false;
        btn.textContent = "Place Order";
      }
    });
  }
});
