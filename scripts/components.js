const headerTemplate = `
  <div class="container nav-wrapper">
    <a href="index.html" class="logo">Bold Brew<span>.</span></a>
    <nav>
      <ul>
        <li><a href="index.html">Trang chủ</a></li>
        <li><a href="product.html">Sản phẩm</a></li>
        <li><a href="about.html">Giới thiệu</a></li>
        <li><a href="contact.html">Liên hệ</a></li>
        <li><a href="leaderboard.html">Bảng Xếp Hạng</a></li>
      </ul>
    </nav>
    <div class="header-actions">
      <a href="login.html" class="btn btn-outline btn-login">Đăng nhập</a>
      <button  type="button" class="btn-icon btn_cart" aria-label="Giỏ hàng">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </button>
    </div>
  </div>
`;

const footerTemplate = `
  <div class="container footer-grid">
    <div class="footer-brand">
      <a href="index.html" class="footer-logo">Bold Brew<span>.</span></a>
      <p class="footer-tagline">Hương vị trọn vẹn và caffeine sạch cho những ai không chấp nhận dừng lại.</p>
      <div class="social">
        <a href="#" aria-label="Trang Instagram">IG</a>
        <a href="#" aria-label="Twitter hoặc X">X</a>
        <a href="#" aria-label="Kênh YouTube">YT</a>
      </div>
    </div>
    <div>
      <h4 class="footer-title">Công ty</h4>
      <ul class="footer-links">
        <li><a href="about.html">Giới thiệu</a></li>
        <li><a href="#">Tuyển dụng</a></li>
        <li><a href="#">Dự án</a></li>
        <li><a href="contact.html">Liên hệ</a></li>
      </ul>
    </div>
    <div>
      <h4 class="footer-title">Hỗ trợ</h4>
      <ul class="footer-links">
        <li><a href="#">Trung tâm trợ giúp</a></li>
        <li><a href="#">Phục vụ 24 giờ</a></li>
        <li><a href="#">Chat nhanh</a></li>
      </ul>
    </div>
    <div>
      <div class="callback-card">
        <h4 class="callback-title">Liên hệ</h4>
        <input type="text" name="name" placeholder="Họ và tên">
        <input type="email" name="contact-email" placeholder="Email của bạn">
        <button type="button" class="btn btn-orange btn-block">Gửi</button>
      </div>
    </div>
  </div>
  <div class="container footer-copy">
    <p>Bản quyền © 2026. Thuộc về Bold Brew.</p>
  </div>
`;

function injectComponents() {
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const data=localStorage.getItem('userData');
  const btnCart = document.querySelector('.btn_cart');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  if (btnCart) {
    btnCart.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  }
  const userData = data ? JSON.parse(data) : null;

  if (userData) {
    const loginBtn = header.querySelector('.btn-login');
    if (loginBtn) {
      loginBtn.textContent = userData.name;
      loginBtn.classList.remove('btn-outline');
      loginBtn.classList.add('btn-solid');
      loginBtn.href = 'profile.html';
    }
  }
  if (header) {
    header.innerHTML = headerTemplate;
    
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = header.querySelectorAll('nav a');
    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      }
    });
  }

  if (footer) {
    footer.innerHTML = footerTemplate;
  }
}

document.addEventListener('DOMContentLoaded', injectComponents);
