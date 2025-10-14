document.addEventListener("DOMContentLoaded", function () {
  const addToCartButtons = document.querySelectorAll("#add-tocart button");
  let cart = [];

  const cartContainer = document.querySelector(".cart");
  const cartTitle = cartContainer.querySelector("h2");
  const cartItems = cartContainer.querySelector("p");
  const cartImage = cartContainer.querySelector("img");

  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Confirm Order";

  // === Modal setup ===
  const modalOverlay = document.createElement("div");
  modalOverlay.classList.add("modal-overlay");
  modalOverlay.style.display = "none";

  const modalBox = document.createElement("div");
  modalBox.classList.add("modal-box");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");

  const startNewOrderButton = document.createElement("button");
  startNewOrderButton.textContent = "Start New Order";
  startNewOrderButton.classList.add("start-new-order");

  modalBox.append(modalContent, startNewOrderButton);
  modalOverlay.appendChild(modalBox);
  document.body.appendChild(modalOverlay);

  // === Update Cart Sidebar ===
  function updateCart() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
      cartTitle.textContent = "Your Cart (0)";
      cartItems.textContent = "You added items will appear here";
      if (cartImage) cartImage.style.display = "block";
      if (cartContainer.contains(confirmButton))
        cartContainer.removeChild(confirmButton);
      return;
    }

    if (cartImage) cartImage.style.display = "none";

    let totalItems = 0;
    let totalPrice = 0;

    const productList = document.createElement("div");
    productList.classList.add("cart-product-list");

    cart.forEach((item) => {
      totalItems += item.quantity;
      totalPrice += item.quantity * item.price;

      const productDiv = document.createElement("div");
      productDiv.classList.add("cart-product");

      productDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-thumb">
        <div class="cart-details">
          <h4>${item.name}</h4>
          <p>${item.quantity} × $${item.price.toFixed(2)}</p>
          <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
        </div>
        <button class="remove" data-name="${item.name}">Remove</button>
      `;

      productList.appendChild(productDiv);
    });

    cartItems.appendChild(productList);

    const totalDiv = document.createElement("div");
    totalDiv.classList.add("cart-total");
    totalDiv.innerHTML = `<strong>Total: $${totalPrice.toFixed(2)}</strong>`;
    cartItems.appendChild(totalDiv);

    cartTitle.textContent = `Your Cart (${totalItems})`;

    if (!cartContainer.contains(confirmButton)) {
      cartContainer.appendChild(confirmButton);
    }

    // Remove buttons in sidebar
    document.querySelectorAll(".remove").forEach((button) => {
      button.addEventListener("click", (e) => {
        const name = e.target.dataset.name;
        cart = cart.filter((item) => item.name !== name);
        updateCart();
        updateButtonUI(name);
      });
    });
  }

  // === Add Item to Cart ===
  function addToCart(name, price, image) {
    const existingItem = cart.find((item) => item.name === name);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ name, price, quantity: 1, image });
    }
    updateCart();
    updateButtonUI(name);
  }

  // === Decrement Item ===
  function decrementItem(name) {
    const item = cart.find((i) => i.name === name);
    if (!item) return;

    item.quantity--;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.name !== name);
    }
    updateCart();
    updateButtonUI(name);
  }

  // === Update Button UI ===
  function updateButtonUI(name) {
    document.querySelectorAll(".product-card").forEach((card) => {
      const title = card.querySelector("h3").textContent;
      if (title === name) {
        const buttonContainer = card.querySelector("#add-tocart");
        const button = buttonContainer.querySelector("button");

        // Remove old small quantity controls
        let controls = buttonContainer.querySelector(".quantity-controls");
        if (controls) controls.remove();

        const item = cart.find((i) => i.name === name);
        if (item) {
          // Create small + and − buttons next to the Add to Cart button
          controls = document.createElement("div");
          controls.classList.add("quantity-controls");
          controls.style.display = "inline-flex";
          controls.style.alignItems = "center";
          controls.style.marginLeft = "5px";

          const decreaseBtn = document.createElement("button");
          decreaseBtn.textContent = "−";
          decreaseBtn.style.marginRight = "3px";

          const quantitySpan = document.createElement("span");
          quantitySpan.textContent = item.quantity;
          quantitySpan.style.marginRight = "3px";

          const increaseBtn = document.createElement("button");
          increaseBtn.textContent = "+";

          decreaseBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            decrementItem(name);
          });

          increaseBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            addToCart(name, item.price, item.image);
          });

          controls.append(decreaseBtn, quantitySpan, increaseBtn);
          buttonContainer.appendChild(controls);
        }
      }
    });
  }

  // === Initialize Buttons ===
  addToCartButtons.forEach((button) => {
    const productCard = button.closest(".product-card");
    const name = productCard.querySelector("h3").textContent;
    const priceText = productCard.querySelector(".price").textContent;
    const price = parseFloat(priceText.replace("$", ""));
    const image = productCard.querySelector("img").src;

    button.addEventListener("click", () => addToCart(name, price, image));
  });

  // === Confirm Order Modal ===
  confirmButton.addEventListener("click", function () {
    if (cart.length === 0) return;

    modalContent.innerHTML = "<h3>Your Order Summary</h3>";

    const productList = document.createElement("div");
    productList.classList.add("cart-product-list");

    let total = 0;

    cart.forEach((item) => {
      total += item.quantity * item.price;

      const productDiv = document.createElement("div");
      productDiv.classList.add("cart-product");

      productDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-thumb">
        <div class="cart-details">
          <h4>${item.name}</h4>
          <p>${item.quantity} × $${item.price.toFixed(2)}</p>
          <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
        </div>
      `;

      productList.appendChild(productDiv);
    });

    const totalLine = document.createElement("div");
    totalLine.classList.add("cart-total");
    totalLine.innerHTML = `<strong>Order Total: $${total.toFixed(2)}</strong>`;

    modalContent.append(productList, totalLine);
    modalOverlay.style.display = "flex";
  });

  startNewOrderButton.addEventListener("click", function () {
    modalOverlay.style.display = "none";
    cart = [];
    updateCart();
    document.querySelectorAll(".quantity-controls").forEach(c => c.remove());
  });

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.style.display = "none";
  });

  updateCart();
});
