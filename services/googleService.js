const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.FRONT_BASE_URL
);

const verifyGoogleCode = async (code) => {
  const { tokens } = await client.getToken({
    code,
    redirect_uri: process.env.GOOGLE_REDIRECT_URL,
  });

  // 2. Verify the ID token
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
};

module.exports = { verifyGoogleCode };
