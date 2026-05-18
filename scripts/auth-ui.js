import { 
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
  checkRoleAndRedirect,
  getUserFromLocalStorage
} from "./services/AuthService.js";


const getFormInputs = () => ({
  email: document.querySelector('#email, #reg-email, input[name="email"]')?.value,
  password: document.querySelector('#password, #reg-password, input[name="password"]')?.value,
});

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


handleGoogleLogin();
handleEmailSignup();
handleEmailLogin();

const loggedInUser = getUserFromLocalStorage();
if (loggedInUser && (document.querySelector(".btn_google_login") || document.querySelector(".btn_email_signup"))) {
  redirectByRole(loggedInUser.role);
}


window.handleEmailSignup = true;
