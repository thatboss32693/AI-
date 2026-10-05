import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import createRoutes from './src/routes/index.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);

app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

app.use('/', createRoutes());

app.use((err, _req, res, _next) => {
  console.error('[pentagi:error]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`\n[pentagi] 🛡️  Server started at http://0.0.0.0:${port}`);
  console.log(`[pentagi] Dashboard: http://localhost:${port}/dashboard`);
  console.log(`[pentagi] API Key configured: ${Boolean(process.env.PENTAGI_API_KEY)}\n`);
});
