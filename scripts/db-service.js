import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAiPRFB87Pm_rIqXDPbXfH93NZNLWK6BIM",
  authDomain: "coldbrew-e06ee.firebaseapp.com",
  projectId: "coldbrew-e06ee",
  storageBucket: "coldbrew-e06ee.firebasestorage.app",
  messagingSenderId: "720297248520",
  appId: "1:720297248520:web:91ebb35e1e2b4849038ebd",
  measurementId: "G-V3DQBBFYJJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export async function uploadAllData() {
  try {
    const products = await fetch('data/ProductsDetail.json').then(r => r.json());
    const heroProducts = await fetch('data/ProductForHeroSection.json').then(r => r.json());
    const orders = await fetch('data/orders.json').then(r => r.json());
    const reviews = await fetch('data/reviews.json').then(r => r.json());

    await setDoc(doc(db, "shop", "ProductsDetail"), { data: products });
    await setDoc(doc(db, "shop", "ProductForHeroSection"), { data: heroProducts });
    await setDoc(doc(db, "shop", "orders"), { data: orders });
    await setDoc(doc(db, "shop", "reviews"), { data: reviews });

    console.log("Data synced to Firestore successfully!");
    alert("Đồng bộ dữ liệu lên Firestore thành công!");
  } catch (e) {
    console.error("Error syncing data: ", e);
    alert("Có lỗi khi đồng bộ dữ liệu: " + e.message);
  }
}


export async function fetchProductsDetail() {
  try {
    const docSnap = await getDoc(doc(db, "shop", "ProductsDetail"));
    return docSnap.exists() ? docSnap.data().data : [];
  } catch (e) {
    console.error("fetchProductsDetail failed, falling back to local:", e);
    return fetch('data/ProductsDetail.json').then(r => r.json());
  }
}

export async function fetchHeroProducts() {
  try {
    const docSnap = await getDoc(doc(db, "shop", "ProductForHeroSection"));
    return docSnap.exists() ? docSnap.data().data : [];
  } catch (e) {
    console.error("fetchHeroProducts failed, falling back to local:", e);
    return fetch('data/ProductForHeroSection.json').then(r => r.json());
  }
}

export async function fetchOrders() {
  try {
    const docSnap = await getDoc(doc(db, "shop", "orders"));
    return docSnap.exists() ? docSnap.data().data : [];
  } catch (e) {
    console.error("fetchOrders failed, falling back to local:", e);
    return fetch('data/orders.json').then(r => r.json());
  }
}

export async function fetchReviews() {
  try {
    const docSnap = await getDoc(doc(db, "shop", "reviews"));
    return docSnap.exists() ? docSnap.data().data : [];
  } catch (e) {
    console.error("fetchReviews failed, falling back to local:", e);
    return fetch('data/reviews.json').then(r => r.json());
  }
}
