
var MemberUI = (function () {
  var NAV = [
    {
      id: "dashboard",
      href: "dashboard.html",
      icon: "fa-house",
      label: "Tổng quan",
    },
    {
      id: "history",
      href: "historyorder.html",
      icon: "fa-clock-rotate-left",
      label: "Lịch sử đơn",
    },
    {
      id: "vip",
      href: "VipMember.html",
      icon: "fa-star",
      label: "Hội viên VIP",
    },
    { id: "shop", href: "product.html", icon: "fa-mug-hot", label: "Đặt món" },
    {
      id: "admin",
      href: "admin.html",
      icon: "fa-gear",
      label: "Quản trị",
    },
  ];

  function mountSidebar(activeId) {
    var el = document.getElementById("dashSidebar");
    if (!el) return;

    var links = NAV.map(function (item) {
      var active = item.id === activeId ? "active" : "";
      var cls = active ? ' class="' + active + '"' : "";
      return (
        '<li><a href="' +
        item.href +
        '"' +
        cls +
        '><i class="fa-solid ' +
        item.icon +
        '"></i> ' +
        item.label +
        "</a></li>"
      );
    }).join("");

    el.innerHTML =
      '<a href="index.html" class="logo dash-logo">Bold Brew<span>.</span></a>' +
      '<ul class="dash-nav">' +
      links +
      "</ul>" +
      '<div class="dash-logout-wrap">' +
      '<a href="#" class="btn btn-outline btn-block dash-logout" id="logoutBtn">' +
      '<i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</a>' +
      "</div>";

    bindLogout();
  }

  function bindLogout() {
    var btn = document.getElementById("logoutBtn");
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      BrewStorage.duLieu.nguoiDung = null;
      BrewStorage.luu();
      location.href = "login.html";
    });
  }

  function avatarUrl(user) {
    if (user && user.photoURL) return user.photoURL;
    var name = (user && (user.name || user.email)) || "BB";
    return (
      "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(name) +
      "&background=e85d04&color=fff"
    );
  }

  function setAvatar(img, user) {
    if (!img) return;
    img.src = avatarUrl(user);
    img.alt = (user && user.name) || "Avatar";
    img.hidden = false;
  }

  function orderTableRows(orders) {
    if (!orders.length) {
      return (
        '<tr><td colspan="5" class="table-empty">' +
        'Chưa có đơn hàng. <a href="product.html">Đặt món ngay</a></td></tr>'
      );
    }
    return orders
      .map(function (order) {
        var st = BrewStorage.trangThai(order.status);
        return (
          "<tr>" +
          "<td><strong>" +
          BrewStorage.chu(order.id) +
          "</strong></td>" +
          "<td>" +
          BrewStorage.ngay(order.date) +
          "</td>" +
          "<td>" +
          BrewStorage.tomTatMon(order.items) +
          "</td>" +
          "<td>" +
          BrewStorage.tien(order.total) +
          "</td>" +
          '<td><span class="status ' +
          st.class +
          '">' +
          st.label +
          "</span></td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function orderCards(orders) {
    if (!orders.length) {
      return (
        '<div class="empty-state">' +
        '<i class="fa-solid fa-mug-saucer"></i>' +
        "<h3>Chưa có đơn hàng</h3>" +
        "<p>Đặt món đầu tiên để tích điểm VIP.</p>" +
        '<a href="product.html" class="btn btn-black">Khám phá thực đơn</a>' +
        "</div>"
      );
    }

    return orders
      .map(function (order) {
        var st = BrewStorage.trangThai(order.status);
        var items = (order.items || [])
          .map(function (it) {
            return (
              "<div>" +
              BrewStorage.chu(it.productName || "Sản phẩm") +
              " ×" +
              (it.quantity || 1) +
              "</div>"
            );
          })
          .join("");

        return (
          '<article class="order-card">' +
          '<div class="order-card-head">' +
          "<div>" +
          '<div class="order-card-id">' +
          BrewStorage.chu(order.id) +
          "</div>" +
          '<div class="order-card-meta">' +
          BrewStorage.ngay(order.date) +
          " · " +
          BrewStorage.gio(order.date) +
          " · " +
          BrewStorage.chu(
            (order.customer && order.customer.fullName) || "",
          ) +
          "</div>" +
          "</div>" +
          '<span class="status ' +
          st.class +
          '">' +
          st.label +
          "</span>" +
          "</div>" +
          '<div class="order-card-body">' +
          '<div class="order-items-list">' +
          items +
          "</div>" +
          '<div class="order-total">' +
          BrewStorage.tien(order.total) +
          "</div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  return {
    mountSidebar: mountSidebar,
    bindLogout: bindLogout,
    setAvatar: setAvatar,
    orderTableRows: orderTableRows,
    orderCards: orderCards,
  };
})();
