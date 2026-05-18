document.addEventListener("DOMContentLoaded", function () {
  MemberUI.mountSidebar("history");
  var user = null;
  try {
    const userRaw = localStorage.getItem("user");
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
  }
  var subtitle = document.getElementById("historySubtitle");
  var filter = "all";

  if (user && subtitle) {
    subtitle.textContent =
      "Xin chào " + (user.name || user.email) +
      " — " + AppStorage.donHangCuaToi().length + " đơn hàng";
  }

  MemberUI.setAvatar(document.getElementById("userAvatar"), user);

  function render() {
    var orders = AppStorage.donHangCuaToi().slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
    orders = AppStorage.locDon(orders, filter);
    document.getElementById("ordersList").innerHTML = MemberUI.orderCards(orders);
  }

  document.getElementById("statusFilters").addEventListener("click", function (e) {
    var chip = e.target.closest(".filter-chip");
    if (!chip) return;
    filter = chip.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach(function (btn) {
      btn.classList.toggle("active", btn === chip);
    });
    render();
  });

  render();
});
