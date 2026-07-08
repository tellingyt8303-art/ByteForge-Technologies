// ════════════════════════════════════════════════════════════
//  auth.js — signup.html aur login.html dono use karte hain
// ════════════════════════════════════════════════════════════
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const googleProvider = new GoogleAuthProvider();

function showError(el, msg) {
  el.textContent = msg;
  el.classList.add("show");
}
function clearError(el) {
  el.classList.remove("show");
  el.textContent = "";
}
function friendlyError(code) {
  const map = {
    "auth/email-already-in-use": "Ye email pehle se registered hai. Login try karo.",
    "auth/invalid-email": "Email sahi format mein daalo.",
    "auth/weak-password": "Password kam se kam 6 characters ka hona chahiye.",
    "auth/user-not-found": "Ye email registered nahi hai.",
    "auth/wrong-password": "Password galat hai.",
    "auth/invalid-credential": "Email ya password galat hai.",
    "auth/too-many-requests": "Bahut zyada attempts. Thodi der baad try karo."
  };
  return map[code] || "Kuch galat ho gaya. Dobara try karo.";
}

// ── Signup ───────────────────────────────────────────────────
export function initSignup() {
  const form = document.getElementById("signupForm");
  const errEl = document.getElementById("formError");
  const btn = document.getElementById("signupBtn");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError(errEl);
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;

    btn.disabled = true;
    btn.textContent = "creating account...";
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        name, email, phone,
        role: "user",
        created_at: serverTimestamp()
      });
      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
      showError(errEl, friendlyError(err.code));
      btn.disabled = false;
      btn.textContent = "Create Account";
    }
  });

  const googleBtn = document.getElementById("googleBtn");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        await setDoc(doc(db, "users", cred.user.uid), {
          name: cred.user.displayName || "",
          email: cred.user.email,
          phone: "",
          role: "user",
          created_at: serverTimestamp()
        }, { merge: true });
        window.location.href = "index.html";
      } catch (err) {
        console.error(err);
        showError(errEl, friendlyError(err.code));
      }
    });
  }
}

// ── Login ────────────────────────────────────────────────────
export function initLogin() {
  const form = document.getElementById("loginForm");
  const errEl = document.getElementById("formError");
  const btn = document.getElementById("loginBtn");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError(errEl);
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    btn.disabled = true;
    btn.textContent = "logging in...";
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
      showError(errEl, friendlyError(err.code));
      btn.disabled = false;
      btn.textContent = "Log In";
    }
  });

  const googleBtn = document.getElementById("googleBtn");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        window.location.href = "index.html";
      } catch (err) {
        console.error(err);
        showError(errEl, friendlyError(err.code));
      }
    });
  }
}
