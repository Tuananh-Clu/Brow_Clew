document.addEventListener("DOMContentLoaded", function () {
  MemberUI.mountSidebar("vip");
  var root = document.getElementById("vipContent");
  var vip = AppStorage.duLieu.hoiVien;
  var stats = AppStorage.thongKe();

  let user = null;
  try {
    const userRaw = localStorage.getItem("user");
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
  }

  if (vip && vip.registeredAt) {
    root.innerHTML = memberView(vip, stats.points, stats.tier);
    return;
  }

  root.innerHTML = registerView(user);
  document.getElementById("vipForm").addEventListener("submit", onRegister);
});

function perk(icon, title, desc) {
  return (
    '<div class="vip-perk"><i class="fa-solid ' + icon + '"></i>' +
    "<div><strong>" + title + "</strong><span>" + desc + "</span></div></div>"
  );
}

function field(label, name, type, value, required) {
  return (
    '<div class="form-row"><label>' + label + "</label>" +
    '<input type="' + type + '" name="' + name + '" value="' + AppStorage.chu(value) + '"' +
    (required ? " required" : "") +
    "></div>"
  );
}

function cardPreview(name, tier, points, note) {
  return (
    '<div class="vip-card-display">' +
    '<div class="vip-card-brand">Bold Brew VIP</div>' +
    '<div class="vip-card-name">' + AppStorage.chu(name) + "</div>" +
    '<span class="vip-card-tier">' + AppStorage.chu(tier) + "</span>" +
    '<div class="vip-card-points">Điểm tích lũy<strong>' + points + "</strong></div>" +
    '<p class="vip-card-note">' + AppStorage.chu(note) + "</p></div>"
  );
}

function registerView(user) {
  var name = (user && user.name) || "";
  var email = (user && user.email) || "";
  return (
    '<div class="vip-layout"><div>' +
    cardPreview("Thẻ thành viên", "Đăng ký miễn phí", "+50", "Silver · Gold · Platinum theo điểm") +
    '<div class="vip-perks">' +
    perk("fa-star", "Tích điểm", "Mỗi 10.000đ = 1 điểm") +
    perk("fa-tags", "Giảm giá theo hạng", "Từ 5% đến 15%") +
    perk("fa-bell", "Ưu đãi riêng", "Nhận khuyến mãi sớm") +
    "</div></div>" +
    '<div class="vip-form-panel"><h2>Đăng ký hội viên VIP</h2>' +
    "<p>Điền thông tin để nhận thẻ và đồng bộ với tài khoản.</p>" +
    '<form id="vipForm">' +
    field("Họ và tên", "fullName", "text", name, true) +
    field("Email", "email", "email", email, true) +
    field("Số điện thoại", "phone", "tel", "", true) +
    field("Ngày sinh", "birthday", "date", "", false) +
    '<label class="form-check"><input type="checkbox" name="agree" required>' +
    "<span>Tôi đồng ý điều khoản hội viên Bold Brew.</span></label>" +
    '<button type="submit" class="btn btn-orange btn-block">Đăng ký VIP ngay</button>' +
    "</form></div></div>"
  );
}

function memberView(vip, points, tier) {
  return (
    '<div class="vip-layout"><div>' +
    cardPreview(vip.fullName, tier.label, points, "Giảm " + tier.discount + "% · " + vip.email) +
    '<div class="vip-perks">' +
    perk("fa-percent", "Ưu đãi " + tier.label, "Giảm " + tier.discount + "% mỗi đơn") +
    perk("fa-gift", "Quà sinh nhật", "Món miễn phí tháng sinh nhật") +
    perk("fa-truck-fast", "Giao ưu tiên", "Đơn VIP chuẩn bị trước") +
    "</div>" +
    '<p class="vip-registered-date">Đăng ký: ' + AppStorage.ngay(vip.registeredAt) + "</p></div>" +
    '<div class="vip-form-panel"><div class="vip-success">' +
    '<i class="fa-solid fa-circle-check"></i><h2>Bạn đã là hội viên VIP</h2>' +
    '<p class="vip-success-text">Cảm ơn bạn đã đồng hành cùng Bold Brew.</p>' +
    '<a href="historyorder.html" class="btn btn-outline">Xem lịch sử đơn</a> ' +
    '<a href="product.html" class="btn btn-black vip-cta-gap">Đặt món ngay</a>' +
    "</div></div></div>"
  );
}

async function onRegister(e) {
  e.preventDefault();
  var fd = new FormData(e.target);
  var fullName = fd.get("fullName").trim();
  var email = fd.get("email").trim().toLowerCase();
  var phone = fd.get("phone").trim();

  if (!fullName || !email || !phone) {
    alert("Vui lòng điền đủ họ tên, email và số điện thoại.");
    return;
  }

  var submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Đang đăng ký...";

  AppStorage.duLieu.hoiVien = {
    fullName: fullName,
    email: email,
    phone: phone,
    birthday: fd.get("birthday") || "",
    registeredAt: new Date().toISOString(),
    welcomeBonus: 50,
  };

  AppStorage.luu();

  try {
    await AppStorage.syncUserVipToFirestore();
  } catch (err) {
    console.error("Failed to sync VIP member details to Firestore:", err);
  }

  alert("Chúc mừng! Bạn đã trở thành hội viên VIP (+50 điểm chào mừng).");
  location.reload();
}
