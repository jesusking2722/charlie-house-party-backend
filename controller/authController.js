const { verifyGoogleCode } = require("../services/googleService");

const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    console.log(code);
    const payload = await verifyGoogleCode(code);
    if (!payload) {
      return res.json({
        ok: false,
        message: "User not found in Google authentication",
      });
    }
    console.log(payload);
    const { email, email_verified, sub, family_name, given_name } = payload;
    const hashedPassword = await bcrypt.hash(sub, 10);
    const e_verified = email_verified ? "yes" : "no";
  } catch (error) {
    console.log("google login error: ", error);
    res.json({ ok: false, message: "Server error" });
  }
};

module.exports = { googleLogin };
