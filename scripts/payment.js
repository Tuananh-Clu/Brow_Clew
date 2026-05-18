document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("paymentForm");
  loadOrderSummary();

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var fullName = document.getElementById("fullName").value.trim();
    var email = document.getElementById("email").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var address = document.getElementById("address").value.trim();
    var paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    if (!fullName || !email || !phone || !address) {
      alert("Vui lòng điền đủ thông tin bắt buộc");
      return;
    }

    var cart = AppStorage.duLieu.gioHang;
    if (!cart.length) {
      alert("Giỏ hàng của bạn đang trống");
      return;
    }

    var order = {
      id: "BBD-" + Date.now(),
      date: new Date().toISOString(),
      customer: { fullName: fullName, email: email, phone: phone, address: address },
      paymentMethod: paymentMethod,
      items: cart,
      total: orderTotal(),
      status: "confirmed",
    };

    AppStorage.duLieu.donHang.unshift(order);
    AppStorage.duLieu.donCuoi = order;
    AppStorage.duLieu.gioHang = [];
    AppStorage.luu();

    if (typeof CuaHang !== 'undefined') CuaHang.themDon(order);

    if (window.notifyCartUpdate) window.notifyCartUpdate();

    location.href = "hoan-tat.html";
  });
});

function loadOrderSummary() {
  var cart = AppStorage.duLieu.gioHang;
  var list = document.getElementById("orderItemsList");

  if (!cart.length) {
    list.innerHTML = '<p class="summary-empty">Giỏ hàng trống</p>';
    return;
  }

  list.innerHTML = cart
    .map(function (item) {
      var extra = [].concat(
        Object.values(item.options || {}),
        item.toppings || []
      ).filter(Boolean).join(" | ");

      return (
        '<div class="summary-item">' +
        "<div><strong>" + AppStorage.chu(item.productName) + "</strong>" +
        (extra ? '<div class="summary-extra">' + AppStorage.chu(extra) + "</div>" : "") +
        "</div>" +
        '<div class="summary-qty">x' + item.quantity +
        "<div>" + AppStorage.tien(item.productPrice * item.quantity) + "</div></div>" +
        "</div>"
      );
    })
    .join("");

  var subtotal = cartSubtotal();
  var tax = subtotal * 0.08;
  document.getElementById("subtotal").textContent = AppStorage.tien(subtotal);
  document.getElementById("taxAmount").textContent = AppStorage.tien(tax);
  document.getElementById("totalAmount").textContent = AppStorage.tien(subtotal + tax);
}

function cartSubtotal() {
  return AppStorage.duLieu.gioHang.reduce(function (sum, item) {
    return sum + item.productPrice * item.quantity;
  }, 0);
}

function orderTotal() {
  var sub = cartSubtotal();
  return sub + sub * 0.08;
}
