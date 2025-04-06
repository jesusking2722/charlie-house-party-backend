const Party = require("../../models/Party");

const createParty = async (newParty) => {
  try {
    const party = new Party(newParty);
    await party.save();
    return party;
  } catch (error) {
    console.log("create party error: ", error);
  }
};

module.exports = { createParty };
