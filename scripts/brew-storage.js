var BrewStorage = (function () {
  var MAU_LUU = "boldbrew";
  var ketNoi = null;
  var goi = null;
  var choDoiLuu = false;

  var duLieu = {
    nguoiDung: null,
    gioHang: [],
    donHang: [],
    hoiVien: null,
    donCuoi: null,
    congThuc: [],
    monThich: [],
  };

  function taiTuMay() {
    try {
      var raw = localStorage.getItem(MAU_LUU);

      if (raw) {
        gopDuLieu(JSON.parse(raw));
        return;
      }
    } catch (e) {
      console.log(e);
    }

    if (localStorage.getItem("user")) {
      duLieu.nguoiDung = JSON.parse(localStorage.getItem("user"));
    }

    if (localStorage.getItem("cart")) {
      duLieu.gioHang = JSON.parse(localStorage.getItem("cart"));
    }

    if (localStorage.getItem("orders")) {
      duLieu.donHang = JSON.parse(localStorage.getItem("orders"));
    }

    if (localStorage.getItem("vipMember")) {
      duLieu.hoiVien = JSON.parse(localStorage.getItem("vipMember"));
    }

    if (localStorage.getItem("lastOrder")) {
      duLieu.donCuoi = JSON.parse(localStorage.getItem("lastOrder"));
    }

    if (localStorage.getItem("savedRecipes")) {
      duLieu.congThuc = JSON.parse(localStorage.getItem("savedRecipes"));
    }

    if (localStorage.getItem("likedProducts")) {
      duLieu.monThich = JSON.parse(localStorage.getItem("likedProducts"));
    }

    luu();
  }

  function gopDuLieu(obj) {
    if (!obj) return;

    if (obj.nguoiDung !== undefined) duLieu.nguoiDung = obj.nguoiDung;
    else if (obj.user !== undefined) duLieu.nguoiDung = obj.user;

    if (obj.gioHang !== undefined) duLieu.gioHang = obj.gioHang;
    else if (obj.cart !== undefined) duLieu.gioHang = obj.cart;

    if (obj.donHang !== undefined) duLieu.donHang = obj.donHang;
    else if (obj.orders !== undefined) duLieu.donHang = obj.orders;

    if (obj.hoiVien !== undefined) duLieu.hoiVien = obj.hoiVien;
    else if (obj.vipMember !== undefined) duLieu.hoiVien = obj.vipMember;

    if (obj.donCuoi !== undefined) duLieu.donCuoi = obj.donCuoi;
    else if (obj.lastOrder !== undefined) duLieu.donCuoi = obj.lastOrder;

    if (obj.congThuc !== undefined) duLieu.congThuc = obj.congThuc;
    else if (obj.savedRecipes !== undefined) duLieu.congThuc = obj.savedRecipes;

    if (obj.monThich !== undefined) duLieu.monThich = obj.monThich;
    else if (obj.likedProducts !== undefined) duLieu.monThich = obj.likedProducts;
  }

  function luu() {
    localStorage.setItem(MAU_LUU, JSON.stringify(duLieu));

    var id =
      duLieu.nguoiDung && duLieu.nguoiDung.uid
        ? duLieu.nguoiDung.uid
        : null;

    if (!ketNoi || !goi || !id) {
      choDoiLuu = true;
      return;
    }
    
    choDoiLuu = false;
    goi
      .setDoc(
        goi.doc(ketNoi, "users", id),
        duLieu,
        { merge: true }
      )
      .catch(function (err) {
        console.log("Firestore save error:", err);
      });
  }

  function taiTuMayChu() {
    var id =
      duLieu.nguoiDung && duLieu.nguoiDung.uid
        ? duLieu.nguoiDung.uid
        : null;

    if (!ketNoi || !goi || !id) return;

    goi
      .getDoc(goi.doc(ketNoi, "users", id))
      .then(function (snap) {
        if (!snap.exists()) {
          luu();
          return;
        }

        if (choDoiLuu) {
          luu();
          return;
        }

        gopDuLieu(snap.data());

        localStorage.setItem(
          MAU_LUU,
          JSON.stringify(duLieu)
        );
      })
      .catch(function (err) {
        console.log("Firestore load error:", err);
      });
  }

  function batDauKetNoi() {
    if (!window.FIREBASE_CONFIG) return;

    import(
      "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js"
    ).then(function (ungDung) {
      import(
        "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"
      ).then(function (mayChu) {
        var app =
          ungDung.getApps()[0] ||
          ungDung.initializeApp(window.FIREBASE_CONFIG);

        ketNoi = mayChu.getFirestore(app);
        goi = mayChu;

        taiTuMayChu();
      });
    });
  }

  function donHangCuaToi() {
    var email =
      duLieu.nguoiDung &&
      duLieu.nguoiDung.email
        ? duLieu.nguoiDung.email.toLowerCase()
        : "";

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

    var hoiVien = duLieu.hoiVien;

    var diem = 0;

    don.forEach(function (o) {
      if (o.status !== "cancelled") {
        diem += Number(o.total) || 0;
      }
    });

    diem = Math.floor(diem / 10000);

    if (hoiVien && hoiVien.welcomeBonus) {
      diem += hoiVien.welcomeBonus;
    }

    var ly = 0;
    var demMon = {};

    don.forEach(function (o) {
      if (o.status === "cancelled") return;

      (o.items || []).forEach(function (mon) {
        ly += Number(mon.quantity) || 1;

        var ten = mon.productName || "Sản phẩm";

        demMon[ten] =
          (demMon[ten] || 0) +
          (Number(mon.quantity) || 1);
      });
    });

    var monYeuThich = "—";
    var max = 0;

    for (var ten in demMon) {
      if (demMon[ten] > max) {
        max = demMon[ten];
        monYeuThich = ten;
      }
    }

    var hang = {
      id: "member",
      label: "Thành viên",
      discount: 0,
    };

    if (diem >= 200) {
      hang = {
        id: "platinum",
        label: "Platinum",
        discount: 15,
      };
    } else if (diem >= 80) {
      hang = {
        id: "gold",
        label: "Gold",
        discount: 10,
      };
    } else if (diem >= 30) {
      hang = {
        id: "silver",
        label: "Silver",
        discount: 5,
      };
    }

    return {
      user: duLieu.nguoiDung,
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
    var bang = {
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

    return (
      bang[ma] || {
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
    if (duLieu.nguoiDung) return true;

    window.location.href =
      "login.html?next=" +
      encodeURIComponent(trang || location.pathname);

    return false;
  }

  taiTuMay();
  batDauKetNoi();

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