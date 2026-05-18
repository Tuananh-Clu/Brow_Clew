import { db } from "./AuthService.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


export async function fetchProductsDetail() {
  try {
    const docSnap = await getDoc(doc(db, "shop", "ProductsDetail"));
    if (docSnap.exists()) {
      const data = docSnap.data().data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
    return fetch('data/ProductsDetail.json').then(r => r.json());
  } catch (e) {
    console.error("fetchProductsDetail failed, falling back to local:", e);
    return fetch('data/ProductsDetail.json').then(r => r.json());
  }
}

export async function fetchHeroProducts() {
  try {
    const docSnap = await getDoc(doc(db, "shop", "ProductForHeroSection"));
    if (docSnap.exists()) {
      const data = docSnap.data().data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
    return fetch('data/ProductForHeroSection.json').then(r => r.json());
  } catch (e) {
    console.error("fetchHeroProducts failed, falling back to local:", e);
    return fetch('data/ProductForHeroSection.json').then(r => r.json());
  }
}

export async function fetchOrders() {
  try {
    const docSnap = await getDoc(doc(db, "shop", "orders"));
    if (docSnap.exists()) {
      const data = docSnap.data().data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
    return fetch('data/orders.json').then(r => r.json());
  } catch (e) {
    console.error("fetchOrders failed, falling back to local:", e);
    return fetch('data/orders.json').then(r => r.json());
  }
}

export async function fetchReviews() {
  try {
    const docSnap = await getDoc(doc(db, "shop", "reviews"));
    if (docSnap.exists()) {
      const data = docSnap.data().data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
    return fetch('data/reviews.json').then(r => r.json());
  } catch (e) {
    console.error("fetchReviews failed, falling back to local:", e);
    return fetch('data/reviews.json').then(r => r.json());
  }
}

export async function updateProductsDetail(data) {
  await setDoc(doc(db, "shop", "ProductsDetail"), { data });
}

export async function updateHeroProducts(data) {
  await setDoc(doc(db, "shop", "ProductForHeroSection"), { data });
}

export async function updateOrders(data) {
  await setDoc(doc(db, "shop", "orders"), { data });
}
