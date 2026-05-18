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
    import('./db-service.js').then(({ updateProductsDetail, updateHeroProducts, updateOrders }) => {
      updateProductsDetail(duLieu.danhSachMon);
      updateHeroProducts(duLieu.danhSachThucUong);
      updateOrders(duLieu.donHang);
    }).catch(err => console.error('Error syncing to db:', err));
  }

  async function taiTuMayChu() {
    try {
      const { fetchProductsDetail, fetchOrders, fetchHeroProducts } = await import('./db-service.js');
      const [mon, don, thucUong] = await Promise.all([
        fetchProductsDetail(),
        fetchOrders(),
        fetchHeroProducts()
      ]);
      if (mon && mon.length) duLieu.danhSachMon = mon;
      if (don && don.length) duLieu.donHang = don;
      if (thucUong && thucUong.length) duLieu.danhSachThucUong = thucUong;
      
      luu();
      
      // Dispatch an event so admin.js knows data is ready
      window.dispatchEvent(new Event('cuaHangLoaded'));
    } catch (e) {
      console.error("Error loading from db-service:", e);
    }
  }

  function batDauKetNoi() {
    taiTuMayChu();
  }

  function layMon() {
    return duLieu.danhSachMon;
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
    return duLieu.danhSachThucUong;
  }

  function themThucUong(thucUong) {
    var id = 1;
    duLieu.danhSachThucUong.forEach(function (t) {
      if (t.id >= id) id = t.id + 1;
    });
    thucUong.id = id;
    thucUong.isNew = !!thucUong.isNew;
    duLieu.danhSachThucUong.push(thucUong);
    luu();
    return thucUong;
  }

  function suaThucUong(id, thucUongMoi) {
    var i = duLieu.danhSachThucUong.findIndex(function (t) {
      return t.id === id;
    });
    if (i < 0) return false;
    thucUongMoi.id = id;
    duLieu.danhSachThucUong[i] = Object.assign({}, duLieu.danhSachThucUong[i], thucUongMoi);
    luu();
    return true;
  }

  function xoaThucUong(id) {
    duLieu.danhSachThucUong = duLieu.danhSachThucUong.filter(function (t) {
      return t.id !== id;
    });
    luu();
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
    themDon: themDon,
    gopDonTuKhach: gopDonTuKhach,
    tinhDoanhThu: tinhDoanhThu,
  };
})();
