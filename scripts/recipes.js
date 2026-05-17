function loadRecipes() {
  const recipes = BrewStorage.duLieu.congThuc;
  const container = document.getElementById('recipesContainer');
  const emptyState = document.getElementById('emptyState');

  container.innerHTML = '';

  if (recipes.length === 0) {
    emptyState.style.display = 'flex';
    emptyState.style.flexDirection = 'column';
    emptyState.style.alignItems = 'center';
    return;
  }

  emptyState.style.display = 'none';

  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';

    let detailsHtml = '';
    Object.entries(recipe.options).forEach(([key, val]) => {
      detailsHtml += `
        <div class="recipe-detail-item">
          <span>${key}:</span>
          <strong>${val}</strong>
        </div>
      `;
    });

    recipe.toppings.forEach(topping => {
      detailsHtml += `
        <div class="recipe-detail-item">
          <span>+ ${topping}</span>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="recipe-card-header">
        <div class="recipe-card-title">${recipe.name}</div>
        <button class="recipe-card-delete" onclick="deleteRecipe(${recipe.id}); event.stopPropagation();">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
      <div class="recipe-card-body">
        <div class="recipe-product-name">${recipe.productName}</div>
        <div class="recipe-details">
          ${detailsHtml}
        </div>
      </div>
      <div class="recipe-card-footer">
        <button class="recipe-view-btn" onclick="viewRecipeDetail(${recipe.id})">
          <i class="fa-solid fa-eye"></i> Xem Chi Tiết
        </button>
        <button class="recipe-buy-btn" onclick="quickBuyRecipe(${recipe.id})">
          <i class="fa-solid fa-shopping-bag"></i> Mua
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function deleteRecipe(id) {
  if (!confirm('Bạn chắc chắn muốn xóa công thức này?')) return;
  const recipes = BrewStorage.duLieu.congThuc;
  const filtered = recipes.filter(r => r.id !== id);
  BrewStorage.duLieu.congThuc = filtered;
  BrewStorage.luu();
  loadRecipes();
}

function viewRecipeDetail(id) {
  const recipes = BrewStorage.duLieu.congThuc;
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;

  let detailsHtml = `<h2>${recipe.name}</h2>`;
  detailsHtml += `<div class="recipe-detail-product">${recipe.productName}</div>`;
  detailsHtml += '<div class="recipe-detail-items">';

  Object.entries(recipe.options).forEach(([key, val]) => {
    detailsHtml += `
      <div class="recipe-detail-row">
        <span>${key}</span>
        <strong>${val}</strong>
      </div>
    `;
  });

  recipe.toppings.forEach(topping => {
    detailsHtml += `
      <div class="recipe-detail-row">
        <span>+ ${topping}</span>
      </div>
    `;
  });

  detailsHtml += '</div>';

  const modal = document.getElementById('recipeDetailModal');
  document.getElementById('recipeDetailBody').innerHTML = detailsHtml;
  document.getElementById('detailBuyBtn').onclick = () => {
    quickBuyRecipe(id);
  };
  modal.classList.add('active');
}

function quickBuyRecipe(id) {
  const recipes = BrewStorage.duLieu.congThuc;
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;

  const cartItem = {
    id: Date.now(),
    productId: recipe.productId,
    productName: recipe.productName,
    productImage: recipe.productImage,
    productPrice: recipe.price,
    quantity: 1,
    options: recipe.options,
    toppings: recipe.toppings,
    totalPrice: recipe.price,
    addedAt: new Date().toISOString()
  };

  addToCart(cartItem);
  closeRecipeDetail();

  alert('✓ Đã thêm vào giỏ hàng');
}

function addToCart(item) {
  BrewStorage.duLieu.gioHang.push(item);
  BrewStorage.luu();
}

function closeRecipeDetail() {
  document.getElementById('recipeDetailModal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', function () {
  loadRecipes();
  document.querySelector('.recipe-detail-close').addEventListener('click', closeRecipeDetail);
  document.querySelector('.recipe-detail-overlay').addEventListener('click', closeRecipeDetail);
});
