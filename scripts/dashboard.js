document.addEventListener("DOMContentLoaded", function () {
  MemberUI.mountSidebar("dashboard");

  var stats = BrewStorage.getDashboardStats();
  var user = stats.user;
  var vip = stats.vip;

  var greeting = document.getElementById("dashGreeting");
  var sub = document.getElementById("dashSub");
  var tierBadge = document.getElementById("dashTierBadge");
  var vipBanner = document.getElementById("vipBanner");
  var tbody = document.getElementById("ordersTableBody");

  if (greeting) {
    var name = user ? (user.name || user.email || "bạn").split(" ")[0] : "bạn";
    greeting.textContent = user ? "Chào ngày mới, " + name : "Chào bạn đến với Bold Brew";
  }

  if (sub) {
    if (vip && vip.registeredAt) {
      sub.textContent =
        "Hạng " + stats.tier.label + " · " + stats.points.toLocaleString("vi-VN") +
        " điểm · Giảm " + stats.tier.discount + "% mỗi đơn";
    } else if (!user) {
      sub.innerHTML = '<a href="login.html">Đăng nhập</a> để đồng bộ đơn và tích điểm VIP.';
    } else {
      sub.textContent = stats.orderCount + " đơn · " + stats.cups + " ly đã thưởng thức";
    }
  }

  if (tierBadge) {
    tierBadge.hidden = !(vip && vip.registeredAt);
    if (!tierBadge.hidden) tierBadge.textContent = stats.tier.label;
  }

  if (vipBanner) vipBanner.hidden = !!(vip && vip.registeredAt);

  document.getElementById("statPoints").textContent = stats.points.toLocaleString("vi-VN");
  document.getElementById("statCups").textContent = stats.cups.toLocaleString("vi-VN");

  var fav = document.getElementById("statFavorite");
  fav.textContent = stats.favorite;
  fav.style.fontSize = stats.favorite.length > 18 ? "18px" : "24px";

  MemberUI.setAvatar(document.getElementById("dashAvatar"), user);

  if (tbody) tbody.innerHTML = MemberUI.orderTableRows(stats.orders.slice(0, 5));
});
