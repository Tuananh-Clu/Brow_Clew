/** Bold Brew — localStorage (user, orders, cart, vip, …) */
var BrewStorage = (function () {
  var KEYS = {
    user: "user",
    orders: "orders",
    vipMember: "vipMember",
    cart: "cart",
    lastOrder: "lastOrder",
    savedRecipes: "savedRecipes",
    likedProducts: "likedProducts",
  };

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function remove(key) {
    localStorage.removeItem(key);
  }

  // —— User ——
  function getUser() {
    return read(KEYS.user, null);
  }

  function setUser(user) {
    if (!user) return remove(KEYS.user);
    write(KEYS.user, user);
  }

  // —— Cart & checkout ——
  function getCart() {
    return read(KEYS.cart, []);
  }

  function setCart(cart) {
    write(KEYS.cart, cart);
  }

  function clearCart() {
    remove(KEYS.cart);
  }

  function getLastOrder() {
    return read(KEYS.lastOrder, null);
  }

  function setLastOrder(order) {
    write(KEYS.lastOrder, order);
  }

  // —— Orders ——
  function getOrders() {
    return read(KEYS.orders, []);
  }

  function addOrder(order) {
    var list = getOrders();
    list.unshift(order);
    write(KEYS.orders, list);
    return order;
  }

  function ordersForCurrentUser() {
    var list = getOrders();
    var user = getUser();
    var email = user && user.email ? user.email.toLowerCase() : "";
    if (!email) return list;
    return list.filter(function (o) {
      return o.customer && o.customer.email && o.customer.email.toLowerCase() === email;
    });
  }

  function sortOrdersNewest(list) {
    return list.slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
  }

  // —— VIP ——
  function getVip() {
    return read(KEYS.vipMember, null);
  }

  function saveVip(vip) {
    write(KEYS.vipMember, vip);
    var user = getUser();
    if (user) {
      user.vipMember = vip;
      setUser(user);
    }
  }

  // —— Stats ——
  function calcPoints(orders) {
    var spent = 0;
    orders.forEach(function (o) {
      if (o.status !== "cancelled") spent += Number(o.total) || 0;
    });
    return Math.floor(spent / 10000);
  }

  function calcTotalCups(orders) {
    var cups = 0;
    orders.forEach(function (o) {
      if (o.status === "cancelled") return;
      (o.items || []).forEach(function (it) {
        cups += Number(it.quantity) || 1;
      });
    });
    return cups;
  }

  function getFavoriteProduct(orders) {
    var counts = {};
    orders.forEach(function (o) {
      if (o.status === "cancelled") return;
      (o.items || []).forEach(function (it) {
        var name = it.productName || "Sản phẩm";
        counts[name] = (counts[name] || 0) + (Number(it.quantity) || 1);
      });
    });
    var best = "—";
    var max = 0;
    for (var name in counts) {
      if (counts[name] > max) {
        max = counts[name];
        best = name;
      }
    }
    return best;
  }

  function getTier(points) {
    if (points >= 200) return { id: "platinum", label: "Platinum", discount: 15 };
    if (points >= 80) return { id: "gold", label: "Gold", discount: 10 };
    if (points >= 30) return { id: "silver", label: "Silver", discount: 5 };
    return { id: "member", label: "Thành viên", discount: 0 };
  }

  function getDashboardStats() {
    var orders = sortOrdersNewest(ordersForCurrentUser());
    var vip = getVip();
    var points = calcPoints(orders);
    if (vip && vip.welcomeBonus) points += vip.welcomeBonus;
    return {
      user: getUser(),
      vip: vip,
      orders: orders,
      points: points,
      tier: getTier(points),
      cups: calcTotalCups(orders),
      favorite: getFavoriteProduct(orders),
      orderCount: orders.length,
    };
  }

  // —— Format & UI helpers ——
  function escapeHtml(text) {
    if (text == null) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatMoney(amount) {
    return Math.round(Number(amount) || 0).toLocaleString("vi-VN") + "đ";
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatTime(iso) {
    return new Date(iso).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusMeta(status) {
    var map = {
      confirmed: { label: "Đã xác nhận", class: "processing" },
      processing: { label: "Đang chuẩn bị", class: "processing" },
      shipping: { label: "Đang giao", class: "processing" },
      completed: { label: "Hoàn thành", class: "completed" },
      cancelled: { label: "Đã hủy", class: "cancelled" },
    };
    return map[status] || { label: status || "Không rõ", class: "processing" };
  }

  function orderItemsSummary(items) {
    if (!items || !items.length) return "—";
    var line = items
      .map(function (it) {
        return (it.productName || "Sản phẩm") + " ×" + (it.quantity || 1);
      })
      .slice(0, 2)
      .join(", ");
    return items.length > 2 ? line + "…" : line;
  }

  function filterOrdersByStatus(orders, filter) {
    if (filter === "all") return orders;
    if (filter === "processing") {
      return orders.filter(function (o) {
        return o.status === "processing" || o.status === "shipping" || o.status === "confirmed";
      });
    }
    return orders.filter(function (o) {
      return o.status === filter;
    });
  }

  function requireLogin(redirectUrl) {
    if (getUser()) return true;
    window.location.href =
      "login.html?next=" + encodeURIComponent(redirectUrl || location.pathname);
    return false;
  }

  return {
    KEYS: KEYS,
    getUser: getUser,
    setUser: setUser,
    getCart: getCart,
    setCart: setCart,
    clearCart: clearCart,
    getLastOrder: getLastOrder,
    setLastOrder: setLastOrder,
    getOrders: getOrders,
    addOrder: addOrder,
    ordersForCurrentUser: ordersForCurrentUser,
    sortOrdersNewest: sortOrdersNewest,
    filterOrdersByStatus: filterOrdersByStatus,
    getVip: getVip,
    saveVip: saveVip,
    getDashboardStats: getDashboardStats,
    getTier: getTier,
    escapeHtml: escapeHtml,
    formatMoney: formatMoney,
    formatDate: formatDate,
    formatTime: formatTime,
    statusMeta: statusMeta,
    orderItemsSummary: orderItemsSummary,
    requireLogin: requireLogin,
  };
})();
