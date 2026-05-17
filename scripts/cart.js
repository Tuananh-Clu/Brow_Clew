let discountAmount = 0;
const TAX_RATE = 0.08;

function loadCart() {
  const cart = BrewStorage.getCart() || [];
  const container = document.querySelector('.cart-items-col');
  const itemsDiv = document.createElement('div');
  itemsDiv.id = 'cart-items-container';

  if (cart.length === 0) {
    renderEmptyCart();
    return;
  }

  let html = `
    <div class="cart-items-header">
      <span class="cart-count-label" id="item-count-label">${cart.length} sản phẩm trong giỏ</span>
      <button class="cart-clear-btn" id="clear-cart-btn">
        <i class="fa-regular fa-trash-can"></i> Xóa tất cả
      </button>
    </div>
  `;

  cart.forEach((item, index) => {
    const optionsHtml = Object.entries(item.options || {})
      .map(([key, val]) => `<span class="cart-meta-tag"><i class="fa-solid fa-cog"></i> ${key}: ${val}</span>`)
      .join('');

    const toppingsHtml = (item.toppings || [])
      .map(topping => `<span class="cart-meta-tag"><i class="fa-solid fa-star"></i> ${topping}</span>`)
      .join('');

    const metaTags = optionsHtml + toppingsHtml;

    html += `
      <div class="cart-item" id="cart-item-${index}">
        <div class="cart-item-img-wrap">
          <img src="${item.productImage}" alt="${item.productName}">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-top">
            <div>
              <h3 class="cart-item-name">${item.productName}</h3>
              <div class="cart-item-meta">
                ${metaTags}
              </div>
            </div>
            <button class="cart-item-remove" aria-label="Xóa sản phẩm" onclick="removeCartItem(${index})">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="cart-item-bottom">
            <div class="qty-control">
              <button class="qty-btn" onclick="changeCartQty(${index}, -1)" aria-label="Giảm">
                <i class="fa-solid fa-minus"></i>
              </button>
              <span class="qty-val" id="qty-cart-item-${index}">${item.quantity}</span>
              <button class="qty-btn" onclick="changeCartQty(${index}, 1)" aria-label="Tăng">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
            <div class="cart-item-price">
              <span class="cart-item-unit-price">${(item.productPrice).toLocaleString('vi-VN')}đ / cái</span>
              <strong class="cart-item-total-price" id="price-cart-item-${index}">${(item.productPrice * item.quantity).toLocaleString('vi-VN')}đ</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += `
    <div class="promo-section">
      <p class="promo-label"><i class="fa-solid fa-tag"></i> Mã giảm giá</p>
      <div class="promo-form">
        <input type="text" id="promo-input" placeholder="Nhập mã giảm giá của bạn..." class="promo-input">
        <button class="btn btn-black" id="apply-promo-btn" onclick="applyPromo()">Áp dụng</button>
      </div>
      <p class="promo-hint" id="promo-msg"></p>
    </div>
  `;

  itemsDiv.innerHTML = html;

  const oldContainer = document.getElementById('cart-items-container');
  if (oldContainer) {
    oldContainer.replaceWith(itemsDiv);
  } else {
    const promoSection = document.querySelector('.promo-section');
    if (promoSection) {
      promoSection.remove();
    }
    container.appendChild(itemsDiv);
  }

  document.getElementById('clear-cart-btn').addEventListener('click', clearCart);
  document.getElementById('checkout-btn').addEventListener('click', () => {
    const cart = BrewStorage.getCart() || [];
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống');
      return;
    }
    window.location.href = 'thanh-toan.html';
  });
  recalcCart();
}

function renderEmptyCart() {
  const container = document.querySelector('.cart-items-col');
  const oldContainer = document.getElementById('cart-items-container');
  if (oldContainer) oldContainer.remove();

  container.innerHTML = `
    <div class="cart-empty" style="display: flex;">
      <div class="cart-empty-icon">
        <i class="fa-solid fa-mug-hot"></i>
      </div>
      <h3>Giỏ hàng đang trống</h3>
      <p>Hãy thêm vài món cà phê yêu thích của bạn nhé!</p>
      <a href="product.html" class="btn btn-orange">Khám phá sản phẩm</a>
    </div>
  `;
}

function recalcCart() {
  const cart = BrewStorage.getCart() || [];
  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.productPrice * item.quantity;
  });

  const tax = subtotal * TAX_RATE;
  const total = subtotal - discountAmount + tax;

  document.getElementById('summary-subtotal').textContent = subtotal.toLocaleString('vi-VN') + 'đ';
  document.getElementById('summary-tax').textContent = (tax).toLocaleString('vi-VN') + 'đ';
  document.getElementById('summary-total').textContent = total.toLocaleString('vi-VN') + 'đ';
  document.getElementById('summary-count').textContent = cart.length;
  document.getElementById('item-count-label').textContent = cart.length + ' sản phẩm trong giỏ';

  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = cart.length;

  if (cart.length === 0) {
    document.getElementById('cart-empty').style.display = 'flex';
    document.getElementById('checkout-btn').disabled = true;
  } else {
    document.getElementById('cart-empty').style.display = 'none';
    document.getElementById('checkout-btn').disabled = false;
  }
}

function changeCartQty(index, delta) {
  const cart = BrewStorage.getCart() || [];
  const item = cart[index];

  if (!item) return;

  const newQty = item.quantity + delta;
  if (newQty < 1) return;

  item.quantity = newQty;
  item.totalPrice = item.productPrice * newQty;

  BrewStorage.setCart(cart);

  document.getElementById('qty-cart-item-' + index).textContent = newQty;
  document.getElementById('price-cart-item-' + index).textContent = (item.productPrice * newQty).toLocaleString('vi-VN') + 'đ';

  recalcCart();
}

function removeCartItem(index) {
  const el = document.getElementById('cart-item-' + index);
  if (!el) return;

  el.classList.add('removing');
  setTimeout(() => {
    const cart = BrewStorage.getCart() || [];
    cart.splice(index, 1);
    BrewStorage.setCart(cart);

    loadCart();
  }, 350);
}

function clearCart() {
  if (!confirm('Xóa tất cả sản phẩm trong giỏ?')) return;
  BrewStorage.clearCart();
  document.getElementById('cart-badge').textContent = '0';
  document.getElementById('summary-subtotal').textContent = '0đ';
  document.getElementById('summary-tax').textContent = '0đ';
  document.getElementById('summary-total').textContent = '0đ';

  loadCart();
}

function applyPromo() {
  const code = document.getElementById('promo-input').value.trim().toUpperCase();
  const msg = document.getElementById('promo-msg');
  const row = document.getElementById('discount-row');

  if (code === 'BOLDBREW10') {
    discountAmount = 30000;
    row.style.display = 'flex';
    document.getElementById('discount-val').textContent = '-30,000đ';
    msg.textContent = '✓ Mã BOLDBREW10 đã được áp dụng! Giảm 30,000đ';
    msg.style.color = 'var(--brand-orange)';
  } else {
    discountAmount = 0;
    row.style.display = 'none';
    msg.textContent = '✗ Mã giảm giá không hợp lệ.';
    msg.style.color = '#e53e3e';
  }
  recalcCart();
}

document.addEventListener('DOMContentLoaded', loadCart);
