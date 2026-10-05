import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import createRoutes from './src/routes/index.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/', createRoutes());

app.use((err, _req, res, _next) => {
  console.error('[pentagi:error]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`[pentagi] server started at http://0.0.0.0:${port}`);
  console.log(`[pentagi] api key configured: ${Boolean(process.env.PENTAGI_API_KEY)}`);
});
