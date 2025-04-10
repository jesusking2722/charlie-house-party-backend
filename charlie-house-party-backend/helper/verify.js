const crypto = require("crypto");

let otpStore = {};

const storeOTP = (key, otp) => {
  otpStore[key] = otp;
  setTimeout(() => {
    delete otpStore[key];
  }, 5 * 60 * 1000);
};

const verifyOTP = (key, userOTP) => {
  return otpStore[key] === userOTP;
};

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Ensure Redis disconnects on shutdown to prevent errors
process.on("exit", () => client.quit());

module.exports = { generateOTP, storeOTP, verifyOTP };
