document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);

  const productId = urlParams.get("id") || "macchiato";

  try {
    const response = await fetch("../data/ProductsDetail.json");

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

  document.querySelector(".detail-title").textContent =
    product.name;

  document.querySelector(".detail-desc").textContent =
    product.description;

  document.querySelector(".image-wrapper img").src =
    product.image;

  document.querySelector(".image-wrapper img").alt =
    product.name;

  if (product.theme && product.theme.primary) {
    document.querySelector(".glow-effect").style.background =
      product.theme.primary;
  }

  const form = document.getElementById("addToCartForm");

  const actionRow = document.querySelector(".action-row");

  function formatPrice(price) {
    return price.toLocaleString("vi-VN") + " ₫";
  }



  if (product.options) {

    product.options.forEach((option) => {

      const group = document.createElement("div");

      group.className = "custom-group";

      let html = `
        <label class="custom-label">
          ${option.label}
        </label>

        <div class="options-row">
      `;

      option.choices.forEach((choice) => {

        html += `
          <label class="option-pill">

            <input
              type="radio"
              name="${option.id}"
              value="${choice.value}"
              ${choice.default ? "checked" : ""}
            >

            <span class="pill-text">
              ${choice.label}
            </span>

          </label>
        `;
      });

      html += `</div>`;

      group.innerHTML = html;

      form.insertBefore(group, actionRow);
    });
  }



  if (product.toppings) {

    const group = document.createElement("div");

    group.className = "custom-group";

    let html = `
      <label class="custom-label">
        Toppings
      </label>

      <div class="toppings-grid">
    `;

    product.toppings.forEach((topping) => {

      html += `
        <label class="topping-card">

          <input
            type="checkbox"
            name="topping"
            data-price="${topping.price}"
          >

          <div class="topping-content">

            <span>
              ${topping.name}
            </span>

            <span>
              +${formatPrice(topping.price)}
            </span>

          </div>

        </label>
      `;
    });

    html += `</div>`;

    group.innerHTML = html;

    form.insertBefore(group, actionRow);
  }

  

  const totalPrice = document.getElementById("total-price");

  const qtyInput = document.getElementById("qty");

  function updatePrice() {

    let total = product.price;

    const toppings = document.querySelectorAll(
      'input[name="topping"]:checked'
    );

    toppings.forEach((item) => {
      total += Number(item.dataset.price);
    });

    total *= Number(qtyInput.value);

    totalPrice.textContent = formatPrice(total);
  }



  const toppingInputs = document.querySelectorAll(
    'input[name="topping"]'
  );

  toppingInputs.forEach((input) => {

    input.addEventListener("change", () => {
      updatePrice();
    });

  });

 

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