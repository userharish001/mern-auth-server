import express from 'express'
import { isAuthenticated, login, logout, otpreset, register, resetpassword, verifyEmail, verifyOtp } from '../controller/authController.js';
import userAuth from '../middleware/userAuth.js';
const route = express.Router();

route.post('/register',register);
route.post('/login',login);
route.post('/logout',logout);
route.post('/verifyotp',userAuth,verifyOtp)
route.post('/verifyemail',userAuth,verifyEmail)
route.get('/authenticated',userAuth,isAuthenticated)
route.post('/resetotp',otpreset)
route.post('/resetpassword',resetpassword)

export default route;