const PRODUCTS = [
  {
    id: "h1",
    category: "hamburguesas",
    name: "Clásica",
    price: 5,
    desc: "Hamburguesa clásica con lechuga, tomate y queso.",
  },
  {
    id: "h2",
    category: "hamburguesas",
    name: "Cheese Burger",
    price: 6.5,
    desc: "Con doble queso cheddar fundido y salsa especial.",
  },
  {
    id: "h3",
    category: "hamburguesas",
    name: "Doble Carne",
    price: 8,
    desc: "Dos hamburguesas de carne 100% vacuno y queso.",
  },
  {
    id: "p1",
    category: "papas",
    name: "Papas Pequeñas",
    price: 2.5,
    desc: "Porción pequeña de papas fritas crujientes.",
  },
  {
    id: "p2",
    category: "papas",
    name: "Papas Medianas",
    price: 3.5,
    desc: "Porción mediana de papas fritas crujientes.",
  },
  {
    id: "p3",
    category: "papas",
    name: "Papas Grandes",
    price: 4.5,
    desc: "Porción grande de papas fritas crujientes.",
  },
  {
    id: "b1",
    category: "bebidas",
    name: "Coca-Cola",
    price: 1.5,
    desc: "Refresco de 500ml.",
  },
  {
    id: "b2",
    category: "bebidas",
    name: "Sprite",
    price: 1.5,
    desc: "Refresco de 500ml.",
  },
  {
    id: "b3",
    category: "bebidas",
    name: "Agua Mineral",
    price: 1,
    desc: "Botella de agua 500ml.",
  },
  {
    id: "s1",
    category: "salsas",
    name: "Ketchup",
    price: 0.5,
    desc: "Salsa de tomate.",
  },
  {
    id: "s2",
    category: "salsas",
    name: "Mostaza",
    price: 0.5,
    desc: "Salsa de mostaza amarilla.",
  },
  {
    id: "s3",
    category: "salsas",
    name: "BBQ",
    price: 0.7,
    desc: "Salsa barbacoa dulce.",
  },
  {
    id: "a1",
    category: "agregados",
    name: "Alitas BBQ",
    price: 4,
    desc: "Alitas de pollo con salsa BBQ.",
  },
  {
    id: "a2",
    category: "agregados",
    name: "Nuggets",
    price: 3.5,
    desc: "Nuggets de pollo crujientes.",
  },
  {
    id: "a3",
    category: "agregados",
    name: "Aros de Cebolla",
    price: 3,
    desc: "Aros de cebolla rebozados y crujientes.",
  },
];

let cart = {};
const STORAGE_KEY = "fastfood_cart_v4";

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}
function loadCart() {
  cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
}

const formatPrice = (v) => "$" + Number(v).toFixed(2);

function updateCartCount() {
  const count = Object.keys(cart).length;
  $("#cart-count").textContent = count;
}

function renderProducts(category = "hamburguesas") {
  const container = $("#products");
  container.innerHTML = "";

  let filtered = category === "todos" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

  filtered.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p>${formatPrice(p.price)}</p>
    `;
    container.appendChild(card);

    card.addEventListener("click", () => {
      openProductModal(p.id);
    });
  });
}


function openProductModal(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  $("#modal-name").textContent = product.name;
  $("#modal-desc").textContent = product.desc;
  $("#modal-price").textContent = "Precio: " + formatPrice(product.price);
  $("#modal-qty").value = 1;
  $("#product-modal").style.display = "block";

  $("#modal-inc").onclick = () => {
    $("#modal-qty").value = parseInt($("#modal-qty").value) + 1;
  };
  $("#modal-dec").onclick = () => {
    if (parseInt($("#modal-qty").value) > 1)
      $("#modal-qty").value = parseInt($("#modal-qty").value) - 1;
  };

  $("#modal-add").onclick = () => {
    const qty = parseInt($("#modal-qty").value) || 1;
    cart[id] = (cart[id] || 0) + qty;
    saveCart();
    renderCartItems();
    updateCartCount();
    $("#product-modal").style.display = "none";
  };
}

$("#close-product").addEventListener(
  "click",
  () => ($("#product-modal").style.display = "none")
);
window.addEventListener("click", (e) => {
  if (e.target == $("#product-modal"))
    $("#product-modal").style.display = "none";
});

$$(".cat-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".cat-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.cat);
  });
});

const cartModal = $("#cart-modal");
$("#cart-btn").addEventListener("click", () => {
  renderCartItems();
  cartModal.style.display = "block";
});
$("#close-cart").addEventListener(
  "click",
  () => (cartModal.style.display = "none")
);
window.addEventListener("click", (e) => {
  if (e.target === cartModal) cartModal.style.display = "none";
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cartModal.style.display = "none";
});

function renderCartItems() {
  const ul = $("#cart-items");
  ul.innerHTML = "";
  let total = 0;
  for (const id in cart) {
    const p = PRODUCTS.find((x) => x.id === id);
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${p.name} - ${formatPrice(p.price)} x ${cart[id]}</span>
      <div>
        <button class="dec-cart" data-id="${id}">−</button>
        <button class="inc-cart" data-id="${id}">+</button>
        <button class="remove-cart" data-id="${id}">Eliminar</button>
      </div>
    `;
    ul.appendChild(li);
    total += p.price * cart[id];
  }
  $("#cart-total").textContent = total.toFixed(2);

  $$(".inc-cart").forEach(
    (b) =>
      (b.onclick = () => {
        cart[b.dataset.id]++;
        saveCart();
        renderCartItems();
        updateCartCount();
      })
  );
  $$(".dec-cart").forEach(
    (b) =>
      (b.onclick = () => {
        cart[b.dataset.id]--;
        if (cart[b.dataset.id] <= 0) delete cart[b.dataset.id];
        saveCart();
        renderCartItems();
        updateCartCount();
      })
  );
  $$(".remove-cart").forEach(
    (b) =>
      (b.onclick = () => {
        delete cart[b.dataset.id];
        saveCart();
        renderCartItems();
        updateCartCount();
      })
  );
}

$("#clear-cart").addEventListener("click", () => {
  if (confirm("¿Vaciar carrito?")) {
    cart = {};
    saveCart();
    renderCartItems();
    updateCartCount();
  }
});

$("#checkout").addEventListener("click", () => {
  if (Object.keys(cart).length === 0) {
    alert("El carrito está vacío");
    return;
  }
  alert(
    "Compra realizada. Total: " +
      formatPrice(
        Object.entries(cart).reduce(
          (s, [id, q]) => s + PRODUCTS.find((p) => p.id === id).price * q,
          0
        )
      )
  );
  cart = {};
  saveCart();
  renderCartItems();
  updateCartCount();
  cartModal.style.display = "none";
});

loadCart();
renderProducts("todos");
renderCartItems();
updateCartCount();
