import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
  try {
    // Extract token from cookies
    const token = req.cookies.token;

    // Check if the token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        msg: 'No token provided. Please log in again.',
      });
    }

    // Verify the token
    const decodeToken = jwt.verify(token, process.env.JWT_SECRETKEY);

    // Check if decoded token has a valid ID
    if (!decodeToken.id) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid token. Please log in again.',
      });
    }

    // Attach the user ID to the request object
    req.body.userId = decodeToken.id;

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

export default userAuth;
