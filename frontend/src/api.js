const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://computer-support-ict.onrender.com' : 'http://localhost:3001');
export default API_BASE;

const AI_API_BASE = import.meta.env.VITE_AI_API_URL || (import.meta.env.PROD ? 'https://computer-support-ai.onrender.com' : 'http://localhost:3002');
export { AI_API_BASE };
