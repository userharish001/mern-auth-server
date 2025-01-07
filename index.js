import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv'
import connectDB from './config/db.js';
import route from './routes/authRoutes.js';
import userroute from './routes/userRoutes.js';

const app = express();
dotenv.config();
connectDB();
const allowedOrigins = ['http://localhost:5173']

app.use(express.json());
app.use(cookieParser())
app.use(cors({ origin: allowedOrigins, credentials: true }))

//endpoints
app.get('/', (req, res) => {
  res.send('hello world')
})
app.use('/api/auth', route)
app.use('/api/auth', userroute)


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`server is listen on ${PORT}`)
})