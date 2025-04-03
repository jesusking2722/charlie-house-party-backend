const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { verifyGoogleCode } = require("../services/googleService");
require("dotenv").config();

const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;

    const payload = await verifyGoogleCode(code);
    if (!payload) {
      return res.status(400).json({
        ok: false,
        message: "User not found in Google authentication",
      });
    }

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
        token: `Bearer ${token}`,
        user,
      },
    });
  } catch (error) {
    console.error("Google login error: ", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

const emailRegister = async (req, res) => {
  try {
    const { email, password } = req.body.user;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ ok: false, message: "Already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    res.json({ ok: true, data: { user: newUser, token: `Bearer ${token}` } });
  } catch (error) {
    console.error("Email register error: ", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

const emailLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ ok: false, message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ ok: false, message: "Wrong password" });
    }
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    res.json({ ok: true, data: { token: `Bearer ${token}`, user } });
  } catch (error) {
    console.log("email login error: ", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

const emailVerification = async (req, res) => {
  try {
    const { code } = req.body;
  } catch (error) {
    console.error("Email verification error: ", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.json({ ok: false, message: "User not found" });
    }
    res.json({ ok: true, data: { user } });
  } catch (error) {
    console.log("get me error: ", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

const updateFirstMe = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shortname } = req.body;
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    user.name = name;
    user.shortname = shortname;
    user.avatar = avatarUrl;

    await user.save();

    res.json({ ok: true, data: { user } });
  } catch (error) {
    console.log("update first me error: ", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

const updateBannerMe = async (req, res) => {
  try {
    const { id } = req.params;
    const bannerUrl = req.file ? `/uploads/banners/${req.file.filename}` : null;
    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    if (user.banner) {
      const oldBannerPath = path.join(__dirname, "..", user.banner);
      if (fs.existsSync(oldBannerPath)) {
        fs.unlinkSync(oldBannerPath);
      }
    }
    user.banner = bannerUrl;
    await user.save();
    res.json({ ok: true, data: { user } });
  } catch (error) {
    console.log("update first me error: ", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

const updateMe = async (req, res) => {
  try {
    const { user } = req.body;
    let updatingUser = await User.findById(user._id);
    if (!updatingUser) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    updatingUser.set(user);
    await updatingUser.save();
    res.json({ ok: true, data: { user: updatingUser } });
  } catch (error) {
    console.log("update first me error: ", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

module.exports = {
  googleLogin,
  emailRegister,
  emailVerification,
  emailLogin,
  getMe,
  updateFirstMe,
  updateMe,
  updateBannerMe,
};
