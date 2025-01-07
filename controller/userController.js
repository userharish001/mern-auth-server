import userModel from "../models/userModel.js";

export const getuserData = async (req,res)=>{
  try {
    const {userId} = req.body;
    const user = await userModel.findById(userId)
    if(!user){
      return res.status(400).json({
        success:false,
        msg:'user is not found'
      })
    }    
    res.status(200).json({
      success:true,
      userData:{
        name:user.name,
        isAccountVerfied:user.isAccountVerfied
      }
    })
  } catch (error) {
    
  }
}