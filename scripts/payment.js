document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("paymentForm");

  loadOrderSummary();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const paymentMethod = document.querySelector(
      'input[name="paymentMethod"]:checked',
    ).value;

    if (!fullName || !email || !phone || !address) {
      alert("Vui lòng điền đủ thông tin bắt buộc");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống");
      return;
    }

    const order = {
      id: "BBD-" + Date.now(),
      date: new Date().toISOString(),
      customer: {
        fullName,
        email,
        phone,
        address,
      },
      paymentMethod,
      items: cart,
      total: calculateTotal(),
      status: "confirmed",
    };

    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...user,
        orders: [...(user.orders || []), order],
      }),
    );

    localStorage.setItem("lastOrder", JSON.stringify(order));

    localStorage.removeItem("cart");

    if (window.notifyCartUpdate) notifyCartUpdate();

    window.location.href = "hoan-tat.html";
  });
});

function loadOrderSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemsList = document.getElementById("orderItemsList");

  if (cart.length === 0) {
    itemsList.innerHTML =
      '<p style="color: var(--text-gray); padding: 20px;">Giỏ hàng trống</p>';
    return;
  }

  let html = "";
  cart.forEach((item) => {
    const optionsText = Object.values(item.options || {}).join(", ");
    const toppingsText = (item.toppings || []).join(", ");
    const customization = [optionsText, toppingsText]
      .filter(Boolean)
      .join(" | ");

    html += `
      <div class="summary-item">
        <div style="flex: 1;">
          <div style="font-weight: 600; color: var(--brand-black); margin-bottom: 4px;">${item.productName}</div>
          ${customization ? `<div style="font-size: 12px; color: var(--text-gray);">${customization}</div>` : ""}
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 600;">x${item.quantity}</div>
          <div style="font-size: 12px; color: var(--text-gray);">${(item.productPrice * item.quantity).toLocaleString("vi-VN")}đ</div>
        </div>
      </div>
    `;
  });

  itemsList.innerHTML = html;

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  document.getElementById("subtotal").textContent =
    subtotal.toLocaleString("vi-VN") + "đ";
  document.getElementById("taxAmount").textContent =
    Math.round(tax).toLocaleString("vi-VN") + "đ";
  document.getElementById("totalAmount").textContent =
    Math.round(total).toLocaleString("vi-VN") + "đ";
}

function calculateSubtotal() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  return cart.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
}

function calculateTotal() {
  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.08;
  return subtotal + tax;
}
