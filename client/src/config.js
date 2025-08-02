const config = {
  // In development, use localhost
  // In production, use the same domain (since we're serving from the same server)
  serverUrl: process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:5000'
};

export default config; 