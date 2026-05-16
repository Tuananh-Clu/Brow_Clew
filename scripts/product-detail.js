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
    console.log(error);
  }
});

function renderProduct(product) {

  document.title = product.name + " - Bold Brew";

  document.querySelector(".detail-title").textContent = product.name;
  document.querySelector(".detail-desc").textContent = product.description;
  document.querySelector(".image-wrapper img").src = product.image;
  document.querySelector(".image-wrapper img").alt = product.name;

  if (product.theme && product.theme.primary) {
    document.querySelector(".glow-effect").style.background = product.theme.primary;
  }

  const form = document.getElementById("addToCartForm");
  const totalPrice = document.getElementById("total-price");
  const qtyInput = document.getElementById("qty");

  function formatPrice(price) {
    return price.toLocaleString("vi-VN") + " ₫";
  }

  function updatePrice() {
    const total = product.price * Number(qtyInput.value);
    totalPrice.textContent = formatPrice(total);
  }

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
    const oldText = btn.innerHTML;
    btn.innerHTML = "Đã thêm vào giỏ";
    setTimeout(() => {
      btn.innerHTML = oldText;
    }, 2000);
  });

  updatePrice();
}