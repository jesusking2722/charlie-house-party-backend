require("dotenv").config();

const fetchClientToken = async () => {
  const url = process.env.KYC_GET_ACCESS_TOKEN_BASE_URL + "/auth/v2/token/";
  const clientID = process.env.KYC_CLIENT_ID;
  const clientSecret = process.env.KYC_CLIENT_SECRET;

  const encodedCredentials = Buffer.from(
    `${clientID}:${clientSecret}`
  ).toString("base64");
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await response.json();
    if (response.ok) {
      return data.access_token;
    } else {
      console.error("Error fetching client token:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
};

const createSession = async (token) => {
  const BASE_URL = process.env.KYC_SESSION_BASE_URL;
  const url = `${BASE_URL}/v1/session/`;
  if (!token) {
    console.error("Error fetching client token");
  } else {
    const body = {
      vendor_data: "your-vendor-data",
      callback: process.env.BASE_URL,
      features: "OCR + FACE",
    };
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    };

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();
      if (response.status === 201 && data) {
        return data;
      } else {
        console.error("Error creating session:", data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Network error:", error);
      throw error;
    }
  }
};

const getSessionDecision = async (sessionId) => {
  const BASE_URL = process.env.KYC_SESSION_BASE_URL;
  const endpoint = `${BASE_URL}/v1/session/${sessionId}/decision/`;
  const accessToken = await fetchClientToken();

  if (!accessToken) {
    console.error("Error fetching client token");
  } else {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        console.error("Error fetching session decision:", data.message);
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Network error:", err);
      throw err;
    }
  }
};

module.exports = {
  fetchClientToken,
  createSession,
  getSessionDecision,
};
