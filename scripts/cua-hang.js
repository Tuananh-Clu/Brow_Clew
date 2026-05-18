import { fetchHeroProducts } from "./db-service";

var CuaHang = (function () {
  var MAU = "boldbrew_cuaHang";
  var ketNoi = null;
  var goi = null;

  var duLieu = {
    danhSachMon: [],
    danhSachThucUong: [],
    donHang: [],
  };

  function taiTuMay() {
    try {
      var raw = localStorage.getItem(MAU);
      if (raw) Object.assign(duLieu, JSON.parse(raw));
    } catch (e) {}
  }

  function luu() {
    localStorage.setItem(MAU, JSON.stringify(duLieu));
    if (!ketNoi || !goi) return;
    goi.setDoc(goi.doc(ketNoi, "shop", "cuaHang"), duLieu, { merge: true });
  }

  function taiTuMayChu() {
    if (!ketNoi || !goi) return;
    goi.getDoc(goi.doc(ketNoi, "shop", "cuaHang")).then(function (snap) {
      if (!snap.exists()) return;
      var cloud = snap.data();
      if (cloud.danhSachMon && cloud.danhSachMon.length) duLieu.danhSachMon = cloud.danhSachMon;
      if (cloud.donHang && cloud.donHang.length) duLieu.donHang = cloud.donHang;
      localStorage.setItem(MAU, JSON.stringify(duLieu));
    });
  }

  function batDauKetNoi() {
    if (!window.FIREBASE_CONFIG) return;
    import("https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js").then(function (ungDung) {
      import("https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js").then(function (mayChu) {
        var app = ungDung.getApps()[0] || ungDung.initializeApp(window.FIREBASE_CONFIG);
        ketNoi = mayChu.getFirestore(app);
        goi = mayChu;
        taiTuMayChu();
      });
    });
  }

  function themMon(mon) {
    var id = 1;
    duLieu.danhSachMon.forEach(function (m) {
      if (m.id >= id) id = m.id + 1;
    });
    mon.id = id;
    mon.isNew = !!mon.isNew;
    duLieu.danhSachMon.push(mon);
    luu();
    return mon;
  }

  function suaMon(id, monMoi) {
    var i = duLieu.danhSachMon.findIndex(function (m) {
      return m.id === id;
    });
    if (i < 0) return false;
    monMoi.id = id;
    duLieu.danhSachMon[i] = Object.assign({}, duLieu.danhSachMon[i], monMoi);
    luu();
    return true;
  }

  function xoaMon(id) {
    duLieu.danhSachMon = duLieu.danhSachMon.filter(function (m) {
      return m.id !== id;
    });
    luu();
  }

  function layThucUong() {
    return fetchHeroProducts();
  }

  function themThucUong(thucUong) {
    var id = 1;
    duLieu.danhSachThucUong.forEach(function (t) {
      if (t.id >= id) id = t.id + 1;
    });
    thucUong.id = id;
    thucUong.isNew = !!thucUong.isNew;
    duLieu.danhSachThucUong.push(thucUong);
    duyaThucUongLeníFirestore();
    return thucUong;
  }

  function suaThucUong(id, thucUongMoi) {
    var i = duLieu.danhSachThucUong.findIndex(function (t) {
      return t.id === id;
    });
    if (i < 0) return false;
    thucUongMoi.id = id;
    duLieu.danhSachThucUong[i] = Object.assign({}, duLieu.danhSachThucUong[i], thucUongMoi);
    duyaThucUongLeníFirestore();
    return true;
  }

  function xoaThucUong(id) {
    duLieu.danhSachThucUong = duLieu.danhSachThucUong.filter(function (t) {
      return t.id !== id;
    });
    duyaThucUongLeníFirestore();
  }

  function duyaThucUongLeníFirestore() {
    localStorage.setItem(MAU, JSON.stringify(duLieu));
    if (!ketNoi || !goi) return Promise.resolve();
    return goi.setDoc(goi.doc(ketNoi, "shop", "cuaHang"), { danhSachThucUong: duLieu.danhSachThucUong }, { merge: true }).catch(function (err) {
      console.error("Lỗi đẩy thức uống lên Firestore:", err);
    });
  }

  function taiThucUongTuFirestore() {
    if (!ketNoi || !goi) return Promise.resolve(duLieu.danhSachThucUong);
    return goi.getDoc(goi.doc(ketNoi, "shop", "cuaHang")).then(function (snap) {
      if (!snap.exists()) return duLieu.danhSachThucUong;
      var cloud = snap.data();
      if (cloud.danhSachThucUong && cloud.danhSachThucUong.length) {
        duLieu.danhSachThucUong = cloud.danhSachThucUong;
        localStorage.setItem(MAU, JSON.stringify(duLieu));
      }
      return duLieu.danhSachThucUong;
    }).catch(function (err) {
      console.error("Lỗi tải thức uống từ Firestore:", err);
      return duLieu.danhSachThucUong;
    });
  }

  function themDon(don) {
    duLieu.donHang.unshift(don);
    luu();
  }

  function gopDonTuKhach() {
    if (typeof BrewStorage === "undefined") return;
    var donKhach = BrewStorage.duLieu.donHang || [];
    donKhach.forEach(function (don) {
      var daCo = duLieu.donHang.some(function (d) {
        return d.id === don.id;
      });
      if (!daCo) duLieu.donHang.unshift(don);
    });
    luu();
  }

  function tinhDoanhThu() {
    var tong = 0;
    var soDon = 0;
    var soDonHuy = 0;
    var demMon = {};

    duLieu.donHang.forEach(function (don) {
      if (don.status === "cancelled") {
        soDonHuy++;
        return;
      }
      soDon++;
      tong += Number(don.total) || 0;
      (don.items || []).forEach(function (mon) {
        var ten = mon.productName || "Không rõ";
        demMon[ten] = (demMon[ten] || 0) + (Number(mon.quantity) || 1);
      });
    });

    var monBanChay = "—";
    var max = 0;
    for (var ten in demMon) {
      if (demMon[ten] > max) {
        max = demMon[ten];
        monBanChay = ten;
      }
    }

    return {
      tong: tong,
      soDon: soDon,
      soDonHuy: soDonHuy,
      monBanChay: monBanChay,
      donHang: duLieu.donHang.slice().sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      }),
    };
  }

  taiTuMay();
  batDauKetNoi();

  return {
    duLieu: duLieu,
    luu: luu,
    layMon: layMon,
    themMon: themMon,
    suaMon: suaMon,
    xoaMon: xoaMon,
    layThucUong: layThucUong,
    themThucUong: themThucUong,
    suaThucUong: suaThucUong,
    xoaThucUong: xoaThucUong,
    duyaThucUongLeníFirestore: duyaThucUongLeníFirestore,
    taiThucUongTuFirestore: taiThucUongTuFirestore,
    themDon: themDon,
    gopDonTuKhach: gopDonTuKhach,
    tinhDoanhThu: tinhDoanhThu,
  };
})();
