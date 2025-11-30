// auth.js

let signingIn = false;

function signInWithGoogle() {
  if (signingIn) return;
  signingIn = true;

  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => {
    console.error("Sign-in error:", err);
    alert("Gagal log masuk. Sila cuba lagi.");
  }).finally(() => {
    signingIn = false;
  });
}

function signOut() {
  auth.signOut().catch(err => {
    console.error("Sign-out error:", err);
    alert("Gagal log keluar. Sila cuba lagi.");
  });
}

auth.onAuthStateChanged(user => {
  setUser(user);

  if (user) {
    setView("subjects");
  } else {
    setView("login");
    setCurrentSubject(null);
    setCurrentVersion(null);
    setCurrentTopic(null);
    resetSubtopicPath(); // ✅ ganti setCurrentLevel
  }

  renderApp();
});
