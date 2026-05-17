document.addEventListener("DOMContentLoaded", function () {
  MemberUI.mountSidebar("history");

  var user = BrewStorage.getUser();
  var subtitle = document.getElementById("historySubtitle");
  var filter = "all";

  if (user && subtitle) {
    subtitle.textContent =
      "Xin chào " + (user.name || user.email) +
      " — " + BrewStorage.ordersForCurrentUser().length + " đơn hàng";
  }

  MemberUI.setAvatar(document.getElementById("userAvatar"), user);

  function render() {
    var orders = BrewStorage.sortOrdersNewest(BrewStorage.ordersForCurrentUser());
    orders = BrewStorage.filterOrdersByStatus(orders, filter);
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
