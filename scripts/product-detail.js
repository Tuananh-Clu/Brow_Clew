document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id") || 1;

  try {
    const response = await fetch("data/ProductForHeroSection.json");
    const products = await response.json();
    const product = products.find((p) => p.id == productId);

    if (!product) {
      console.log("Không tìm thấy sản phẩm");
      return;
    }

    renderProduct(product);
  } catch (error) {
    console.log("Error loading product:", error);
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
    const response = await fetch("data/ProductsDetail.json");
    const allProducts = await response.json();
    const productDetail = allProducts.find((p) => p.id == product.id);

    if (productDetail) {
      if (productDetail.options?.length > 0) renderOptions(productDetail.options);
      if (productDetail.toppings?.length > 0) renderToppings(productDetail.toppings);
    }
  } catch (error) {
    console.log("Error loading customization options:", error);
  }
}

function renderOptions(options) {
  const customizationDiv = document.getElementById("customizationOptions");

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

  options.forEach((option) => {
    const group = document.createElement("div");
    group.classList.add("custom-group");

    const label = document.createElement("label");
    label.classList.add("custom-label");
    label.innerHTML = `<span>${option.label}</span>`;

    const icon = iconMap[option.id.toLowerCase()] || "🔹";
    label.style.setProperty("--icon", `"${icon}"`);
    label.setAttribute("data-icon", icon);

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

      const pillText = document.createElement("span");
      pillText.classList.add("pill-text");
      pillText.textContent = choice.label;

      pill.appendChild(input);
      pill.appendChild(pillText);
      row.appendChild(pill);
    });

    group.appendChild(row);
    customizationDiv.appendChild(group);
  });
}

function renderToppings(toppings) {
  document.getElementById("toppingsSection").style.display = "block";
  const toppingsGrid = document.getElementById("toppingsGrid");

  toppings.forEach((topping) => {
    const card = document.createElement("label");
    card.classList.add("topping-card");

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = topping.id;

    const content = document.createElement("div");
    content.classList.add("topping-content");

    const name = document.createElement("span");
    name.classList.add("topping-name");
    name.textContent = topping.name;

    const price = document.createElement("span");
    price.classList.add("topping-price");
    price.textContent = `+${topping.price.toLocaleString("vi-VN")} ₫`;

    content.appendChild(name);
    content.appendChild(price);
    card.appendChild(input);
    card.appendChild(content);
    toppingsGrid.appendChild(card);
  });
}

function renderIngredients(product) {
  if (!product.ingredients?.length) return;

  const ingredientsGrid = document.getElementById("ingredientsGrid");
  ingredientsGrid.innerHTML = "";

  product.ingredients.forEach((ingredient) => {
    const card = document.createElement("div");
    card.classList.add("ingredient-card");

    const name = document.createElement("div");
    name.classList.add("ingredient-name");
    name.textContent = ingredient.name;

    const detail = document.createElement("div");
    detail.classList.add("ingredient-detail");
    detail.textContent = ingredient.detail;

    if (product.theme?.primary) {
      card.style.borderColor = `${product.theme.primary}20`;
    }

    card.appendChild(name);
    card.appendChild(detail);
    ingredientsGrid.appendChild(card);
  });
}

function renderFeatures(product) {
  if (!product.features?.length) return;

  const featuresGrid = document.getElementById("featuresGrid");
  featuresGrid.innerHTML = "";

  product.features.forEach((feature) => {
    const tag = document.createElement("div");
    tag.classList.add("feature-tag");

    const title = document.createElement("div");
    title.classList.add("feature-title");
    title.textContent = feature.title;

    const value = document.createElement("div");
    value.classList.add("feature-value");
    value.textContent = feature.value;

    if (product.theme?.primary) {
      value.style.color = product.theme.primary;
      tag.style.borderColor = `${product.theme.primary}20`;
    }

    tag.appendChild(title);
    tag.appendChild(value);
    featuresGrid.appendChild(tag);
  });
}

