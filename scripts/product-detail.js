var SuggestedData = null;
var cachedProducts = null;

async function getProducts() {
  if (!cachedProducts) {
    const { fetchProductsDetail } = await import('./services/db-service.js');
    cachedProducts = await fetchProductsDetail();
  }
  return cachedProducts;
}

async function suggestCustom(productId) {
  try {
    const { fetchOrders } = await import('./services/db-service.js');
    const [data, orders] = await Promise.all([
      getProducts(),
      fetchOrders(),
    ]);

    if (!data || !orders) return null;

    const listOrder = orders
      .flatMap((o) => o.items)
      .filter((i) => i.productId == productId);

    if (!listOrder.length) {
      return null;
    }

    // Combine iterations for efficiency
    const toppingCount = {};
    const optionCount = {};

    listOrder.forEach((item) => {
      item.toppings?.forEach((t) => {
        toppingCount[t.id] = (toppingCount[t.id] || 0) + 1;
      });

      Object.entries(item.options || {}).forEach(([k, v]) => {
        optionCount[k] = optionCount[k] || {};
        optionCount[k][v] = (optionCount[k][v] || 0) + 1;
      });
    });

    const findMaxId = (countObj) => {
      let maxId = null;
      let maxCount = 0;
      for (const [id, count] of Object.entries(countObj)) {
        if (count > maxCount) {
          maxCount = count;
          maxId = id;
        }
      }
      return maxId;
    };

    const topToppingId = findMaxId(toppingCount);

    const topOptions = {};
    Object.entries(optionCount).forEach(([k, v]) => {
      topOptions[k] = findMaxId(v);
    });

    const result = { topToppingId, topOptions };
    return result;
  } catch (e) {
    console.error("suggestCustom error:", e);
    return null;
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  const productId = new URLSearchParams(window.location.search).get("id") || 1;
  try {
    const { fetchHeroProducts } = await import('./services/db-service.js');
    const products = await fetchHeroProducts();
    if (!products) return;

    const product = products.find((p) => p.id == productId);
    if (!product) return;

    SuggestedData = await suggestCustom(productId);
    renderProduct(product);
  } catch (e) {
    console.error("Error loading product:", e);
  }
});


async function renderProduct(product) {
  updateProductInfo(product);
  await loadCustomizationOptions(product);
  renderIngredients(product);
  renderFeatures(product);
  await renderReviews(product);
  setupPriceAndQuantity(product);
  setupLikeButton(product);
}

function updateProductInfo(product) {
  document.querySelector(".detail-title").textContent = product.name;
  document.querySelector(".detail-subtitle").textContent = product.subtitle;
  document.querySelector(".detail-desc").textContent = product.description;
  document.querySelector(".image-wrapper img").src = product.image;
  document.querySelector(".image-wrapper img").alt = product.name;
}


async function loadCustomizationOptions(product) {
  try {
    const allProducts = await getProducts();
    if (!allProducts) return;

    const detail = allProducts.find((p) => p.id == product.id);
    if (!detail) return;

    if (detail.options?.length) renderOptions(detail.options, SuggestedData?.topOptions || {});
    if (detail.toppings?.length) renderToppings(detail.toppings, SuggestedData?.topToppingId || null);
    if (SuggestedData) renderSuggestCard(SuggestedData, detail);
  } catch (e) {
    console.error("Error loading customization:", e);
  }
}

function renderOptions(options, topOptions = {}) {
  const container = document.getElementById("customizationOptions");
  const iconMap = { ice: "🧊", sugar: "🍯", milk: "🥛", size: "📏", temperature: "🌡️", strength: "💪", foam: "☁️", flavor: "✨" };

  options.forEach((option) => {
    const group = document.createElement("div");
    group.classList.add("custom-group");

    const label = document.createElement("label");
    label.classList.add("custom-label");
    label.setAttribute("data-icon", iconMap[option.id] || "🔹");
    label.innerHTML = `<span>${option.label}</span>`;
    group.appendChild(label);

    const row = document.createElement("div");
    row.classList.add("options-row");

    option.choices.forEach((choice) => {
      const pill = document.createElement("label");
      pill.classList.add("option-pill");

      const input = document.createElement("input");
      input.type = "radio";
      input.name = option.id;
      input.value = choice.value;
      input.checked = choice.default || false;

      const text = document.createElement("span");
      text.classList.add("pill-text");
      text.textContent = choice.label;

      pill.appendChild(input);
      pill.appendChild(text);
      row.appendChild(pill);
    });

    group.appendChild(row);
    container.appendChild(group);
  });
}

