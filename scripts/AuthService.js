import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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

const googleLoginBtn = document.querySelector(".btn_google_login");




googleLoginBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;

      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.log(error);
      alert("Đăng nhập thất bại");
    });
});

const getUserFromLocalStorage = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

if (getUserFromLocalStorage()) {
  window.location.href = "dashboard.html";
}





