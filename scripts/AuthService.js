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

const firebaseConfig = {
  apiKey: "AIzaSyAiPRFB87Pm_rIqXDPbXfH93NZNLWK6BIM",
  authDomain: "coldbrew-e06ee.firebaseapp.com",
  projectId: "coldbrew-e06ee",
  storageBucket: "coldbrew-e06ee.firebasestorage.app",
  messagingSenderId: "720297248520",
  appId: "1:720297248520:web:91ebb35e1e2b4849038ebd",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const getUserFromLocalStorage = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const saveUserToLocalStorage = (user) => {
  if (user) {
    const userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email,
      photoURL: user.photoURL,
    };
    localStorage.setItem("user", JSON.stringify(userData));
  }
};

const handleGoogleLogin = () => {
  const googleLoginBtn = document.querySelector(".btn_google_login");
  if (!googleLoginBtn) return;

  googleLoginBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        saveUserToLocalStorage(user);
        window.location.href = "dashboard.html";
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
    const email = document.querySelector('input[name="email"]')?.value;
    const password = document.querySelector('input[name="password"]')?.value;

    if (!email || !password) {
      alert("Vui lòng điền email và mật khẩu");
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      saveUserToLocalStorage(result.user);
      window.location.href = "dashboard.html";
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
    const email = document.querySelector('input[name="email"]')?.value;
    const password = document.querySelector('input[name="password"]')?.value;

    if (!email || !password) {
      alert("Vui lòng điền email và mật khẩu");
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      saveUserToLocalStorage(result.user);
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Login error:", error);
      alert("Đăng nhập thất bại: " + error.message);
    }
  });
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

onAuthStateChanged(auth, (firebaseUser) => {
  const storedUser = getUserFromLocalStorage();
  if (!firebaseUser && !storedUser) return;
  if (firebaseUser && !storedUser) saveUserToLocalStorage(firebaseUser);
});

if (getUserFromLocalStorage() && !document.querySelector(".btn_google_login")) {
  window.location.href = "dashboard.html";
}

handleGoogleLogin();
handleEmailSignup();
handleEmailLogin();

export { logout };
