// auth.js

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => {
    console.error("Sign-in error:", err);
    alert("Gagal log masuk. Sila cuba lagi.");
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
    setCurrentLevel(0);
  }

  renderApp();
});
