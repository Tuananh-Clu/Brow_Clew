function rendercategoryButtons(categories) {
  const filter = ["Best Seller", "New", "Coffee", "Milkshake", "Matcha", "Smoothie", "Ice Drink"];
  const productCategories = document.getElementById('product-filters');

  filter.forEach(category => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    if (category === 'Tất cả') btn.classList.add('active');
    btn.textContent = category;
    productCategories.appendChild(btn);
  });
}

async function initProducts() {
  try {
    let products = [];
    if (typeof CuaHang !== 'undefined' && CuaHang.layMon().length) {
      products = CuaHang.layMon();
    } else {
      const productsRes = await fetch('data/ProductsDetail.json');
      products = await productsRes.json();
    }

    const ordersRes = await fetch('data/orders.json');
    const orders = await ordersRes.json();

    const bestSellerIds = calculateBestSellers(orders);

    const enrichedProducts = products.map(p => ({
      ...p,
      isBestSeller: bestSellerIds.includes(p.id),
      isNew: p.isNew || false
    }));

    renderProductGrid(enrichedProducts);
    rendercategoryButtons([]);
    setupFilters(enrichedProducts);
    setupCustomizeModal(enrichedProducts);

  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function calculateBestSellers(orders) {
  const productCounts = {};
  const datalist = [];

  orders.forEach(order => {
    if (order.items) {
      order.items.forEach(item => {
        datalist.push({ id: item.productId, quantity: item.quantity });
      });
    }
  });
  const dataList = Object.values(datalist.reduce((acc, cur) => {
    if (acc[cur.id]) {
      acc[cur.id].quantity += cur.quantity;
    } else {
      acc[cur.id] = { ...cur };
    }
    return acc;
  }, {}));

  return dataList
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(item => item.id);
}

function renderProductGrid(products) {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '';

  const likedProducts = BrewStorage.duLieu.monThich;

  products.forEach(product => {
    const card = document.createElement('article');
    card.className = 'artistic-product-card';
    card.setAttribute('data-category', product.category);
    card.setAttribute('data-bestseller', product.isBestSeller);
    card.setAttribute('data-new', product.isNew);

    const isLiked = likedProducts.some(p => p.id === product.id);

    card.innerHTML = `
      ${product.isBestSeller ? '<div class="badge badge-bestseller"><i class="fa-solid fa-fire"></i> Best Seller</div>' : ''}
      ${product.isNew ? '<div class="badge badge-new">Mới</div>' : ''}
      <button class="btn-like-card ${isLiked ? 'liked' : ''}" data-product-id="${product.id}" aria-label="Thích sản phẩm">
        <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
      </button>
      <a href="product-detail.html?id=${product.id}" style="text-decoration: none; color: inherit; display: block;">
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
      </a>
      <div class="price-wrap">
        <span class="price">${product.price.toLocaleString('vi-VN')}đ</span>
        <button class="btn-add"><i class="fa-solid fa-plus"></i></button>
      </div>
    `;
    grid.appendChild(card);
  });

  setupCardLikeButtons();
}

function setupFilters(products) {
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterValue = btn.textContent;

      let filtered = products;

      if (filterValue === 'Best Seller') {
        filtered = products.filter(p => p.isBestSeller);
      } else if (filterValue === 'New') {
        filtered = products.filter(p => p.isNew);
      } else if (filterValue !== 'Tất cả') {
        filtered = products.filter(p => p.category === filterValue);
      }

      renderProductGrid(filtered);
    });
  });
}

document.addEventListener('DOMContentLoaded', initProducts);


function setupCardLikeButtons() {
  document.querySelectorAll('.btn-like-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const productId = parseInt(btn.dataset.productId);
      const likedProducts = BrewStorage.duLieu.monThich;
      const index = likedProducts.findIndex(p => p.id === productId);

      if (index > -1) {
        likedProducts.splice(index, 1);
        btn.classList.remove('liked');
        btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      } else {
        const card = btn.closest('.artistic-product-card');
        const title = card.querySelector('h3').textContent;
        const img = card.querySelector('img').src;
        likedProducts.push({ id: productId, name: title, image: img });
        btn.classList.add('liked');
        btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
      }

      BrewStorage.luu();
    });
  });
}

