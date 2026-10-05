import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import createRoutes from './src/routes/index.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/', createRoutes());

app.listen(port, () => {
  console.log(`[pentagi] server started on http://0.0.0.0:${port}`);
});
