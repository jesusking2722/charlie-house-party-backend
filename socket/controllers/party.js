const Party = require("../../models/Party");

const createParty = async (newParty) => {
  try {
    const party = new Party(newParty);
    await party.save();
    const populatedParty = await Party.findById(party._id)
      .populate("creator")
      .populate({
        path: "applicants",
        populate: {
          path: "applier",
        },
      });
    return populatedParty;
  } catch (error) {
    console.log("create party error: ", error);
  }
};

const addNewApplicantToSelectedParty = async (newApplicant, partyId) => {
  try {
    const party = await Party.findByIdAndUpdate(
      partyId,
      { $push: { applicants: newApplicant } },
      { new: true }
    )
      .populate("creator")
      .populate({
        path: "applicants",
        populate: {
          path: "applier",
        },
      });
    return party;
  } catch (error) {
    console.error("add new applicant to selected party error: ", error);
    return null;
  }
};

module.exports = { createParty, addNewApplicantToSelectedParty };
