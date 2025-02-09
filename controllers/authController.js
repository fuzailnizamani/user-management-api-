const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd) return res.status(400).json({ 'message': `Username and password are required.` });

  const foundUser = await User.findOne({ username: user }).exec();
  // Unauthorized
  if (!foundUser) return res.sendStatus(401);
  // evaluate password
  const match = await bcrypt.compare(pwd, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles);
    // create JWTs
    const accessToken = jwt.sign(
      {
        "UserInfo": {
          "username": foundUser.username,
          "roles": roles
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30s' }
    );

    const refreshToken = jwt.sign(
      { "username": foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );
    // 1. Add the refreshToken to the foundUser document
    foundUser.refreshToken = refreshToken;
    // 2.Save the updated user document to MongoDB
    const result = await foundUser.save(); // This saves the updated user object with the new refreshToken

    res.cookie('jwt', refreshToken, {
      httpOnly: true, // Prevents JavaScript access (security)
      sameSite: 'None', // Allows cross-site requests (important for frontend-backend comm.)
      secure: false, // Set this to `true` for production (HTTPS)
      maxAge: 24 * 60 * 60 * 1000 // Set cookie expiry time (1 day)
    });
    // 3. Send the accessToken back to the client
    res.json({ accessToken });
  } else {
    res.sendStatus(401);
  }
}

module.exports = { handleLogin } // file name authController.js