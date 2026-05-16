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
      <button type="button" class="btn-icon btn_cart" aria-label="Giỏ hàng">
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
  const user = localStorage.getItem('user');
  const userData = user ? JSON.parse(user) : null;

  if (header) {
    header.innerHTML = headerTemplate;

    const btnCart = header.querySelector('.btn_cart');
    if (btnCart) {
      btnCart.addEventListener('click', () => {
        window.location.href = 'cart.html';
      });
    }

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = header.querySelectorAll('nav a');
    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });

    if (userData) {
      const headerActions = header.querySelector('.header-actions');
      const loginBtn = header.querySelector('.btn-login');

      if (loginBtn && headerActions) {
        const userMenuHTML = `
          <div class="user-menu">
            <button class="btn-user-icon" aria-label="Menu người dùng">
              ${userData.photoURL
                ? `<img src="${userData.photoURL}" alt="Avatar" class="user-avatar">`
                : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
              }
            </button>
            <div class="user-dropdown">
              <div class="user-info">
                <p class="user-name">${userData.name}</p>
                <p class="user-email">${userData.email}</p>
              </div>
              <a href="profile.html" class="dropdown-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Hồ sơ cá nhân
              </a>
              <a href="orders.html" class="dropdown-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                Đơn hàng
              </a>
              <hr class="dropdown-divider">
              <button class="dropdown-link logout-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Đăng xuất
              </button>
            </div>
          </div>
        `;

        loginBtn.replaceWith(new DOMParser().parseFromString(userMenuHTML, 'text/html').body.firstChild);

        const userBtn = header.querySelector('.btn-user-icon');
        const dropdown = header.querySelector('.user-dropdown');
        const logoutBtn = header.querySelector('.logout-btn');

        userBtn.addEventListener('click', () => {
          dropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
          if (!e.target.closest('.user-menu')) {
            dropdown.classList.remove('active');
          }
        });

        logoutBtn.addEventListener('click', async () => {
          const { logout } = await import('./AuthService.js');
          logout();
        });
      }
    }
  }

  if (footer) {
    footer.innerHTML = footerTemplate;
  }
}

document.addEventListener('DOMContentLoaded', injectComponents);
