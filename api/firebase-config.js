export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const config = {
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    }
  };

  // Check if all required variables are set
  const firebaseValues = Object.values(config.firebase);
  if (!firebaseValues.every(v => v)) {
    return res.status(500).json({ error: 'Firebase config not set in environment' });
  }

  if (!config.gemini.apiKey) {
    console.warn('Gemini API key not set in environment');
  }

  res.status(200).json(config);
}

