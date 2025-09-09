// =======================
// Autenticación Admin
// =======================
const PASSWORD = "Huevito123";

function setAuth(isAuth) {
  sessionStorage.setItem("auth", isAuth ? "1" : "0");
}
function isAuth() {
  return sessionStorage.getItem("auth") === "1";
}

// Redirección si no está logueado
(function protectAdmin() {
  const onAdmin = location.pathname.endsWith("admin.html");
  if (onAdmin && !isAuth()) {
    location.replace("../index.html");
  }
})();

// =======================
// Manejo del login (index.html)
// =======================
(function initLogin() {
  const form = document.getElementById("loginForm");
  const err = document.getElementById("loginError");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = form.username.value.trim();

    if (form.password.value === PASSWORD) {
      setAuth(true);
      sessionStorage.setItem("username", username || "Admin");
      location.href = "admin.html";
    } else {
      err.hidden = false;
    }
  });
})();

// =======================
// Manejo de Pedidos
// =======================
const LS_KEY = "orders";
let orders = loadOrders();
let currentFilter = "todos";

// Cargar pedidos desde localStorage o datos de ejemplo
function loadOrders() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : sampleOrders();
  } catch {
    return sampleOrders();
  }
}

// Guardar pedidos
function saveOrders(list) {
  orders = list;
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// Datos de ejemplo
function sampleOrders() {
  return [
    { id: 1, cliente: "Valentina", producto: "Hamburgesas", fecha: "2025-09-01", estado: "pendiente" },
    { id: 2, cliente: "Diego", producto: "Papas", fecha: "2025-09-02", estado: "en_proceso" },
    { id: 3, cliente: "Lucía", producto: "Bebidas + Hamburgesas", fecha: "2025-09-03", estado: "entregado" },
  ];
}

// =======================
// Renderizar tabla
// =======================
function render() {
  const tbody = document.querySelector("#ordersTable tbody");
  if (!tbody) return;

  tbody.innerHTML = ""; // limpiar tabla

  const filtered = orders.filter(o => currentFilter === "todos" || o.estado === currentFilter);

  filtered.forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${o.cliente}</td>
      <td>${o.producto}</td>
      <td>${o.fecha}</td>
      <td>${o.estado}</td>
      <td>
        <button class="btn btn--small btn-edit" data-id="${o.id}">Editar</button>
        <button class="btn btn--small btn-delete" data-id="${o.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Asignar los listeners a los botones recién creados
  attachEditButtons();
  attachDeleteButtons();
}

// =======================
// Funciones de Editar y Eliminar
// =======================
function attachEditButtons() {
  const editModal = document.getElementById("editModal");
  const closeModal = document.getElementById("closeEditModal");
  const editForm = document.getElementById("editForm");
  let currentEditId = null;

  document.querySelectorAll(".btn-edit").forEach(btn =>
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      const order = orders.find(o => o.id === id);
      if (!order) return;

      currentEditId = id;
      editForm.cliente.value = order.cliente;
      editForm.producto.value = order.producto;
      editForm.estado.value = order.estado;

      editModal.style.display = "block";
    })
  );

  closeModal.onclick = () => {
    editModal.style.display = "none";
  };

  window.onclick = (e) => {
    if (e.target === editModal) editModal.style.display = "none";
  };

  editForm.onsubmit = (e) => {
    e.preventDefault();
    const order = orders.find(o => o.id === currentEditId);
    if (!order) return;

    order.cliente = editForm.cliente.value.trim();
    order.producto = editForm.producto.value.trim();
    order.estado = editForm.estado.value;

    saveOrders(orders);
    render();
    editModal.style.display = "none";
  };
}

function attachDeleteButtons() {
  document.querySelectorAll(".btn-delete").forEach(btn =>
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      orders = orders.filter(o => o.id !== id);
      saveOrders(orders);
      render();
    })
  );
}

// =======================
// Filtros por tarjetas
// =======================
document.querySelectorAll(".card--click").forEach(card =>
  card.addEventListener("click", () => {
    currentFilter = card.dataset.filter;
    setActiveCard(card);
    render();
  })
);

function setActiveCard(activeCard) {
  document.querySelectorAll(".card--click").forEach(c => c.classList.remove("is-active"));
  activeCard.classList.add("is-active");
}

// =======================
// Filtros por tabs
// =======================
document.querySelectorAll(".tab").forEach(tab =>
  tab.addEventListener("click", () => {
    currentFilter = tab.dataset.filter;
    setActiveTab(tab);
    render();
  })
);

function setActiveTab(activeTab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("is-active"));
  activeTab.classList.add("is-active");
}

// =======================
// Agregar pedido rápido
// =======================
const quickAddForm = document.getElementById("quickAddForm");
if (quickAddForm) {
  quickAddForm.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(quickAddForm);
    const cliente = formData.get("cliente").trim();
    const producto = formData.get("producto").trim();
    const estado = formData.get("estado");

    if (!cliente || !producto || !estado) return;

    const newId = orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    const fecha = new Date().toISOString().split("T")[0];

    orders.push({ id: newId, cliente, producto, fecha, estado });
    saveOrders(orders);
    render();

    quickAddForm.reset();
  });
}

// =======================
// Inicializar tabla al cargar
// =======================
render();
