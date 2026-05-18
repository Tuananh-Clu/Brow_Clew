var BrewStorage = (function () {
  var MAU_LUU = "boldbrew";

  var POINTS_PER_UNIT_CURRENCY = 10000;

  var TIER_CONFIG = [
    { minPoints: 200, id: "platinum", label: "Platinum", discount: 15 },
    { minPoints: 80, id: "gold", label: "Gold", discount: 10 },
    { minPoints: 30, id: "silver", label: "Silver", discount: 5 },
    { minPoints: 0, id: "member", label: "Thành viên", discount: 0 },
  ];

  var TRANG_THAI_MAP = {
    confirmed: { label: "Đã xác nhận", class: "processing" },
    processing: { label: "Đang chuẩn bị", class: "processing" },
    shipping: { label: "Đang giao", class: "processing" },
    completed: { label: "Hoàn thành", class: "completed" },
    cancelled: { label: "Đã hủy", class: "cancelled" },
  };

  var duLieu = {
    gioHang: [],
    donHang: [],
    hoiVien: null,
  };

  function taiTuMay() {
    try {
      var raw = localStorage.getItem(MAU_LUU);
      if (raw) {
        duLieu = Object.assign({}, duLieu, JSON.parse(raw));
        return;
      }
    } catch (e) {
    }

    var cart = localStorage.getItem(STORAGE_KEYS.cart);
    if (cart) duLieu.gioHang = JSON.parse(cart);

    var orders = localStorage.getItem(STORAGE_KEYS.orders);
    if (orders) duLieu.donHang = JSON.parse(orders);
  }

  function luu() {
    localStorage.setItem(MAU_LUU, JSON.stringify(duLieu));
  }

  function donHangCuaToi() {
    var user = null;
    try {
      var userRaw = localStorage.getItem("user");
      if (userRaw) user = JSON.parse(userRaw);
    } catch (e) {
    }

    var email = user && user.email ? user.email.toLowerCase() : "";

    if (!email) return duLieu.donHang;

    return duLieu.donHang.filter(function (don) {
      return (
        don.customer &&
        don.customer.email &&
        don.customer.email.toLowerCase() === email
      );
    });
  }

  function thongKe() {
    var don = donHangCuaToi()
      .slice()
      .sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });

    var user = null;
    try {
      var userRaw = localStorage.getItem("user");
      if (userRaw) user = JSON.parse(userRaw);
    } catch (e) {
    }

    var hoiVien = duLieu.hoiVien;
    var diem = 0;
    var ly = 0;
    var demMon = {};

    don.forEach(function (o) {
      if (o.status !== "cancelled") {
        diem += Number(o.total) || 0;
        ly += (o.items || []).reduce(function (sum, mon) {
          var quantity = Number(mon.quantity) || 1;
          var ten = mon.productName || "Sản phẩm";
          demMon[ten] = (demMon[ten] || 0) + quantity;
          return sum + quantity;
        }, 0);
      }
    });

    diem = Math.floor(diem / POINTS_PER_UNIT_CURRENCY);

    if (hoiVien && hoiVien.welcomeBonus) {
      diem += hoiVien.welcomeBonus;
    }

    var monYeuThich = "—";
    var max = 0;

    for (var ten in demMon) {
      if (demMon[ten] > max) {
        max = demMon[ten];
        monYeuThich = ten;
      }
    }

    var hang = TIER_CONFIG[TIER_CONFIG.length - 1];
    for (var i = 0; i < TIER_CONFIG.length; i++) {
      if (diem >= TIER_CONFIG[i].minPoints) {
        hang = TIER_CONFIG[i];
        break;
      }
    }

    return {
      user: user,
      vip: hoiVien,
      orders: don,
      points: diem,
      tier: hang,
      cups: ly,
      favorite: monYeuThich,
      orderCount: don.length,
    };
  }

  function chu(text) {
    if (text == null) return "";

    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function tien(so) {
    return (
      Math.round(Number(so) || 0).toLocaleString("vi-VN") +
      "đ"
    );
  }

  function ngay(iso) {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function gio(iso) {
    return new Date(iso).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function trangThai(ma) {
    return (
      TRANG_THAI_MAP[ma] || {
        label: ma || "Không rõ",
        class: "processing",
      }
    );
  }

  function tomTatMon(danhSach) {
    if (!danhSach || !danhSach.length) return "—";

    var dong = danhSach
      .map(function (mon) {
        return (
          (mon.productName || "Sản phẩm") +
          " ×" +
          (mon.quantity || 1)
        );
      })
      .slice(0, 2)
      .join(", ");

    return danhSach.length > 2
      ? dong + "…"
      : dong;
  }

  function locDon(danhSach, boLoc) {
    if (boLoc === "all") return danhSach;

    if (boLoc === "processing") {
      return danhSach.filter(function (don) {
        return (
          don.status === "processing" ||
          don.status === "shipping" ||
          don.status === "confirmed"
        );
      });
    }

    return danhSach.filter(function (don) {
      return don.status === boLoc;
    });
  }

  function canDangNhap(trang) {
    try {
      var userRaw = localStorage.getItem("user");
      if (userRaw) return true;
    } catch (e) {
    }

    window.location.href =
      "login.html?next=" +
      encodeURIComponent(trang || location.pathname);

    return false;
  }

  taiTuMay();

  return {
    duLieu: duLieu,
    luu: luu,
    donHangCuaToi: donHangCuaToi,
    thongKe: thongKe,
    chu: chu,
    tien: tien,
    ngay: ngay,
    gio: gio,
    trangThai: trangThai,
    tomTatMon: tomTatMon,
    locDon: locDon,
    canDangNhap: canDangNhap,
  };
})();