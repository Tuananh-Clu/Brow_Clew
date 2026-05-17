const currentPage = location.pathname.split("/").pop() || "index.html";
const history = [];
let systemInstruction = "";
let menuLoaded = false;
const headerTemplate = `
  <div class="container nav-wrapper">
    <a href="index.html" class="logo">Bold Brew<span>.</span></a>
    <nav>
      <ul>
        <li><a href="index.html">Trang chủ</a></li>
        <li><a href="product.html">Sản phẩm</a></li>
        <li><a href="recipes.html">Công Thức Của Tôi</a></li>
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
      <a href="cart.html" class="btn-icon btn_cart" aria-label="Giỏ hàng">
        <i class="fas fa-shopping-cart"></i>
      </a>
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
function injectAIStyles() {
  const style = document.createElement("style");
  style.textContent = `
.ai-suggestions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.suggestion-card {
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  transition: transform 0.2s, border-color 0.2s;
}

.suggestion-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.2);
}

.suggestion-img-wrap {
  position: relative;
  flex-shrink: 0;
}

.suggestion-img-wrap img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 12px;
}

.suggestion-category {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.suggestion-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.suggestion-info h4 {
  margin: 0;
  font-size: 15px;
  color: #fff;
  font-weight: 600;
}

.suggestion-subtitle {
  font-size: 12px;
  color: #aaa;
  margin: 0;
}

.suggestion-desc {
  font-size: 12px;
  color: #888;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.suggestion-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.suggestion-price {
  font-size: 15px;
  font-weight: 700;
  color: #f5c842;
}

.suggestion-btn {
  background: #f5c842;
  color: #111;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}

.suggestion-btn:hover {
  background: #e6b800;
}

.typing-dots {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: #666;
  border-radius: 50%;
  animation: bounce 1.2s infinite;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}
  `;
  document.head.appendChild(style);
}
function injectComponents() {
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  injectAIStyles();
  const body = document.body;
  let userData = null;
  if (typeof BrewStorage !== "undefined") {
    userData = BrewStorage.duLieu.nguoiDung;
  } else {
    const raw = localStorage.getItem("user");
    userData = raw ? JSON.parse(raw) : null;
  }

  if (!document.querySelector(".ai-chat-panel")) {
    body.insertAdjacentHTML("beforeend", aiChatTemplate);
    setupAIChat();
  }

  if (header) {
    header.innerHTML = headerTemplate;
    const cartBtn = header.querySelector(".btn_cart");
    cartBtn.addEventListener("click", () => (window.location.href = "cart.html"));
    header.querySelector(".btn-ai-open").addEventListener("click", openAIChat);
    header.querySelectorAll("nav a").forEach((link) => {
      if (link.getAttribute("href") === currentPage)
        link.classList.add("active");
    });

    if (userData) setupUserMenu(header, userData);
  }

  if (footer) footer.innerHTML = footerTemplate;
}

function setupUserMenu(header, userData) {
  const loginBtn = header.querySelector(".btn-login");
  if (!loginBtn) return;

  const userMenu = document.createElement("div");
  userMenu.className = "user-menu";
  userMenu.innerHTML = `
    <button class="btn-user-icon" aria-label="Menu người dùng">
      ${userData.photoURL ? `<img src="${userData.photoURL}" alt="Avatar" class="user-avatar">` : `<i class="fas fa-user"></i>`}
    </button>
    <div class="user-dropdown">
      <div class="user-info">
        <p class="user-name">${userData.name}</p>
        <p class="user-email">${userData.email}</p>
      </div>
      <a href="dashboard.html" class="dropdown-link"><i class="fas fa-user"></i> Bảng điều khiển</a>
      <a href="historyorder.html" class="dropdown-link"><i class="fas fa-box"></i> Đơn hàng</a>
      <a href="#" class="dropdown-link ai-recommend-link"><i class="fas fa-wand-magic-sparkles"></i> AI Chọn Món</a>
      <hr class="dropdown-divider">
      <button class="dropdown-link logout-btn"><i class="fas fa-sign-out-alt"></i> Đăng xuất</button>
    </div>
  `;

  loginBtn.replaceWith(userMenu);

  const dropdown = userMenu.querySelector(".user-dropdown");
  userMenu
    .querySelector(".btn-user-icon")
    .addEventListener("click", () => dropdown.classList.toggle("active"));
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-menu")) dropdown.classList.remove("active");
  });

  userMenu
    .querySelector(".ai-recommend-link")
    .addEventListener("click", (e) => {
      e.preventDefault();
      dropdown.classList.remove("active");
      openAIChat();
    });

  userMenu.querySelector(".logout-btn").addEventListener("click", async () => {
    const { logout } = await import("./AuthService.js");
    logout();
  });
}

function setupAIChat() {
  const panel = document.querySelector(".ai-chat-panel");
  const closeBtn = panel.querySelector(".ai-close-btn");
  const sendBtn = panel.querySelector(".ai-chat-send");
  const input = panel.querySelector(".ai-chat-input");
  const overlay = document.querySelector(".ai-chat-overlay");

  closeBtn.addEventListener("click", closeAIChat);
  overlay.addEventListener("click", closeAIChat);
  sendBtn.addEventListener("click", () => sendMessage(input.value));
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage(input.value);
  });

  addAIInitialMessage();
}

function openAIChat() {
  const panel = document.querySelector(".ai-chat-panel");
  panel.classList.add("active");
}

function closeAIChat() {
  const panel = document.querySelector(".ai-chat-panel");
  panel.classList.remove("active");
}

function addAIInitialMessage() {
  const messages = document.querySelector(".ai-chat-messages");
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



async function sendMessage(text) {
  const API_KEY = "AIzaSyBVChV9D0RHxR9A1t83LnjQLQp9wTSUx2g";

  if (!text.trim()) return;

  const input = document.querySelector(".ai-chat-input");
  const messages = document.querySelector(".ai-chat-messages");

  if (!menuLoaded) {
    const data = await fetch("data/ProductForHeroSection.json").then((res) =>
      res.json()
    );
    systemInstruction = `
      Bạn là trợ lý tư vấn món uống của quán cà phê.
      Đây là toàn bộ menu: ${JSON.stringify(data)}

      Khi gợi ý món, LUÔN trả về JSON theo đúng định dạng sau, KHÔNG giải thích thêm:
      {
        "message": "Lời tư vấn chi tiết",
        "suggestions": [
          {
            "id": "id của món",
            "name": "Tên món",
            "subtitle": "Subtitle",
            "price": 80000,
            "currency": "VND",
            "description": "Mô tả món",
            "image": "đường dẫn ảnh",
            "category": "danh mục"
          }
        ]
      }
    `;
    menuLoaded = true;
  }

  messages.innerHTML += `
    <div class="user-message">
      <div class="user-message-content">${text}</div>
    </div>
  `;
  input.value = "";
  messages.scrollTop = messages.scrollHeight;

  history.push({ role: "user", parts: [{ text: text }] });

  const loadingId = "loading-" + Date.now();
  messages.innerHTML += `
    <div class="ai-message" id="${loadingId}">
      <div class="ai-avatar">AI</div>
      <div class="ai-message-content">
        <div class="typing-dots"><span></span><span></span><span></span></div>
      </div>
    </div>
  `;
  messages.scrollTop = messages.scrollHeight;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: history,
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    const result = await res.json();
    document.getElementById(loadingId)?.remove();

    if (result.error) {
      messages.innerHTML += `
        <div class="ai-message">
          <div class="ai-avatar">AI</div>
          <div class="ai-message-content error">⚠️ ${result.error.message}</div>
        </div>
      `;
      return;
    }

    const aiResponse = result.candidates[0].content.parts[0].text;
    history.push({ role: "model", parts: [{ text: aiResponse }] });

    const parsed = JSON.parse(aiResponse);

    messages.innerHTML += `
      <div class="ai-message">
        <div class="ai-avatar">AI</div>
        <div class="ai-message-content">
          <p class="ai-text">${parsed.message}</p>
          <div class="ai-suggestions">
            ${parsed.suggestions.map((s) => `
              <div class="suggestion-card" style="background: linear-gradient(135deg, #1a1a1a, #2d2d2d)">
                <div class="suggestion-img-wrap">
                  <img src="${s.image}" alt="${s.name}" />
                  <span class="suggestion-category">${s.category}</span>
                </div>
                <div class="suggestion-info">
                  <h4>${s.name}</h4>
                  <p class="suggestion-subtitle">${s.subtitle}</p>
                  <p class="suggestion-desc">${s.description}</p>
                  <div class="suggestion-footer">
                    <span class="suggestion-price">${Number(s.price).toLocaleString("vi-VN")}₫</span>
                    <a href="product-detail.html?id=${s.id}" class="suggestion-btn">
                      Xem món →
                    </a>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    messages.scrollTop = messages.scrollHeight;

  } catch (error) {
    document.getElementById(loadingId)?.remove();
    console.error("Error:", error);
  }
}

document.addEventListener("DOMContentLoaded", injectComponents);
