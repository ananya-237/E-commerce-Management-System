// =============================================
// admin.js — Add / Edit / Delete Products
//           with Firebase Storage image upload
// =============================================
import { db, auth, storage } from "./firebase-config.js";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, serverTimestamp, orderBy, query
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
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

// ── Upload image to Firebase Storage ─────────
async function uploadImage(file) {
  const ext = file.name.split(".").pop();
  const fileName = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, fileName);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file);
    const bar = document.getElementById("upload-progress-bar");
    const wrap = document.getElementById("upload-progress-wrap");

    wrap.style.display = "block";

    task.on("state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        bar.style.width = pct + "%";
        bar.textContent = pct + "%";
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        wrap.style.display = "none";
        bar.style.width = "0%";
        resolve(url);
      }
    );
  });
}

async function initAdmin() {
  await loadProducts();

  // Live image preview when user picks a file
  const fileInput = document.getElementById("pImageFile");
  const preview = document.getElementById("img-preview");
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    }
  });

  const form = document.getElementById("product-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Saving…";

    try {
      // Determine image URL: upload new file OR keep existing
      let imageUrl = form.dataset.existingImage || "";
      const file = fileInput.files[0];
      if (file) {
        imageUrl = await uploadImage(file);
      }

      if (!imageUrl) {
        alert("Please select a product image.");
        btn.disabled = false;
        btn.textContent = form.dataset.editId ? "Update Product" : "Add Product";
        return;
      }

      const data = {
        name: form.pName.value.trim(),
        description: form.pDesc.value.trim(),
        price: parseFloat(form.pPrice.value),
        stock: parseInt(form.pStock.value),
        category: form.pCategory.value.trim(),
        imageUrl,
        createdAt: serverTimestamp()
      };

      const editId = form.dataset.editId;
      if (editId) {
        await updateDoc(doc(db, "products", editId), data);
        delete form.dataset.editId;
        delete form.dataset.existingImage;
      } else {
        await addDoc(collection(db, "products"), data);
      }

      // Reset form & preview
      form.reset();
      preview.style.display = "none";
      preview.src = "";
      btn.disabled = false;
      btn.textContent = "Add Product";
      await loadProducts();

    } catch (err) {
      alert("Error: " + err.message);
      btn.disabled = false;
      btn.textContent = "Add Product";
    }
  });
}

async function loadProducts() {
  const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
  const tbody = document.getElementById("products-tbody");

  tbody.innerHTML = snap.docs.map(d => {
    const p = d.data();
    return `<tr>
      <td>
        <img src="${p.imageUrl || ''}" alt="${p.name}"
             style="width:52px;height:52px;object-fit:cover;border-radius:8px;border:1px solid var(--border)"
             onerror="this.src='assets/placeholder.png'"/>
      </td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>₹${p.price?.toLocaleString()}</td>
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

      // Show existing image in preview
      const preview = document.getElementById("img-preview");
      preview.src = p.imageUrl || "";
      preview.style.display = p.imageUrl ? "block" : "none";

      // Store existing image URL so we keep it if no new file is chosen
      form.dataset.existingImage = p.imageUrl || "";
      form.dataset.editId = p.id;
      form.querySelector('button[type="submit"]').textContent = "Update Product";
      form.scrollIntoView({ behavior: "smooth" });
    });
  });
}