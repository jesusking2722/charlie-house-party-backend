const express = require("express");
const router = express.Router();
const {
  uploadAvatar,
  uploadBanner,
} = require("../middlewares/uploadMiddleware");
const {
  googleLogin,
  emailRegister,
  emailLogin,
  getMe,
  updateFirstMe,
  updateMe,
  updateBannerMe,
  updateAvatarMe,
  startKycVerification,
  fetchSessionDecision,
} = require("../controller/authController");

router.post("/google-login", googleLogin);
router.post("/email-register", emailRegister);
router.post("/email-login", emailLogin);
router.get("/me/:id", getMe);
router.patch("/me/first/:id", uploadAvatar, updateFirstMe);
router.patch("/me/banner/:id", uploadBanner, updateBannerMe);
router.patch("/me/avatar/:id", uploadAvatar, updateAvatarMe);
router.patch("/me", updateMe);
router.post("/kyc/start", startKycVerification);
router.post("/kyc/decision", fetchSessionDecision);

module.exports = router;
