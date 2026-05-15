async function initProducts() {
  try {
    const response = await fetch('../data/ProductsDetail.json');
    const products = await response.json();
    renderProductGrid(products);
    setupFilters(products);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function renderProductGrid(products) {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('article');
    card.className = 'artistic-product-card';
    card.setAttribute('data-category', product.category);

    card.innerHTML = `
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
}

function setupFilters(products) {
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.textContent;
      if (filterValue === 'Tất cả') {
        renderProductGrid(products);
      } else {
        const filtered = products.filter(p => {
          // Simple category matching
          if (filterValue === 'Cold Brew') return p.category === 'Coffee' || p.category === 'Cold Brew';
          if (filterValue === 'Espresso Cao Cấp') return p.category === 'Coffee';
          if (filterValue === 'Đặc Sản Của Quán') return p.category === 'Specialty' || p.category === 'Signature';
          return p.category === filterValue;
        });
        renderProductGrid(filtered);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initProducts);