function renderToppings(toppings, topToppingId = null) {
  document.getElementById("toppingsSection").style.display = "block";
  const grid = document.getElementById("toppingsGrid");
  grid.innerHTML = "";

  toppings.forEach((topping) => {
    const card = document.createElement("label");
    card.classList.add("topping-card");
    if (topping.id === topToppingId) card.classList.add("topping-top-choice");

    const nameRow = `
      <div style="display:flex;align-items:center;gap:6px">
        <span class="topping-name">${topping.name}</span>
        
      </div>
    `;

    card.innerHTML = `
      <input type="checkbox" value="${topping.id}" />
      <div class="topping-content">
        ${nameRow}
        <span class="topping-price">+${topping.price.toLocaleString("vi-VN")} ₫</span>
      </div>
    `;
    grid.appendChild(card);
  });
}


function renderSuggestCard(suggested, detail) {
  const wrapper = document.querySelector(".suggest_card");

  if (!wrapper || document.getElementById("suggestCard")) return;

  const getLabel = (id, value) => {
    const option = detail.options?.find((o) => o.id === id);

    return (
      option?.choices?.find(
        (c) => String(c.value) === String(value)
      )?.label || value
    );
  };

  const topping = detail.toppings?.find(
    (t) => t.id === suggested.topToppingId
  );

  const chips = [
    suggested.topOptions?.sugar &&
      `🍯 ${getLabel("sugar", suggested.topOptions.sugar)}`,

    suggested.topOptions?.ice &&
      `🧊 ${getLabel("ice", suggested.topOptions.ice)}`,

    topping && `🔥 ${topping.name}`,
  ]
    .filter(Boolean)
    .map((text, i) => `
      <span class="sc-chip ${i === 2 ? "hot" : ""}">
        ${text}
      </span>
    `)
    .join("");

  wrapper.insertAdjacentHTML(
    "beforeend",
    `
      <div id="suggestCard" class="suggest-card">

        <div class="sc-top">
          <div class="sc-title-wrap">
            <span class="sc-icon">✨</span>

            <div>
              <h4 class="sc-title">Gợi ý cho bạn</h4>
              <p class="sc-note">
                Combo khách chọn nhiều nhất
              </p>
            </div>
          </div>

          <button
            type="button"
            class="sc-close"
            onclick="suggestCard.remove()"
          >
            ✕
          </button>
        </div>

        <div class="sc-chips">
          ${chips}
        </div>

        <button
          type="button"
          class="sc-btn"
        >
          Áp dụng ngay
        </button>

      </div>
    `
  );
    document.querySelector(".sc-btn")?.addEventListener("click", applyBestChoice);
}

function applyBestChoice() {
  if (!SuggestedData) return;
  const { topOptions, topToppingId } = SuggestedData;
  

  Object.entries(topOptions || {}).forEach(([name, value]) => {
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) radio.checked = true;
  });

  document.querySelectorAll("#toppingsGrid input[type='checkbox']").forEach((cb) => {
    cb.checked = cb.value === topToppingId;
  });

  const btn = document.querySelector(".sc-btn");
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = "✓ Đã áp dụng!";
    btn.style.background = "#3B6D11";
    setTimeout(() => { btn.textContent = orig; btn.style.background = ""; }, 2000);
  }
}


function renderIngredients(product) {
  if (!product.ingredients?.length) return;
  const grid = document.getElementById("ingredientsGrid");
  grid.innerHTML = "";
  product.ingredients.forEach((ing) => {
    const card = document.createElement("div");
    card.classList.add("ingredient-card");
    if (product.theme?.primary) card.style.borderColor = `${product.theme.primary}20`;
    card.innerHTML = `<div class="ingredient-name">${ing.name}</div><div class="ingredient-detail">${ing.detail}</div>`;
    grid.appendChild(card);
  });
}


function renderFeatures(product) {
  if (!product.features?.length) return;
  const grid = document.getElementById("featuresGrid");
  grid.innerHTML = "";
  product.features.forEach((feat) => {
    const tag = document.createElement("div");
    tag.classList.add("feature-tag");
    if (product.theme?.primary) tag.style.borderColor = `${product.theme.primary}20`;
    const value = document.createElement("div");
    value.classList.add("feature-value");
    value.textContent = feat.value;
    if (product.theme?.primary) value.style.color = product.theme.primary;
    tag.innerHTML = `<div class="feature-title">${feat.title}</div>`;
    tag.appendChild(value);
    grid.appendChild(tag);
  });
}


