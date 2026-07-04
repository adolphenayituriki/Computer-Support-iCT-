import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './src/config/db.js';
import swaggerSpec from './src/config/swagger.js';
import apiRoutes from './src/routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none } .swagger-ui .info .title { color: #FFCE08 } .swagger-ui .info { margin: 20px 0 }',
  customSiteTitle: 'CS hub (iCT) API Docs',
}));

app.use('/api', apiRoutes);

app.get('*', (_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const fallback = PORT + 1;
      console.log(`Port ${PORT} is in use. Trying ${fallback}...`);
      app.listen(fallback, () => {
        console.log(`Server running on http://localhost:${fallback}`);
      });
    } else {
      console.error('Server error:', err.message);
    }
  });
});
