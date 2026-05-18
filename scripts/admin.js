document.addEventListener("DOMContentLoaded", function () {
  try {
    const user = localStorage.getItem("user");
    if (!user) {
      location.href = "login.html?next=admin.html";
      return;
    }
  } catch (e) {
    location.href = "login.html?next=admin.html";
    return;
  }

  MemberUI.mountSidebar("admin");
  CuaHang.gopDonTuKhach();

  var panelMon = document.getElementById("panelMon");
  var panelDt = document.getElementById("panelDoanhThu");
  var form = document.getElementById("formThemMon");

  document.querySelectorAll(".admin-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".admin-tab").forEach(function (t) {
        t.classList.remove("active");
      });
      tab.classList.add("active");
      var laMon = tab.dataset.tab === "mon";
      panelMon.hidden = !laMon;
      panelDt.hidden = laMon;
      if (!laMon) veDoanhThu();
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var anh = fd.get("anh").trim() || "../images/PictureProductHero/1.png";

    CuaHang.themMon({
      name: fd.get("ten").trim(),
      category: fd.get("loai"),
      price: Number(fd.get("gia")),
      currency: "VND",
      image: anh,
      description: fd.get("moTa").trim() || "Món mới từ Bold Brew.",
      isNew: fd.get("monMoi") === "on",
      options: [],
      toppings: [],
    });

    form.reset();
    veDanhSachMon();
    alert("Đã thêm món vào thực đơn.");
  });

  function veDanhSachMon() {
    var mon = CuaHang.layMon();
    document.getElementById("soMon").textContent = mon.length;
    var tbody = document.getElementById("bangMon");

    if (!mon.length) {
      tbody.innerHTML = '<tr><td colspan="4">Chưa có món tự thêm.</td></tr>';
      return;
    }

    tbody.innerHTML = mon
      .map(function (m) {
        return (
          "<tr><td>" +
          BrewStorage.chu(m.name) +
          "</td><td>" +
          BrewStorage.chu(m.category) +
          "</td><td>" +
          BrewStorage.tien(m.price) +
          '</td><td><button type="button" class="btn-xoa" data-id="' +
          m.id +
          '">Xóa</button></td></tr>'
        );
      })
      .join("");

    tbody.querySelectorAll(".btn-xoa").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!confirm("Xóa món này?")) return;
        CuaHang.xoaMon(Number(btn.dataset.id));
        veDanhSachMon();
      });
    });
  }

  function veDoanhThu() {
    CuaHang.gopDonTuKhach();
    var dt = CuaHang.tinhDoanhThu();

    document.getElementById("tongDoanhThu").textContent = BrewStorage.tien(dt.tong);
    document.getElementById("soDonThanhCong").textContent = dt.soDon;
    document.getElementById("soDonHuy").textContent = dt.soDonHuy;
    document.getElementById("monBanChay").textContent = dt.monBanChay;

    var tbody = document.getElementById("bangDon");
    if (!dt.donHang.length) {
      tbody.innerHTML = '<tr><td colspan="5">Chưa có đơn hàng.</td></tr>';
      return;
    }

    tbody.innerHTML = dt.donHang
      .slice(0, 20)
      .map(function (don) {
        var st = BrewStorage.trangThai(don.status);
        var khach = (don.customer && don.customer.fullName) || "—";
        return (
          "<tr><td>" +
          BrewStorage.chu(don.id) +
          "</td><td>" +
          BrewStorage.ngay(don.date) +
          "</td><td>" +
          BrewStorage.chu(khach) +
          "</td><td>" +
          BrewStorage.tien(don.total) +
          '</td><td><span class="status ' +
          st.class +
          '">' +
          st.label +
          "</span></td></tr>"
        );
      })
      .join("");
  }

  veDanhSachMon();
});
