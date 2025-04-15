const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { verifyGoogleCode } = require("../services/googleService");
const { fetchClientToken, createSession } = require("../helper/kyc");
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
    const { email, password } = req.body.user;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ ok: false, message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ ok: false, message: "Wrong password" });
    }
    console.log(user._id);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
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
    const user = await User.findById(id)
      .populate("reviews.reviewer")
      .populate("reviews.party")
      .populate("reviews.party.creator")
      .populate("notifications.party")
      .populate("notifications.party.creator")
      // .populate("notifications.sticker")
      // .populate("notifications.applicant")
      .populate("notifications.user");

    user.notifications = await Promise.all(
      user.notifications.map(async (notification) => {
        if (notification.party && notification.party.creator) {
          const creator = await User.findById(
            notification.party.creator.toString()
          );
          notification.party.creator = creator;
        }
        return notification;
      })
    );

    if (!user) {
      return res.json({ ok: false, message: "User not found" });
    }

    res.json({ ok: true, data: { user } });
  } catch (error) {
    console.log("get me error: ", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

// Update //////////////////////////////////////////////////////////////////////////////

const updateFirstMe = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shortname } = req.body;
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    let user = await User.findById(id)
      .populate("reviews.reviewer")
      .populate("reviews.party")
      .populate("reviews.party.creator")
      .populate("notifications.party")
      .populate("notifications.party.creator")
      // .populate("notifications.sticker")
      // .populate("notifications.applicant")
      .populate("notifications.user");
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, "..", user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
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
    console.log(id);
    const bannerUrl = req.file ? `/uploads/banners/${req.file.filename}` : null;
    let user = await User.findById(id)
      .populate("reviews.reviewer")
      .populate("reviews.party")
      .populate("reviews.party.creator")
      .populate("notifications.party")
      .populate("notifications.party.creator")
      // .populate("notifications.sticker")
      // .populate("notifications.applicant")
      .populate("notifications.user");
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

const updateAvatarMe = async (req, res) => {
  try {
    const { id } = req.params;
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;
    let user = await User.findById(id)
      .populate("reviews.reviewer")
      .populate("reviews.party")
      .populate("reviews.party.creator")
      .populate("notifications.party")
      .populate("notifications.party.creator")
      // .populate("notifications.sticker")
      // .populate("notifications.applicant")
      .populate("notifications.user");
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, "..", user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }
    user.avatar = avatarUrl;
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
    let updatingUser = await User.findById(user._id)
      .populate("reviews.reviewer")
      .populate("reviews.party")
      .populate("reviews.party.creator")
      .populate("notifications.party")
      .populate("notifications.party.creator")
      // .populate("notifications.sticker")
      // .populate("notifications.applicant")
      .populate("notifications.user");
    if (!updatingUser) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    if (user.notifications) {
      updatingUser.notifications = user.notifications;
    }
    updatingUser.set(user);
    await updatingUser.save();
    res.json({ ok: true, data: { user: updatingUser } });
  } catch (error) {
    console.log("update first me error: ", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

////////////////////////////////////////////////////////////////////////////////////

// KYC verification field

const startKycVerification = async (req, res) => {
  try {
    const accessToken = await fetchClientToken();
    const userId = req.user.id;
    console.log("userId", userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ message: "User not found" });
    }
    if (user.kyc.sessionId) {
      return res.json({
        data: user.kyc,
        success: true,
        message: "User's session is existing",
      });
    }
    const session = await createSession(accessToken);
    if (!session) {
      return res.json({ message: "Verification is failed" });
    }
    const {
      session_id,
      session_number,
      session_token,
      vendor_data,
      status,
      url,
    } = session;

    const data = {
      sessionId: session_id,
      sessionNumber: session_number,
      sessionToken: session_token,
      vendorData: vendor_data,
      status,
      url,
    };
    user.kyc = data;
    await user.save();
    res.json({ data: { user }, ok: true, message: "Verification is started" });
  } catch (error) {
    console.log("start kyc verification error: ", error);
  }
};

const fetchSessionDecision = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await getSessionDecision(sessionId);
    if (!session) {
      return res.json({ message: "Invalid session" });
    }
    const { session_id, session_number, session_token, status } = session;
    const data = {
      sessionId: session_id,
      sessionNumber: session_number,
      sessionToken: session_token,
      status,
    };
    res.json({
      data,
      message: "Fetched session successfully",
      ok: true,
    });
  } catch (error) {
    console.log("fetch session decision error: ", error);
  }
};

//////////////////////////////////////////////////////////////////////////////////////

module.exports = {
  googleLogin,
  emailRegister,
  emailVerification,
  emailLogin,
  getMe,
  updateFirstMe,
  updateMe,
  updateBannerMe,
  updateAvatarMe,
  startKycVerification,
  fetchSessionDecision,
};