async function renderReviews(product) {
  try {
    const { fetchReviews } = await import('./services/db-service.js');
    const allReviews = await fetchReviews();
    if (!allReviews) {
      document.getElementById("reviewsSection").style.display = "none";
      return;
    }

    const reviews = allReviews.filter((r) => r.productId == product.id);

    if (!reviews.length) {
      document.getElementById("reviewsSection").style.display = "none";
      return;
    }

    const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
    document.getElementById("ratingAverage").textContent = avg;
    document.getElementById("ratingCount").textContent = `(${reviews.length} đánh giá)`;

    const stars = (n, rating) =>
      Array.from({ length: n }, (_, i) => `<span class="star">${i < rating ? "★" : "☆"}</span>`).join("");

    document.getElementById("ratingSummaryStars").innerHTML = stars(5, Math.round(avg));

    const grid = document.getElementById("reviewsGrid");
    grid.innerHTML = "";
    reviews.slice(0, 4).forEach((r) => {
      const card = document.createElement("div");
      card.classList.add("review-card");
      card.innerHTML = `
        <div class="review-header">
          <div class="review-stars">${stars(5, r.rating)}</div>
          <div class="review-date">${new Date(r.date).toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "numeric" })}</div>
        </div>
        <div class="review-name">${r.reviewer}</div>
        <div class="review-text">${r.text}</div>
        <div class="review-footer"></div>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    console.error("Error loading reviews:", e);
    document.getElementById("reviewsSection").style.display = "none";
  }
}


function getToppingPrice(toppingElement) {
  const priceText = toppingElement.querySelector(".topping-price")?.textContent || "";
  return Number(priceText.replace(/[^0-9]/g, ""));
}

function getSelectedToppings() {
  return Array.from(document.querySelectorAll("#toppingsGrid input[type='checkbox']:checked")).map((cb) => ({
    id: cb.value,
    name: cb.nextElementSibling?.querySelector(".topping-name")?.textContent?.trim() || "Topping",
    price: getToppingPrice(cb.nextElementSibling),
  }));
}

function setupPriceAndQuantity(product) {
  const totalEl = document.getElementById("total-price");
  const qtyInput = document.getElementById("qty");
  const basePrice = product.price;
  const fmt = (p) => p.toLocaleString("vi-VN") + " ₫";

  const updatePrice = () => {
    const extraPrice = getSelectedToppings().reduce((sum, t) => sum + t.price, 0);
    const currentPrice = basePrice + extraPrice;
    totalEl.textContent = fmt(currentPrice * Number(qtyInput.value));
    product.price = currentPrice;
  };

  document.querySelector("#base-price").textContent = fmt(basePrice);
  document.querySelector("#base-price").dataset.price = basePrice;


  document.getElementById("toppingsGrid")?.addEventListener("change", updatePrice);

  document.querySelector(".plus").addEventListener("click", () => {
    qtyInput.value++;
    updatePrice();
  });

  document.querySelector(".minus").addEventListener("click", () => {
    if (qtyInput.value > 1) {
      qtyInput.value--;
      updatePrice();
    }
  });

  document.getElementById("addToCartForm").addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      const btn = document.querySelector(".btn-add-cart");
      const orig = btn.innerHTML;

      btn.innerHTML = "Đã thêm vào giỏ";
      setTimeout(() => (btn.innerHTML = orig), 2000);

      const quantity = Number(qtyInput.value) || 1;
      const options = {};
      document.querySelectorAll(".options-row input[type='radio']:checked").forEach((r) => {
        options[r.name] = r.value;
      });

      const toppings = getSelectedToppings();

      const cartItem = {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        productPrice: basePrice + toppings.reduce((s, t) => s + t.price, 0),
        quantity: quantity,
        options: options,
        toppings: toppings,
        totalPrice: (basePrice + toppings.reduce((s, t) => s + t.price, 0)) * quantity,
        addedAt: new Date().toISOString(),
      };

      if (!Array.isArray(AppStorage.duLieu.gioHang)) {
        AppStorage.duLieu.gioHang = [];
      }
      AppStorage.duLieu.gioHang.push(cartItem);
      AppStorage.luu();

      const cartBadge = document.getElementById("cart-badge");
      if (cartBadge) {
        cartBadge.textContent = AppStorage.duLieu.gioHang.length;
      }
    } catch (err) {
      alert("Lỗi thêm vào giỏ hàng: " + err.message);
      console.error(err);
    }
  });

  updatePrice();
}


function setupLikeButton(product) {
  const btn = document.getElementById("likeBtn");
  if (!btn) return;

  const likedList = AppStorage.duLieu.monThich;
  const isLiked = likedList.some((p) => p.id === product.id);
  const setIcon = (on) => (btn.innerHTML = `<i class="fa-${on ? "solid" : "regular"} fa-heart"></i>`);

  if (isLiked) {
    btn.classList.add("liked");
    setIcon(true);
  }

  btn.addEventListener("click", () => {
    const idx = likedList.findIndex((p) => p.id === product.id);
    if (idx > -1) {
      likedList.splice(idx, 1);
      btn.classList.remove("liked");
      setIcon(false);
    } else {
      likedList.push({ id: product.id, name: product.name, image: product.image });
      btn.classList.add("liked");
      setIcon(true);
    }
    AppStorage.duLieu.monThich = likedList;
    AppStorage.luu();
  });
}