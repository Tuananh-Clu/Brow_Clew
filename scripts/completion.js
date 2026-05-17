document.addEventListener("DOMContentLoaded", function () {
  var order = BrewStorage.duLieu.donCuoi;
  if (!order) {
    location.href = "product.html";
    return;
  }

  var date = new Date(order.date);
  var eta = new Date(date.getTime() + 30 * 60000);
  var mins = Math.max(0, Math.round((eta - new Date()) / 60000));

  document.getElementById("orderNumber").textContent = order.id;
  document.getElementById("orderDate").textContent = BrewStorage.ngay(order.date);
  document.getElementById("orderTime").textContent = BrewStorage.gio(order.date);
  document.getElementById("totalPrice").textContent = BrewStorage.tien(order.total);
  document.getElementById("estimatedTime").textContent = mins > 0 ? mins + " phút" : "Đang giao";
});
