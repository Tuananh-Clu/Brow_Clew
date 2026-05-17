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

const firebaseConfig = window.FIREBASE_CONFIG;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const saveUserToLocalStorage = (payload) => {
  if (!payload) return;
  if (typeof BrewStorage !== "undefined") {
    BrewStorage.duLieu.nguoiDung = payload;
    localStorage.setItem("boldbrew", JSON.stringify(BrewStorage.duLieu));
  }
  localStorage.setItem("user", JSON.stringify(payload));
};

async function fetchUserPayload(firebaseUser) {
  let role = "user";
  try {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.role) {
        role = data.role;
      } else if (data.nguoiDung && data.nguoiDung.role) {
        role = data.nguoiDung.role;
      } else if (firebaseUser.email && firebaseUser.email.toLowerCase().includes("admin")) {
        role = "admin";
      }
    } else if (firebaseUser.email && firebaseUser.email.toLowerCase().includes("admin")) {
      role = "admin";
    }
  } catch (e) {
    console.error("Error fetching role:", e);
    if (firebaseUser.email && firebaseUser.email.toLowerCase().includes("admin")) {
      role = "admin";
    }
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
  window.location.href = payload.role === "admin" ? "admin.html" : "dashboard.html";
};

const handleGoogleLogin = () => {
  const googleLoginBtn = document.querySelector(".btn_google_login");
  if (!googleLoginBtn) return;

  googleLoginBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        await checkRoleAndRedirect(result.user);
      })
      .catch((error) => {
        console.error("Google login error:", error);
        alert("Đăng nhập Google thất bại: " + error.message);
      });
  });
};

const handleEmailSignup = () => {
  const signupBtn = document.querySelector(".btn_email_signup");
  if (!signupBtn) return;

  signupBtn.addEventListener("click", async () => {
    const email = document.querySelector('#email, #reg-email, input[name="email"]')?.value;
    const password = document.querySelector('#password, #reg-password, input[name="password"]')?.value;

    if (!email || !password) {
      alert("Vui lòng điền email và mật khẩu");
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await checkRoleAndRedirect(result.user);
    } catch (error) {
      console.error("Signup error:", error);
      alert("Đăng ký thất bại: " + error.message);
    }
  });
};

const handleEmailLogin = () => {
  const loginBtn = document.querySelector(".btn_email_login");
  if (!loginBtn) return;

  loginBtn.addEventListener("click", async () => {
    const email = document.querySelector('#email, #reg-email, input[name="email"]')?.value;
    const password = document.querySelector('#password, #reg-password, input[name="password"]')?.value;

    if (!email || !password) {
      alert("Vui lòng điền email và mật khẩu");
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await checkRoleAndRedirect(result.user);
    } catch (error) {
      console.error("Login error:", error);
      alert("Đăng nhập thất bại: " + error.message);
    }
  });
};

const logout = () => {
  signOut(auth)
    .then(() => {
      if (typeof BrewStorage !== "undefined") {
        BrewStorage.duLieu.nguoiDung = null;
        BrewStorage.luu();
      }
      localStorage.removeItem("user");
      localStorage.removeItem("boldbrew");
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("Đăng xuất thất bại");
    });
};

const getUserFromLocalStorage = () => {
  if (typeof BrewStorage !== "undefined" && BrewStorage.duLieu && BrewStorage.duLieu.nguoiDung) return BrewStorage.duLieu.nguoiDung;
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

const loggedInUser = getUserFromLocalStorage();
if (loggedInUser && document.querySelector(".btn_google_login")) {
  window.location.href = loggedInUser.role === "admin" ? "admin.html" : "dashboard.html";
}

handleGoogleLogin();
handleEmailSignup();
handleEmailLogin();

export { logout };
