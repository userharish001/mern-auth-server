import express from 'express'
import { getuserData } from '../controller/userController.js'
import userAuth from '../middleware/userAuth.js'
const userroute = express.Router()

userroute.get('/getuser', userAuth, getuserData)

export default userroute;