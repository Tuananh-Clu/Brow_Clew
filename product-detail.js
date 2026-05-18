document.addEventListener("DOMContentLoaded", async () => {
  // Utility to get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  let productId = urlParams.get('id') || 'macchiato'; // Default to macchiato

  try {
    const response = await fetch('ProductsDetail.json');
    const products = await response.json();

    // Find product
    const product = products.find(p => p.id == productId);
    if (!product) {
      console.error("Product not found");
      return;
    }

    renderProduct(product);
  } catch (err) {
    console.error("Failed to load product data:", err);
  }
});

function renderProduct(product) {
  // Update Title & Meta
  document.title = `${product.name} - Bold Brew`;
  document.querySelector('.breadcrumbs span').textContent = product.name;
  document.querySelector('.detail-title').textContent = product.name;
  document.querySelector('.detail-desc').textContent = product.description;

  // Update Image
  const imgWrapper = document.querySelector('.image-wrapper img');
  imgWrapper.src = product.image;
  imgWrapper.alt = product.name;

  // Update Theme Glow
  if (product.theme && product.theme.primary) {
    document.querySelector('.glow-effect').style.background = product.theme.primary;
  }

  // Format currency
  const formatPrice = (price) => {
    if (product.currency === 'USD') return `$${price.toFixed(2)}`;
    return `${price.toLocaleString('vi-VN')} ₫`;
  };

  // Base price
  const basePriceEl = document.getElementById("base-price");
  basePriceEl.dataset.price = product.price;
  basePriceEl.textContent = formatPrice(product.price);

  // Render Options (Sugar, Ice)
  const form = document.getElementById("addToCartForm");

  // Clear existing static options/toppings containers except the action row
  const actionRow = document.querySelector('.action-row');
  const existingGroups = document.querySelectorAll('.custom-group');
  existingGroups.forEach(g => g.remove());

  // Helper to create option groups
  const createOptionGroup = (option) => {
    const group = document.createElement('div');
    group.className = 'custom-group';

    const label = document.createElement('label');
    label.className = 'custom-label';
    label.textContent = option.label;
    group.appendChild(label);

    const row = document.createElement('div');
    row.className = 'options-row';

    option.choices.forEach(choice => {
      const pill = document.createElement('label');
      pill.className = 'option-pill';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = option.id;
      input.value = choice.value;
      if (choice.default) input.checked = true;

      const span = document.createElement('span');
      span.className = 'pill-text';
      span.textContent = choice.label;

      pill.appendChild(input);
      pill.appendChild(span);
      row.appendChild(pill);
    });

    group.appendChild(row);
    return group;
  };

  // Helper to create toppings
  const createToppingsGroup = (toppings) => {
    if (!toppings || toppings.length === 0) return null;

    const group = document.createElement('div');
    group.className = 'custom-group';

    const label = document.createElement('label');
    label.className = 'custom-label';
    label.textContent = 'Món Đi Kèm (Toppings)';
    group.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'toppings-grid';

    toppings.forEach(topping => {
      const card = document.createElement('label');
      card.className = 'topping-card';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'topping';
      input.value = topping.id;
      input.dataset.price = topping.price;

      const content = document.createElement('div');
      content.className = 'topping-content';

      const name = document.createElement('span');
      name.className = 'topping-name';
      name.textContent = topping.name;

      const price = document.createElement('span');
      price.className = 'topping-price';
      price.textContent = `+${formatPrice(topping.price)}`;

      content.appendChild(name);
      content.appendChild(price);
      card.appendChild(input);
      card.appendChild(content);
      grid.appendChild(card);
    });

    group.appendChild(grid);
    return group;
  };

  // Insert newly created elements
  if (product.options) {
    product.options.forEach(opt => {
      form.insertBefore(createOptionGroup(opt), actionRow);
    });
  }

  const toppingsGroup = createToppingsGroup(product.toppings);
  if (toppingsGroup) {
    form.insertBefore(toppingsGroup, actionRow);
  }

  // --- INTERACTIVITY LOGIC ---
  const totalPriceEl = document.getElementById("total-price");
  const qtyInput = document.getElementById("qty");
  const btnMinus = document.querySelector(".qty-btn.minus");
  const btnPlus = document.querySelector(".qty-btn.plus");

  const calculateTotal = () => {
    let total = product.price;

    const toppings = document.querySelectorAll('input[name="topping"]:checked');
    toppings.forEach(t => {
      total += parseFloat(t.dataset.price);
    });

    const qty = parseInt(qtyInput.value) || 1;
    total *= qty;

    totalPriceEl.textContent = formatPrice(total);
  };

  const toppingInputs = document.querySelectorAll('input[name="topping"]');
  toppingInputs.forEach(input => {
    input.addEventListener("change", calculateTotal);
  });

  const newMinus = btnMinus.cloneNode(true);
  const newPlus = btnPlus.cloneNode(true);
  btnMinus.replaceWith(newMinus);
  btnPlus.replaceWith(newPlus);

  newMinus.addEventListener("click", () => {
    let currentQty = parseInt(qtyInput.value);
    if (currentQty > 1) {
      qtyInput.value = currentQty - 1;
      calculateTotal();
    }
  });

  newPlus.addEventListener("click", () => {
    let currentQty = parseInt(qtyInput.value);
    qtyInput.value = currentQty + 1;
    calculateTotal();
  });

  // Initial Calculation
  qtyInput.value = 1;
  calculateTotal();

  // Submit Handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btnSubmit = form.querySelector(".btn-add-cart");
    const originalText = btnSubmit.innerHTML;

    btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Đã thêm vào giỏ';
    btnSubmit.style.background = '#28a745';
    btnSubmit.style.borderColor = '#28a745';
    btnSubmit.style.color = '#fff';
    btnSubmit.style.boxShadow = 'none';

    setTimeout(() => {
      btnSubmit.innerHTML = originalText;
      btnSubmit.style.background = '';
      btnSubmit.style.borderColor = '';
      btnSubmit.style.color = '';
      btnSubmit.style.boxShadow = '';
    }, 2000);
  });
}
