var BrewStorage = (function () {
  var KEY = "boldbrew";

  var data = {
    user: null,
    cart: [],
    orders: [],
    vip: null,
    lastOrder: null,
    recipes: [],
    favorites: [],
  };

  var db = null;
  var firestore = null;


  function load() {
    var saved = localStorage.getItem(KEY);

    if (saved) {
      data = JSON.parse(saved);
      return;
    }

    data.user = JSON.parse(localStorage.getItem("user")) || null;
    data.cart = JSON.parse(localStorage.getItem("cart")) || [];
    data.orders = JSON.parse(localStorage.getItem("orders")) || [];
    data.vip = JSON.parse(localStorage.getItem("vipMember")) || null;
    data.lastOrder = JSON.parse(localStorage.getItem("lastOrder")) || null;
    data.recipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
    data.favorites = JSON.parse(localStorage.getItem("likedProducts")) || [];

    save();
  }


  function save() {
    localStorage.setItem(KEY, JSON.stringify(data));

    var uid = data.user?.uid;

    if (!db || !firestore || !uid) return;

    firestore.setDoc(
      firestore.doc(db, "users", uid, "storage", "data"),
      data,
      { merge: true }
    );
  }


  async function connectFirebase() {
    if (!window.FIREBASE_CONFIG) return;

    var firebaseApp = await import(
      "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js"
    );

    var firebaseStore = await import(
      "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"
    );

    var app =
      firebaseApp.getApps()[0] ||
      firebaseApp.initializeApp(window.FIREBASE_CONFIG);

    db = firebaseStore.getFirestore(app);
    firestore = firebaseStore;

    loadFromServer();
  }


  async function loadFromServer() {
    var uid = data.user?.uid;

    if (!db || !firestore || !uid) return;

    var ref = firestore.doc(db, "users", uid, "storage", "data");

    var snap = await firestore.getDoc(ref);

    if (!snap.exists()) return;

    data = {
      ...data,
      ...snap.data(),
    };

    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function myOrders() {
    var email = data.user?.email?.toLowerCase();

    if (!email) return data.orders;

    return data.orders.filter(function (order) {
      return order.customer?.email?.toLowerCase() === email;
    });
  }


  function stats() {
    var orders = myOrders();

    var points = 0;
    var cups = 0;
    var products = {};

    orders.forEach(function (order) {
      if (order.status === "cancelled") return;

      points += Number(order.total) || 0;

      order.items?.forEach(function (item) {
        var qty = Number(item.quantity) || 1;

        cups += qty;

        var name = item.productName || "Sản phẩm";

        products[name] = (products[name] || 0) + qty;
      });
    });

    points = Math.floor(points / 10000);

    var favorite = "—";
    var max = 0;

    for (var name in products) {
      if (products[name] > max) {
        max = products[name];
        favorite = name;
      }
    }

    var tier = {
      id: "member",
      label: "Thành viên",
      discount: 0,
    };

    if (points >= 200) {
      tier = {
        id: "platinum",
        label: "Platinum",
        discount: 15,
      };
    } else if (points >= 80) {
      tier = {
        id: "gold",
        label: "Gold",
        discount: 10,
      };
    } else if (points >= 30) {
      tier = {
        id: "silver",
        label: "Silver",
        discount: 5,
      };
    }

    return {
      user: data.user,
      orders: orders,
      points: points,
      cups: cups,
      favorite: favorite,
      tier: tier,
    };
  }


  function money(value) {
    return (
      Math.round(Number(value) || 0).toLocaleString("vi-VN") + "đ"
    );
  }

  function date(value) {
    return new Date(value).toLocaleDateString("vi-VN");
  }

  function time(value) {
    return new Date(value).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }


  function getStatus(status) {
    var list = {
      confirmed: {
        label: "Đã xác nhận",
        class: "processing",
      },

      processing: {
        label: "Đang chuẩn bị",
        class: "processing",
      },

      shipping: {
        label: "Đang giao",
        class: "processing",
      },

      completed: {
        label: "Hoàn thành",
        class: "completed",
      },

      cancelled: {
        label: "Đã hủy",
        class: "cancelled",
      },
    };

    return list[status] || {
      label: "Không rõ",
      class: "processing",
    };
  }


  function requireLogin(page) {
    if (data.user) return true;

    window.location.href =
      "login.html?next=" +
      encodeURIComponent(page || location.pathname);

    return false;
  }

  load();
  connectFirebase();

  return {
    data: data,
    save: save,

    myOrders: myOrders,

    stats: stats,

    money: money,
    date: date,
    time: time,

    getStatus: getStatus,

    requireLogin: requireLogin,
  };
})();