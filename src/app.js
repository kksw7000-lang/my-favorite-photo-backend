import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import tradeRouter from './modules/trade/trade.router.js';

import authRouter from './modules/auth/auth.router.js';
// import userRouter from './modules/user/user.router.js';
// import marketplaceRouter from './modules/marketplace/marketplace.router.js';
// import pointRouter from './modules/point/point.router.js';
// import notificationRouter from './modules/notification/notification.router.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

app.use('/market', tradeRouter);
// 라우터 등록
app.use('/auth', authRouter);
// app.use('/users', userRouter);
// app.use('/market', marketplaceRouter);
// app.use('/rewards', pointRouter);
// app.use('/notifications', notificationRouter);

app.get('/', (req, res) => {
  res.json({ message: '안녕하세요' });
});

app.use(errorMiddleware);

export default app;
