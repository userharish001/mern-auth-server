import userModel from "../models/userModel.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
// import transporter from "../config/nodemailer.js";
import nodemailer from 'nodemailer'
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, msg: 'Missing required fields' });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRETKEY, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'Production',
      sameSite: process.env.NODE_ENV === 'Production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your App Password
      },
    });

    const receiver = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `welcome to ${name}`,
      text: `Welcome to our website, you can login with this email : ${email}`
    };

    transporter.sendMail(receiver, (error, emailResponse) => {
      if (error)
        throw error;
      console.log("success!");
      response.end();
    });
    return res.status(201).json({
      success: true,
      msg: 'user created successfully'
    })
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, msg: 'An error occurred during registration' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, msg: "email and password is missing" })
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        sucess: false,
        msg: "user is not found"
      })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.json({
        success: false,
        msg: "password is not correct"
      })
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRETKEY, { expiresIn: '7d' })
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'Production',
      sameSite: process.env.NODE_ENV === 'Production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({
      success: true,
      msg: 'user login successfully',
      user
    })
  } catch (error) {
    res.json({
      sucess: false, msg: error.msg
    })
  }
}
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'Production',
      sameSite: process.env.NODE_ENV === 'Production' ? 'none' : 'strict'
    })
    return res.json({
      success: true,
      msg: 'user logout successfully'
    })

  } catch (error) {
    res.json({
      success: false,
      msg: msg.error
    })

  }
}
export const verifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the user by ID
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found.',
      });
    }

    // Check if the account is already verified
    if (user.isAccountVerified) {
      return res.status(200).json({
        success: true,
        msg: 'Account is already verified.',
      });
    }

    // Generate a 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your App Password
      },
    });

    // Email configuration
    const receiver = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verification OTP',
      text: `OTP is sent to your email: ${user.email}. OTP is ${otp}. It is valid for only 10 minutes`,
    };

    // Send email
    await transporter.sendMail(receiver);

    // Success response
    return res.status(200).json({
      success: true,
      msg: 'OTP is sent successfully.',
    });

  } catch (error) {
    // Error response
    res.status(400).json({
      success: false,
      msg: 'Something went wrong.',
      error: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({
      success: false,
      msg: 'Missing details',
    });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: 'User not found',
      });
    }

    // Verify OTP with trimmed strings
    if (String(user.verifyOtp).trim() !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        msg: 'Wrong OTP',
      });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        msg: 'OTP is expired',
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      msg: 'Account is verified successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: 'Something went wrong in verifying email',
      error: error.message,
    });
  }
};
export const isAuthenticated = async (req,res)=>{
  try {
    return res.status(200).json({
      success:true,
      msg:'user is authenticated'
    })
    
  } catch (error) {
    res.status(500).json({
      status:false,
      msg:'error in this',
      error:error.message
    }) 
  }
}
//for reset the otp
export const otpreset = async (req,res) =>{
   const {email} = req.body;
   if(!email){
    return res.status(400).json({
      success:false,
      msg:'email is missing'
    })
   }
   try {
    const user = await userModel.findOne({email})
    if(!user){
      return res.status(400).json({
        success:false,
        msg:'user is not found'
      })
    } 
        // Generate a 6-digit OTP
        const resetotp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = resetotp;
        user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;
        await user.save();
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          secure: true,
          port: 465,
          auth: {
            user: process.env.EMAIL_USER, // Your Gmail address
            pass: process.env.EMAIL_PASS, // Your App Password
          },
        });
        // Email configuration
        const receiver = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Verification OTP',
          text: `OTP is sent to your email: ${user.email}. OTP is ${resetotp}. It is valid for only 10 minutes`,
        };
    
        // Send email
        await transporter.sendMail(receiver);
    
        // Success response
        return res.status(200).json({
          success: true,
          msg: 'reset otp is sent successfully.',
        });
   } catch (error) {
     res.status(400).json({
      success:false,
      msg:'something wrong',
      error:error.message
    })
   }
}
//for reset password
export const resetpassword = async (req,res)=>{
  const {email,otp,newPassword} = req.body;
  if(!email||!otp||!newPassword){
    return res.status(400).json({
      success: false,
      msg: 'enterd data is missing',
    });
  }
  try {
    const user = await userModel.findOne({email})
    if(!user){
      return res.status(400).json({
        success:false,
        msg:'user is not found'
      })
    } 
    // if (String(user.resetOtp).trim() !== String(otp).trim()) {
    //   return res.status(400).json({
    //     success: false,
    //     msg: 'Wrong OTP',
    //   });
    // }
    // if (user.resetOtpExpireAt < Date.now()) {
    //   return res.status(400).json({
    //     success: false,
    //     msg: 'OTP is expired',
    //   });
    // }
    const hashedPassword = await bcrypt.hash(newPassword,10);
    user.password = hashedPassword;
    user.resetOtp = " ";
    user.resetOtpExpireAt = 0;
    await user.save()
    return res.status(200).json({
      success:true,
      msg:'reset password successfully'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error:error.message,
    });
  }

}