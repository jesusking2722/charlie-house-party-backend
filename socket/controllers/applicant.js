const Applicant = require("../../models/Applicant");

const addNewApplicant = async (newApplicant) => {
  try {
    const applicant = new Applicant(newApplicant);
    await applicant.save();
    const populatedApplicant = await Applicant.findById(applicant._id).populate(
      "applier"
    );
    return populatedApplicant;
  } catch (error) {
    console.error("Add new applicant error: ", error);
    return null;
  }
};

module.exports = { addNewApplicant };
