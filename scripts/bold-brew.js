let id = 1;
let products = [];
let isAnimating = false;

const hero = document.querySelector(".hero");
const subtitleEl = document.querySelector(".hero-subtitle");
const titleEl = document.querySelector(".hero-title");
const descEl = document.querySelector(".hero-desc");
const priceEl = document.querySelector(".hero-price");
const imgWrap = document.querySelector(".hero-img-wrap");
const imgEl = document.querySelector(".hero-img");
const featureEl = document.querySelector(".hero-mini");
const btnLeft = document.querySelector(".button_left");
const btnRight = document.querySelector(".button_right");
const btnDetails = document.querySelector(".button_details");

async function init() {
  const res = await fetch("data/ProductForHeroSection.json");
  products = await res.json();
  if (products.length) {
    id = products[0].id;
    renderProduct(id);
  }
}

function renderProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  subtitleEl.innerHTML = product.subtitle;
  titleEl.innerHTML = product.name;
  descEl.innerHTML = product.description;
  priceEl.innerHTML = `<span class="hero-price-label">Giá</span> ${product.price.toLocaleString("vi-VN")}đ`;
  imgEl.src = product.image;
  imgEl.alt = product.name;
  featureEl.innerHTML = product.features.map(f => `<li>${f.title}: ${f.value}</li>`).join("");
  hero.style.background = product.theme.background;
  hero.style.setProperty("--brand-orange", product.theme.primary);
  hero.style.setProperty("--brand-orange-soft", product.theme.secondary);
  btnDetails.onclick = () => window.location.href = `product-detail.html?id=${product.id}`;
}

function animateChange(nextId) {
  if (isAnimating) return;
  isAnimating = true;
  imgWrap.classList.add("hide");
  titleEl.classList.add("hide");

  setTimeout(() => {
    id = nextId;
    renderProduct(id);
    imgWrap.classList.remove("hide");
    titleEl.classList.remove("hide");
    imgWrap.classList.add("show");
    titleEl.classList.add("show");
    setTimeout(() => {
      imgWrap.classList.remove("show");
      titleEl.classList.remove("show");
      isAnimating = false;
    }, 800);
  }, 600);
}

function getNextProductId(offset) {
  const index = products.findIndex(p => p.id === id);
  return products[(index + offset + products.length) % products.length].id;
}

init();
btnRight.addEventListener("click", () => animateChange(getNextProductId(1)));
btnLeft.addEventListener("click", () => animateChange(getNextProductId(-1)));