import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import aiRoutes from './src/routes/ai.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ service: 'CS Hub AI Learning API', status: 'running', port: PORT });
});

app.use('/api/ai', aiRoutes);

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`[AI Backend] Running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const fallback = PORT + 1;
      console.log(`[AI Backend] Port ${PORT} in use. Trying ${fallback}...`);
      app.listen(fallback, () => {
        console.log(`[AI Backend] Running on http://localhost:${fallback}`);
      });
    } else {
      console.error('[AI Backend] Error:', err.message);
    }
  });
});
