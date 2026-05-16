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
      <button type="button" class="btn-icon btn-ai-open" aria-label="AI Chọn Món" title="AI Chọn Món">
        <i class="fas fa-wand-magic-sparkles"></i>
      </button>
      <button type="button" class="btn-icon btn_cart" aria-label="Giỏ hàng">
        <i class="fas fa-shopping-cart"></i>
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

const aiChatTemplate = `
  <div class="ai-chat-panel">
    <div class="ai-chat-header">
      <h3>
        <i class="fas fa-wand-magic-sparkles"></i>
        AI Chọn Món Cho Bạn
      </h3>
      <button class="ai-close-btn" aria-label="Đóng">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="ai-chat-messages"></div>
    <div class="ai-chat-input-group">
      <input type="text" class="ai-chat-input" placeholder="Mình thích như thế nào? (Ví dụ: không quá đắng)..." />
      <button class="ai-chat-send" aria-label="Gửi"><i class="fas fa-paper-plane"></i></button>
    </div>
  </div>
  <div class="ai-chat-overlay"></div>
`;

function injectComponents() {
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const body = document.body;
  const userData = (() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  })();

  if (!document.querySelector('.ai-chat-panel')) {
    body.insertAdjacentHTML('beforeend', aiChatTemplate);
    setupAIChat();
  }

  if (header) {
    header.innerHTML = headerTemplate;
    header.querySelector('.btn_cart').addEventListener('click', () => window.location.href = 'cart.html');
    header.querySelector('.btn-ai-open').addEventListener('click', openAIChat);

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    header.querySelectorAll('nav a').forEach(link => {
      if (link.getAttribute('href') === currentPage) link.classList.add('active');
    });

    if (userData) setupUserMenu(header, userData);
  }

  if (footer) footer.innerHTML = footerTemplate;
}

function setupUserMenu(header, userData) {
  const loginBtn = header.querySelector('.btn-login');
  if (!loginBtn) return;

  const userMenu = document.createElement('div');
  userMenu.className = 'user-menu';
  userMenu.innerHTML = `
    <button class="btn-user-icon" aria-label="Menu người dùng">
      ${userData.photoURL ? `<img src="${userData.photoURL}" alt="Avatar" class="user-avatar">` : `<i class="fas fa-user"></i>`}
    </button>
    <div class="user-dropdown">
      <div class="user-info">
        <p class="user-name">${userData.name}</p>
        <p class="user-email">${userData.email}</p>
      </div>
      <a href="profile.html" class="dropdown-link"><i class="fas fa-user"></i> Hồ sơ cá nhân</a>
      <a href="orders.html" class="dropdown-link"><i class="fas fa-box"></i> Đơn hàng</a>
      <a href="#" class="dropdown-link ai-recommend-link"><i class="fas fa-wand-magic-sparkles"></i> AI Chọn Món</a>
      <hr class="dropdown-divider">
      <button class="dropdown-link logout-btn"><i class="fas fa-sign-out-alt"></i> Đăng xuất</button>
    </div>
  `;

  loginBtn.replaceWith(userMenu);

  const dropdown = userMenu.querySelector('.user-dropdown');
  userMenu.querySelector('.btn-user-icon').addEventListener('click', () => dropdown.classList.toggle('active'));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) dropdown.classList.remove('active');
  });

  userMenu.querySelector('.ai-recommend-link').addEventListener('click', (e) => {
    e.preventDefault();
    dropdown.classList.remove('active');
    openAIChat();
  });

  userMenu.querySelector('.logout-btn').addEventListener('click', async () => {
    const { logout } = await import('./AuthService.js');
    logout();
  });
}

function setupAIChat() {
  const panel = document.querySelector('.ai-chat-panel');
  const closeBtn = panel.querySelector('.ai-close-btn');
  const sendBtn = panel.querySelector('.ai-chat-send');
  const input = panel.querySelector('.ai-chat-input');
  const overlay = document.querySelector('.ai-chat-overlay');

  closeBtn.addEventListener('click', closeAIChat);
  overlay.addEventListener('click', closeAIChat);
  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(input.value);
  });

  addAIInitialMessage();
}

function openAIChat() {
  const panel = document.querySelector('.ai-chat-panel');
  panel.classList.add('active');
}

function closeAIChat() {
  const panel = document.querySelector('.ai-chat-panel');
  panel.classList.remove('active');
}

function addAIInitialMessage() {
  const messages = document.querySelector('.ai-chat-messages');
  if (messages.children.length === 0) {
    messages.innerHTML = `
      <div class="ai-message">
        <div class="ai-message-content">
          Xin chào! 👋 Tôi là AI trợ lý của Bold Brew. Hãy cho tôi biết sở thích của bạn, tôi sẽ giới thiệu những tách cà phê hoàn hảo nhất!
          <p style="margin-top: 8px; font-size: 13px; opacity: 0.8;">Ví dụ: "Tôi muốn cà phê nhẹ nhàng, không quá đắng"</p>
        </div>
      </div>
    `;
  }
}

function sendMessage(text) {
  if (!text.trim()) return;

  const input = document.querySelector('.ai-chat-input');
  const messages = document.querySelector('.ai-chat-messages');

  messages.innerHTML += `<div class="user-message"><div class="user-message-content">${text}</div></div>`;
  input.value = '';

  setTimeout(() => {
    const response = generateAIResponse(text);
    messages.innerHTML += `<div class="ai-message"><div class="ai-message-content">${response}</div></div>`;
    messages.scrollTop = messages.scrollHeight;
  }, 600);

  messages.scrollTop = messages.scrollHeight;
}

function generateAIResponse(userInput) {
  const input = userInput.toLowerCase();
  const responses = {
    'nhẹ nhàng': 'Tuyệt vời! Bạn sẽ thích <strong>Cold Brew Đá</strong> của chúng tôi - hương vị cân bằng, không sữa bò, và rất mượt mà. <button class="ai-product-btn">Xem chi tiết</button>',
    'đắng': 'Bạn muốn trải nghiệm vị đắng đặc trưng? <strong>Đen Nguyên Bản</strong> là lựa chọn hoàn hảo - năng lượng cổ điển, không pha tạp. <button class="ai-product-btn">Xem chi tiết</button>',
    'sô cô la': 'Tôi biết rồi! <strong>Macchiato</strong> kết hợp sô cô la đậm với caffeine - chính là những gì bạn đang tìm! <button class="ai-product-btn">Xem chi tiết</button>',
    'default': 'Dựa trên sở thích của bạn, tôi gợi ý <strong>Cold Brew Đá</strong> - nó cân bằng hoàn hảo giữa vị đậm và mượt mà. Bạn có muốn biết thêm? <button class="ai-product-btn">Xem chi tiết</button>'
  };

  for (let [key, value] of Object.entries(responses)) {
    if (key !== 'default' && input.includes(key)) return value;
  }
  return responses.default;
}

document.addEventListener('DOMContentLoaded', injectComponents);
