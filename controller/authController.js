const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyGoogleCode } = require("../services/googleService");

const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    console.log("Received Google auth code:", code);

    const payload = await verifyGoogleCode(code);
    if (!payload) {
      return res.status(400).json({
        ok: false,
        message: "User not found in Google authentication",
      });
    }

    console.log("Google Payload:", payload);
    const { email, email_verified, sub, family_name, given_name } = payload;
    const hashedPassword = await bcrypt.hash(sub, 10);
    const e_verified = email_verified ? true : false;

    let user = await User.findOne({ email });

    if (user) {
      // Update existing user's info
      user.name = `${given_name} ${family_name}`;
      user.emailVerified = e_verified;
      user.password = hashedPassword;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name: `${given_name} ${family_name}`,
        email,
        password: hashedPassword,
        emailVerified: e_verified,
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.json({
      ok: true,
      message: "Authenticated successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    console.error("Google login error: ", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

module.exports = { googleLogin };
