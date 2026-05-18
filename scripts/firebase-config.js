var FIREBASE_CONFIG = null;
fetch('/api/firebase-config')
  .then(res => res.json())
  .then(data => {
    window.FIREBASE_CONFIG = data.firebase;
    window.ENV = { apiKey: data.gemini.apiKey };
  })
  .catch(err => {
    console.error('Failed to load config:', err);
    window.FIREBASE_CONFIG = {
      apiKey: "AIzaSyAiPRFB87Pm_rIqXDPbXfH93NZNLWK6BIM",
      authDomain: "coldbrew-e06ee.firebaseapp.com",
      projectId: "coldbrew-e06ee",
      storageBucket: "coldbrew-e06ee.firebasestorage.app",
      messagingSenderId: "720297248520",
      appId: "1:720297248520:web:91ebb35e1e2b4849038ebd",
    };
    window.ENV = { apiKey: "AIzaSyCX7xQFuxXgnx6AApvafTjFswiLerLqdDM" };
  });