async function renderReviews(product) {
  try {
    const response = await fetch("data/reviews.json");
    const allReviews = await response.json();
    const productReviews = allReviews.filter((r) => r.productId == product.id);

    if (productReviews.length === 0) {
      document.getElementById("reviewsSection").style.display = "none";
      return;
    }

    const avgRating =
      (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1);

  
    document.getElementById("ratingAverage").textContent = avgRating;
    document.getElementById("ratingCount").textContent = `(${productReviews.length} đánh giá)`;
    const ratingSummaryStars = document.getElementById("ratingSummaryStars");
    ratingSummaryStars.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const star = document.createElement("span");
      star.classList.add("star");
      star.textContent = i < Math.round(avgRating) ? "★" : "☆";
      ratingSummaryStars.appendChild(star);
    }

    const reviewsGrid = document.getElementById("reviewsGrid");
    reviewsGrid.innerHTML = "";
    productReviews.slice(0, 4).forEach((review) => {
      const card = document.createElement("div");
      card.classList.add("review-card");

      const header = document.createElement("div");
      header.classList.add("review-header");

      const stars = document.createElement("div");
      stars.classList.add("review-stars");
      for (let i = 0; i < 5; i++) {
        const star = document.createElement("span");
        star.classList.add("star");
        star.textContent = i < review.rating ? "★" : "☆";
        stars.appendChild(star);
      }

      const date = document.createElement("div");
      date.classList.add("review-date");
      date.textContent = formatDate(review.date);

      header.appendChild(stars);
      header.appendChild(date);

      const name = document.createElement("div");
      name.classList.add("review-name");
      name.textContent = review.reviewer;

      const text = document.createElement("div");
      text.classList.add("review-text");
      text.textContent = review.text;

      const footer = document.createElement("div");
      footer.classList.add("review-footer");

      card.appendChild(header);
      card.appendChild(name);
      card.appendChild(text);
      card.appendChild(footer);
      reviewsGrid.appendChild(card);
    });
  } catch (error) {
    console.log("Error loading reviews:", error);
    document.getElementById("reviewsSection").style.display = "none";
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function setupPriceAndQuantity(product) {
  const form = document.getElementById("addToCartForm");
  const totalPrice = document.getElementById("total-price");
  const qtyInput = document.getElementById("qty");
  const toppingCheckboxes = document.querySelectorAll("#toppingsGrid input[type='checkbox']");

  toppingCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const toppingPrice = parseInt(checkbox.nextSibling.querySelector(".topping-price").textContent.replace(/[^0-9]/g, ""));
      if (checkbox.checked) {
        product.price += toppingPrice;
      } else {
        product.price -= toppingPrice;
      }
      updatePrice();
    });
  });

  const formatPrice = (price) => price.toLocaleString("vi-VN") + " ₫";

  const updatePrice = () => {
    const total = product.price * Number(qtyInput.value);
    totalPrice.textContent = formatPrice(total);
  };

  document.querySelector("#base-price").textContent = formatPrice(product.price);
  document.querySelector("#base-price").dataset.price = product.price;

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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = document.querySelector(".btn-add-cart");
    const originalText = btn.innerHTML;
    btn.innerHTML = "Đã thêm vào giỏ";
    setTimeout(() => {
      btn.innerHTML = originalText;
    }, 2000);
  });

  updatePrice();
}

function setupLikeButton(product) {
  const likeBtn = document.getElementById('likeBtn');
  if (!likeBtn) return;

  const likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
  const isLiked = likedProducts.some(p => p.id === product.id);

  if (isLiked) {
    likeBtn.classList.add('liked');
    likeBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
  }

  likeBtn.addEventListener('click', () => {
    const likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
    const index = likedProducts.findIndex(p => p.id === product.id);

    if (index > -1) {
      likedProducts.splice(index, 1);
      likeBtn.classList.remove('liked');
      likeBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    } else {
      likedProducts.push({ id: product.id, name: product.name, image: product.image });
      likeBtn.classList.add('liked');
      likeBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
    }

    localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
  });
}
