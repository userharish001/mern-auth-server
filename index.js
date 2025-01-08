import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import route from './routes/authRoutes.js';
import userroute from './routes/userRoutes.js';

const app = express();
dotenv.config();
connectDB();


const allowedOrigins = ['https://mern-auth-server-xifg.onrender.com'];

app.use(express.json());

app.use(cookieParser());

app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Endpoints
app.get('/', (req, res) => {
  res.send('hello world');
});
app.use('/api/auth', route);
app.use('/api/auth', userroute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
