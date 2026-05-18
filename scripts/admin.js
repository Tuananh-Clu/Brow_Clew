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
  var panelThucUong = document.getElementById("panelThucUong");
  var form = document.getElementById("formThemMon");


  var currentSort = { column: "ten", direction: "asc" };
  var currentFilter = { search: "", category: "" };
  var currentOrderFilter = { status: "", fromDate: "", toDate: "" };
  var currentBeverageFilter = { search: "", category: "" };
  var currentBeverageSort = { column: "ten", direction: "asc" };


  document.querySelectorAll(".admin-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".admin-tab").forEach(function (t) {
        t.classList.remove("active");
      });
      tab.classList.add("active");
      var tabName = tab.dataset.tab;
      panelMon.hidden = tabName !== "mon";
      panelThucUong.hidden = tabName !== "thucuong";
      panelDt.hidden = tabName !== "doanhthu";
      if (tabName === "thucuong") veDanhSachThucUong();
      if (tabName === "doanhthu") veDoanhThu();
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


  document.getElementById("formThemThucUong").addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(this);
    var anh = fd.get("anh").trim() || "../images/PictureProductHero/1.png";

    CuaHang.themThucUong({
      name: fd.get("ten").trim(),
      category: fd.get("loai"),
      price: Number(fd.get("gia")),
      currency: "VND",
      image: anh,
      description: fd.get("moTa").trim() || "Thức uống từ Bold Brew.",
      isNew: fd.get("monMoi") === "on",
      options: [],
      toppings: [],
    });

    this.reset();
    veDanhSachThucUong();
    alert("✓ Đã thêm thức uống.");
  });


  document.getElementById("searchMon").addEventListener("input", function (e) {
    currentFilter.search = e.target.value;
    veDanhSachMon();
  });

  document.getElementById("filterCategory").addEventListener("change", function (e) {
    currentFilter.category = e.target.value;
    veDanhSachMon();
  });

  document.getElementById("searchThucUong").addEventListener("input", function (e) {
    currentBeverageFilter.search = e.target.value;
    veDanhSachThucUong();
  });

  document.getElementById("filterBeverageCategory").addEventListener("change", function (e) {
    currentBeverageFilter.category = e.target.value;
    veDanhSachThucUong();
  });

  document.querySelectorAll(".sortable").forEach(function (header) {
    header.addEventListener("click", function () {
      var column = this.dataset.sort;
      if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
      } else {
        currentSort.column = column;
        currentSort.direction = "asc";
      }
      veDanhSachMon();
    });
  });


  var setupBeverageSortHeaders = function () {
    var headers = document.querySelectorAll("#panelThucUong .sortable");
    headers.forEach(function (header) {
      header.onclick = null;
      header.addEventListener("click", function () {
        var column = this.dataset.sort;
        if (currentBeverageSort.column === column) {
          currentBeverageSort.direction = currentBeverageSort.direction === "asc" ? "desc" : "asc";
        } else {
          currentBeverageSort.column = column;
          currentBeverageSort.direction = "asc";
        }
        veDanhSachThucUong();
      });
    });
  };


  document.getElementById("filterFromDate").addEventListener("change", function (e) {
    currentOrderFilter.fromDate = e.target.value;
    veDoanhThu();
  });

  document.getElementById("filterToDate").addEventListener("change", function (e) {
    currentOrderFilter.toDate = e.target.value;
    veDoanhThu();
  });

  document.getElementById("filterOrderStatus").addEventListener("change", function (e) {
    currentOrderFilter.status = e.target.value;
    veDoanhThu();
  });


  document.getElementById("formSuaMon").addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(this);
    var monId = Number(this.dataset.monId);
    var anh = fd.get("anh").trim() || "../images/PictureProductHero/1.png";

    CuaHang.suaMon(monId, {
      name: fd.get("ten").trim(),
      category: fd.get("loai"),
      price: Number(fd.get("gia")),
      currency: "VND",
      image: anh,
      description: fd.get("moTa").trim() || "Món từ Bold Brew.",
      options: [],
      toppings: [],
    });

    closeModal("editItemModal");
    veDanhSachMon();
    alert("Đã cập nhật món.");
  });


  document.getElementById("formSuaThucUong").addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(this);
    var thucUongId = Number(this.dataset.thucUongId);
    var anh = fd.get("anh").trim() || "../images/PictureProductHero/1.png";

    CuaHang.suaThucUong(thucUongId, {
      name: fd.get("ten").trim(),
      category: fd.get("loai"),
      price: Number(fd.get("gia")),
      currency: "VND",
      image: anh,
      description: fd.get("moTa").trim() || "Thức uống từ Bold Brew.",
      options: [],
      toppings: [],
    });

    closeModal("editBeverageModal");
    veDanhSachThucUong();
    alert("✓ Đã cập nhật thức uống.");
  });

  function veDanhSachThucUong() {
    var thucUong = CuaHang.layThucUong();
    document.getElementById("soThucUong").textContent = thucUong.length;

    
    var filtered = thucUong.filter(function (t) {
      var matchSearch = t.name.toLowerCase().includes(currentBeverageFilter.search.toLowerCase());
      var matchCategory = !currentBeverageFilter.category || t.category === currentBeverageFilter.category;
      return matchSearch && matchCategory;
    });

    filtered.sort(function (a, b) {
      var aVal = a[currentBeverageSort.column];
      var bVal = b[currentBeverageSort.column];
      var cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return currentBeverageSort.direction === "asc" ? cmp : -cmp;
    });

    var tbody = document.getElementById("bangThucUong");
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--text-gray);">Không tìm thấy thức uống.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered
      .map(function (t) {
        return (
          "<tr><td>" +
          BrewStorage.chu(t.name) +
          "</td><td>" +
          BrewStorage.chu(t.category) +
          "</td><td>" +
          BrewStorage.tien(t.price) +
          '</td><td><div class="table-actions"><button type="button" class="btn-icon edit" data-id="' +
          t.id +
          '" title="Chỉnh sửa"><i class="fa-solid fa-pen"></i></button><button type="button" class="btn-icon delete" data-id="' +
          t.id +
          '" title="Xóa"><i class="fa-solid fa-trash"></i></button></div></td></tr>'
        );
      })
      .join("");

    // Edit buttons
    tbody.querySelectorAll(".btn-icon.edit").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var thucUongId = Number(this.dataset.id);
        var thucUong = CuaHang.layThucUong().find(function (t) {
          return t.id === thucUongId;
        });
        if (thucUong) openEditBeverageModal(thucUong);
      });
    });

    // Delete buttons
    tbody.querySelectorAll(".btn-icon.delete").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var thucUongId = Number(this.dataset.id);
        var thucUong = CuaHang.layThucUong().find(function (t) {
          return t.id === thucUongId;
        });
        if (thucUong && confirm("Xóa " + thucUong.name + "?")) {
          CuaHang.xoaThucUong(thucUongId);
          veDanhSachThucUong();
        }
      });
    });

    document.querySelectorAll("#panelThucUong .sortable").forEach(function (h) {
      h.classList.remove("active");
      if (h.dataset.sort === currentBeverageSort.column) {
        h.classList.add("active");
        var indicator = h.querySelector(".sort-indicator");
        indicator.textContent = currentBeverageSort.direction === "asc" ? "▲" : "▼";
      }
    });

    setupBeverageSortHeaders();
  }

  function openEditBeverageModal(thucUong) {
    var form = document.getElementById("formSuaThucUong");
    form.dataset.thucUongId = thucUong.id;
    form.querySelector('input[name="ten"]').value = thucUong.name;
    form.querySelector('select[name="loai"]').value = thucUong.category;
    form.querySelector('input[name="gia"]').value = thucUong.price;
    form.querySelector('input[name="anh"]').value = thucUong.image;
    form.querySelector('textarea[name="moTa"]').value = thucUong.description || "";

    openModal("editBeverageModal");
  }

  function veDoanhThu() {
    CuaHang.gopDonTuKhach();
    var dt = CuaHang.tinhDoanhThu();

    document.getElementById("tongDoanhThu").textContent = BrewStorage.tien(dt.tong);
    document.getElementById("soDonThanhCong").textContent = dt.soDon;
    document.getElementById("soDonHuy").textContent = dt.soDonHuy;
    document.getElementById("monBanChay").textContent = dt.monBanChay;

    var filtered = dt.donHang.filter(function (don) {
      var statusMatch = !currentOrderFilter.status || don.status === currentOrderFilter.status;
      var dateObj = new Date(don.date);
      var dateStr = dateObj.toISOString().split("T")[0];

      var fromMatch = !currentOrderFilter.fromDate || dateStr >= currentOrderFilter.fromDate;
      var toMatch = !currentOrderFilter.toDate || dateStr <= currentOrderFilter.toDate;

      return statusMatch && fromMatch && toMatch;
    });

    var tbody = document.getElementById("bangDon");
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-gray);">Không tìm thấy đơn.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered
      .slice(0, 50)
      .map(function (don) {
        var st = BrewStorage.trangThai(don.status);
        var khach = (don.customer && don.customer.fullName) || "—";
        return (
          '<tr style="cursor: pointer;" data-id="' +
          don.id +
          '"><td>' +
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

    // Click rows to open details
    tbody.querySelectorAll("tr").forEach(function (row) {
      row.addEventListener("click", function () {
        var orderId = this.dataset.id;
        var don = dt.donHang.find(function (d) {
          return d.id === orderId;
        });
        if (don) openOrderModal(don);
      });
    });
  }

  function openEditModal(mon) {
    var form = document.getElementById("formSuaMon");
    form.dataset.monId = mon.id;
    form.querySelector('input[name="ten"]').value = mon.name;
    form.querySelector('select[name="loai"]').value = mon.category;
    form.querySelector('input[name="gia"]').value = mon.price;
    form.querySelector('input[name="anh"]').value = mon.image;
    form.querySelector('textarea[name="moTa"]').value = mon.description || "";

    openModal("editItemModal");
  }

  function openOrderModal(don) {
    var content = document.getElementById("orderDetailsContent");
    var st = BrewStorage.trangThai(don.status);
    var khach = (don.customer && don.customer.fullName) || "Khách";
    var sdt = (don.customer && don.customer.phone) || "—";

    var itemsHtml = (don.items || [])
      .map(function (item) {
        var optionsText = Object.entries(item.options || {})
          .map(function (e) {
            return e[0] + ": " + e[1];
          })
          .join(", ");
        var toppingsText = (item.toppings || []).join(", ");
        var details = [optionsText, toppingsText].filter(Boolean).join(" | ");

        return (
          '<div class="order-item-row"><div><div class="order-item-name">' +
          BrewStorage.chu(item.productName) +
          '</div><div class="order-item-details">' +
          (details ? BrewStorage.chu(details) : "") +
          '</div></div><div class="order-item-price">×' +
          (item.quantity || 1) +
          " " +
          BrewStorage.tien(item.totalPrice || item.price) +
          "</div></div>"
        );
      })
      .join("");

    content.innerHTML =
      '<div class="order-info"><div class="order-info-item"><div class="order-info-label">Mã đơn</div><div class="order-info-value">' +
      BrewStorage.chu(don.id) +
      '</div></div><div class="order-info-item"><div class="order-info-label">Khách</div><div class="order-info-value">' +
      BrewStorage.chu(khach) +
      '</div></div><div class="order-info-item"><div class="order-info-label">SĐT</div><div class="order-info-value">' +
      sdt +
      '</div></div><div class="order-info-item"><div class="order-info-label">Ngày</div><div class="order-info-value">' +
      BrewStorage.ngay(don.date) +
      " " +
      BrewStorage.gio(don.date) +
      '</div></div></div><div class="order-items-list"><h3>Sản phẩm</h3>' +
      itemsHtml +
      '</div><div class="order-summary"><span class="order-summary-label">Tổng cộng</span><span class="order-summary-value">' +
      BrewStorage.tien(don.total) +
      '</span></div><div style="margin-top: 20px; display: flex; gap: 12px;"><label style="flex: 1; display: flex; flex-direction: column; gap: 6px;"><span style="font-size: 13px; font-weight: 600;">Trạng thái</span><select class="status-select" data-order-id="' +
      don.id +
      '"><option value="processing" ' +
      (don.status === "processing" ? "selected" : "") +
      '>⟳ Đang xử lý</option><option value="completed" ' +
      (don.status === "completed" ? "selected" : "") +
      '>✓ Thành công</option><option value="cancelled" ' +
      (don.status === "cancelled" ? "selected" : "") +
      '>✗ Đã hủy</option></select></label></div>';

    document.querySelectorAll(".status-select").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var orderId = this.dataset.orderId;
        updateOrderStatus(orderId, this.value);
      });
    });

    openModal("orderDetailsModal");
  }

  function updateOrderStatus(orderId, newStatus) {
    var dt = CuaHang.tinhDoanhThu();
    var don = dt.donHang.find(function (d) {
      return d.id === orderId;
    });
    if (don) {
      don.status = newStatus;
      CuaHang.gopDonTuKhach();
      alert("✓ Cập nhật trạng thái.");
      veDoanhThu();
    }
  }

  veDanhSachMon();

  
  CuaHang.taiThucUongTuFirestore().then(function () {
    veDanhSachThucUong();
  });

 
  var setupModalListeners = function () {
    document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
      overlay.removeEventListener("click", handleOverlayClick);
      overlay.addEventListener("click", handleOverlayClick);
    });
  };

  var handleOverlayClick = function (e) {
    if (e.target === this) {
      closeModal(this.id);
    }
  };

  setupModalListeners();
});

function openModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
  }
}
