import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const ROLES = { ADMIN: "admin", USER: "user" };
const PAGES = { ADMIN: "admin.html", DASHBOARD: "dashboard.html" };

const redirectByRole = (role) => {
  window.location.href = role === ROLES.ADMIN ? PAGES.ADMIN : PAGES.DASHBOARD;
};

const saveUserToLocalStorage = (payload) => {
  if (!payload) return;
  localStorage.setItem("user", JSON.stringify(payload));
};

async function fetchUserPayload(firebaseUser) {
  let role = ROLES.USER;

  try {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.role) {
        role = data.role;
      } else if (data.nguoiDung && data.nguoiDung.role) {
        role = data.nguoiDung.role;
      }
    }
  } catch (e) {
    console.error("Error fetching role:", e);
  }

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName || firebaseUser.email,
    photoURL: firebaseUser.photoURL,
    role: role,
  };
}

const checkRoleAndRedirect = async (firebaseUser) => {
  const payload = await fetchUserPayload(firebaseUser);
  saveUserToLocalStorage(payload);
  redirectByRole(payload.role);
};

const logout = () => {
  signOut(auth)
    .then(() => {
      localStorage.removeItem("user");
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("Đăng xuất thất bại");
    });
};

const getUserFromLocalStorage = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

onAuthStateChanged(auth, async (firebaseUser) => {
  const storedUser = getUserFromLocalStorage();
  if (!firebaseUser && !storedUser) return;
  if (firebaseUser && !storedUser) {
    const payload = await fetchUserPayload(firebaseUser);
    saveUserToLocalStorage(payload);
  }
});


export {
  auth,
  db,
  provider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setDoc,
  getDoc,
  doc,
  ROLES,
  PAGES,
  redirectByRole,
  saveUserToLocalStorage,
  fetchUserPayload,
  checkRoleAndRedirect,
  logout,
  getUserFromLocalStorage
};
