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


const ROLES = { ADMIN: "admin", USER: "user" };
const PAGES = { ADMIN: "admin.html", DASHBOARD: "dashboard.html" };


const getFormInputs = () => ({
  email: document.querySelector('#email, #reg-email, input[name="email"]')?.value,
  password: document.querySelector('#password, #reg-password, input[name="password"]')?.value,
});

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

const handleGoogleLogin = () => {
  const googleLoginBtn = document.querySelector(".btn_google_login");
  if (!googleLoginBtn) return;

  googleLoginBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const userDoc = await getDoc(doc(db, "users", result.user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, "users", result.user.uid), {
            email: result.user.email,
            name: result.user.displayName || result.user.email,
            photoURL: result.user.photoURL || null,
            role: ROLES.USER,
            createdAt: new Date(),
          });
        }
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
    const { email, password } = getFormInputs();

    if (!email || !password) {
      alert("Vui lòng điền email và mật khẩu");
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", result.user.uid), {
        email,
        name: result.user.displayName || email,
        photoURL: result.user.photoURL || null,
        role: ROLES.USER,
        createdAt: new Date(),
      });

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
    const { email, password } = getFormInputs();

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
};// Sync Firebase auth state with localStorage
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
  redirectByRole(loggedInUser.role);
}

handleGoogleLogin();
handleEmailSignup();
handleEmailLogin();

export { logout };