function setupCustomizeModal(products) {
  const modal = document.getElementById('customizeModal');
  const overlay = document.getElementById('customizeOverlay');
  const closeBtn = document.getElementById('customizeClose');
  const grid = document.getElementById('product-grid');

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-add');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const card = btn.closest('.artistic-product-card');
    const productId = parseInt(card.querySelector('.btn-like-card').dataset.productId);
    const product = products.find(p => p.id === productId);

    if (product) {
      openCustomizeModal(product, products);
    }
  });

  closeBtn.addEventListener('click', closeCustomizeModal);
  overlay.addEventListener('click', closeCustomizeModal);

  function openCustomizeModal(product, allProducts) {
    const productDetail = allProducts.find(p => p.id === product.id);

    document.getElementById('modalProductImg').src = product.image;
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductPrice').textContent = `${product.price.toLocaleString('vi-VN')}đ`;
    document.getElementById('modalTotalPrice').textContent = `${product.price.toLocaleString('vi-VN')}đ`;
    document.getElementById('modalQty').value = 1;

    const optionsDiv = document.getElementById('modalCustomizationOptions');
    optionsDiv.innerHTML = '';

    if (productDetail?.options?.length > 0) {
      renderModalOptions(productDetail.options);
    }

    if (productDetail?.toppings?.length > 0) {
      renderModalToppings(productDetail.toppings);
    }

    modal.classList.add('active');

    setupModalQuantity(product);
    setupModalAddBtn(product);
  }

  function closeCustomizeModal() {
    modal.classList.remove('active');
  }

  function setupModalQuantity(product) {
    const qtyInput = document.getElementById('modalQty');
    const minusBtn = document.getElementById('modalQtyMinus');
    const plusBtn = document.getElementById('modalQtyPlus');
    const totalPrice = document.getElementById('modalTotalPrice');

    minusBtn.onclick = () => {
      if (qtyInput.value > 1) qtyInput.value--;
      totalPrice.textContent = (product.price * qtyInput.value).toLocaleString('vi-VN') + 'đ';
    };

    plusBtn.onclick = () => {
      qtyInput.value++;
      totalPrice.textContent = (product.price * qtyInput.value).toLocaleString('vi-VN') + 'đ';
    };
  }

  function setupModalAddBtn(product) {
    const addBtn = document.getElementById('modalAddBtn');
    const saveBtn = document.getElementById('modalSaveBtn');

    saveBtn.onclick = () => {
      showSaveRecipeModal(product);
    };

    addBtn.onclick = () => {
      const qty = parseInt(document.getElementById('modalQty').value);
      const cartItem = createCartItem(product, qty);
      addToCart(cartItem);

      addBtn.textContent = '✓ Đã thêm vào giỏ';
      setTimeout(() => {
        addBtn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Thêm vào giỏ - <span>' + (product.price * qty).toLocaleString('vi-VN') + 'đ</span>';
        closeCustomizeModal();
      }, 1000);
    };
  }

  function createCartItem(product, quantity) {
    const options = {};
    document.querySelectorAll('#customizeForm input[type="radio"]:checked').forEach(opt => {
      options[opt.name] = opt.value;
    });

    const toppings = [];
    document.querySelectorAll('#customizeForm input[type="checkbox"]:checked').forEach(opt => {
      toppings.push(opt.value);
    });

    return {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      productPrice: product.price,
      quantity: quantity,
      options: options,
      toppings: toppings,
      totalPrice: product.price * quantity,
      addedAt: new Date().toISOString()
    };
  }

  function addToCart(item) {
    BrewStorage.duLieu.gioHang.push(item);
    BrewStorage.luu();
  }

  function showSaveRecipeModal(product) {
    const saveModal = document.getElementById('saveRecipeModal');
    const recipeInput = document.getElementById('recipeNameInput');
    const previewDiv = document.getElementById('recipePreview');
    const confirmBtn = document.getElementById('confirmSaveBtn');
    const cancelBtn = document.getElementById('cancelSaveBtn');
    const closeBtn = document.getElementById('saveRecipeClose');

    recipeInput.value = '';
    recipeInput.focus();

    const previewHtml = getRecipePreview(product);
    previewDiv.innerHTML = previewHtml;

    saveModal.classList.add('active');

    confirmBtn.onclick = () => {
      const name = recipeInput.value.trim();
      if (!name) {
        alert('Vui lòng đặt tên cho recipe');
        return;
      }
      saveRecipeToStorage(product, name);
      saveModal.classList.remove('active');
      alert('✓ Recipe đã lưu!');
    };

    cancelBtn.onclick = closeBtn.onclick = () => {
      saveModal.classList.remove('active');
    };

    document.getElementById('saveRecipeOverlay').onclick = () => {
      saveModal.classList.remove('active');
    };
  }

  function getRecipePreview(product) {
    const options = Array.from(document.querySelectorAll('.customization-form input[type="radio"]:checked, .customization-form input[type="checkbox"]:checked'));
    const selectedOptions = options.map(opt => opt.closest('.option-pill, .topping-card'));

    let html = `<div class="recipe-preview-item"><strong>${product.name}</strong></div>`;

    const checkedOptions = document.querySelectorAll('#customizeForm input[type="radio"]:checked');
    checkedOptions.forEach(opt => {
      const label = opt.closest('.option-pill').querySelector('.pill-text').textContent;
      const groupLabel = opt.closest('.custom-group').querySelector('.custom-label').textContent;
      html += `<div class="recipe-preview-item"><strong>${groupLabel}:</strong> ${label}</div>`;
    });

    const checkedToppings = document.querySelectorAll('#customizeForm input[type="checkbox"]:checked');
    checkedToppings.forEach(opt => {
      const name = opt.closest('.topping-card').querySelector('.topping-name').textContent;
      html += `<div class="recipe-preview-item">+ ${name}</div>`;
    });

    return html;
  }

  function saveRecipeToStorage(product, name) {
    const recipes = BrewStorage.duLieu.congThuc;

    const checkedOptions = {};
    document.querySelectorAll('#customizeForm input[type="radio"]:checked').forEach(opt => {
      checkedOptions[opt.name] = opt.value;
    });

    const checkedToppings = [];
    document.querySelectorAll('#customizeForm input[type="checkbox"]:checked').forEach(opt => {
      checkedToppings.push(opt.value);
    });

    const recipe = {
      id: Date.now(),
      name,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      options: checkedOptions,
      toppings: checkedToppings,
      savedAt: new Date().toLocaleString('vi-VN')
    };

    recipes.push(recipe);
    BrewStorage.luu();
  }

  function renderModalOptions(options) {
    const iconMap = {
      size: "📏",
      temperature: "🌡️",
      ice: "🧊",
      sugar: "🍯",
      milk: "🥛",
      strength: "💪",
      foam: "☁️",
      flavor: "✨"
    };

    const div = document.getElementById('modalCustomizationOptions');

    options.forEach(option => {
      const group = document.createElement('div');
      group.className = 'custom-group';

      const label = document.createElement('label');
      label.className = 'custom-label';
      label.setAttribute('data-icon', iconMap[option.id.toLowerCase()] || '🔹');
      label.textContent = option.label;

      const row = document.createElement('div');
      row.className = 'options-row';

      option.choices.forEach(choice => {
        const pill = document.createElement('label');
        pill.className = 'option-pill';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = option.id;
        input.value = choice.value;
        input.checked = choice.default || false;

        const pillText = document.createElement('span');
        pillText.className = 'pill-text';
        pillText.textContent = choice.label;

        pill.appendChild(input);
        pill.appendChild(pillText);
        row.appendChild(pill);
      });

      group.appendChild(label);
      group.appendChild(row);
      div.appendChild(group);
    });
  }

  function renderModalToppings(toppings) {
    document.getElementById('modalToppingsSection').style.display = 'block';
    const grid = document.getElementById('modalToppingsGrid');
    grid.innerHTML = '';

    toppings.forEach(topping => {
      const card = document.createElement('label');
      card.className = 'topping-card';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = topping.id;

      const content = document.createElement('div');
      content.className = 'topping-content';

      const name = document.createElement('span');
      name.className = 'topping-name';
      name.textContent = topping.name;

      const price = document.createElement('span');
      price.className = 'topping-price';
      price.textContent = `+${topping.price.toLocaleString('vi-VN')}đ`;

      content.appendChild(name);
      content.appendChild(price);
      card.appendChild(input);
      card.appendChild(content);
      grid.appendChild(card);
    });
  }
}
