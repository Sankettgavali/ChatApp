const config = {
  // In development, use localhost
  // In production, use environment variable or fallback to deployed backend
  serverUrl: process.env.NODE_ENV === 'production' 
    ? (process.env.REACT_APP_API_URL || 'https://chatapp1-vq5f.onrender.com')
    : 'http://localhost:5000'
};

export default config; 