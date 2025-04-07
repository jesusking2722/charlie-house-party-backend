const Party = require("../../models/Party");

const createParty = async (newParty) => {
  try {
    const party = new Party(newParty);
    await party.save();

    // Populate the creator field
    const populatedParty = await Party.findById(party._id).populate('creator');
    return populatedParty;
  } catch (error) {
    console.log("create party error: ", error);
  }
};

module.exports = { createParty };
