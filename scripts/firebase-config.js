var FIREBASE_CONFIG = null;
fetch('/api/firebase-config')
  .then(res => res.json())
  .then(data => {
    window.ENV = { apiKey: data.gemini.apiKey };
  })
  .catch(err => {
    window.ENV = { apiKey: "AIzaSyCX7xQFuxXgnx6AApvafTjFswiLerLqdDM" };
  });
