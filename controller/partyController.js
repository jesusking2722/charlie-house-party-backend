const Party = require("../models/Party");

const getAllParties = async (req, res) => {
  try {
    const parties = await Party.find()
      .populate("creator")
      .populate({
        path: "applicants",
        populate: {
          path: "applier",
        },
      });
    res.json({ ok: true, data: { parties } });
  } catch (error) {
    console.log("get all parties error: ", error);
    return res
      .status(500)
      .json({ ok: false, message: "Internal server error" });
  }
};

module.exports = { getAllParties };
