// =============================================
// admin.js — Add / Edit / Delete Products
// =============================================
import { db, auth } from "./firebase-config.js";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, serverTimestamp, orderBy, query
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔴 Replace with your admin UID from Firebase Console
const ADMIN_UID = "YOUR_ADMIN_UID";

onAuthStateChanged(auth, (user) => {
  if (!user || user.uid !== ADMIN_UID) {
    document.body.innerHTML = `<div style="display:grid;place-items:center;height:100vh;font-family:sans-serif"><h2>⛔ Access Denied</h2></div>`;
    return;
  }
  initAdmin();
});

async function initAdmin() {
  await loadProducts();

  const form = document.getElementById("product-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    const data = {
      name: form.pName.value.trim(),
      description: form.pDesc.value.trim(),
      price: parseFloat(form.pPrice.value),
      stock: parseInt(form.pStock.value),
      category: form.pCategory.value.trim(),
      imageUrl: form.pImage.value.trim(),
      createdAt: serverTimestamp()
    };

    const editId = form.dataset.editId;
    if (editId) {
      await updateDoc(doc(db, "products", editId), data);
      delete form.dataset.editId;
      btn.textContent = "Add Product";
    } else {
      await addDoc(collection(db, "products"), data);
    }

    form.reset();
    btn.disabled = false;
    await loadProducts();
  });
}

async function loadProducts() {
  const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
  const tbody = document.getElementById("products-tbody");
  tbody.innerHTML = snap.docs.map(d => {
    const p = d.data();
    return `<tr>
      <td><img src="${p.imageUrl}" style="width:48px;height:48px;object-fit:cover;border-radius:6px"/></td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>₹${p.price}</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn-edit" data-id="${d.id}">Edit</button>
        <button class="btn-delete" data-id="${d.id}">Delete</button>
      </td>
    </tr>`;
  }).join("");

  const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  tbody.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this product?")) return;
      await deleteDoc(doc(db, "products", btn.dataset.id));
      await loadProducts();
    });
  });

  tbody.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = products.find(x => x.id === btn.dataset.id);
      const form = document.getElementById("product-form");
      form.pName.value = p.name;
      form.pDesc.value = p.description;
      form.pPrice.value = p.price;
      form.pStock.value = p.stock;
      form.pCategory.value = p.category;
      form.pImage.value = p.imageUrl;
      form.dataset.editId = p.id;
      form.querySelector('button[type="submit"]').textContent = "Update Product";
      form.scrollIntoView({ behavior: "smooth" });
    });
  });
}
