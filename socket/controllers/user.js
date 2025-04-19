const User = require("../../models/User");

const updateMyStatus = async (userId, status) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $set: { status: status },
    });
  } catch (error) {
    console.error("update my status error: ", error);
  }
};

const updateMyContact = async (contacterId, userId) => {
  try {
    const contacter = await User.findById(contacterId);
    if (!contacter) return null;

    const user = await User.findById(userId);
    const alreadyAdded = user.contacts.some(
      (contact) => contact._id.toString() === contacterId.toString()
    );

    if (alreadyAdded) return true;

    user.contacts.push(contacterId);
    await user.save();

    const populatedUser = await User.findById(userId)
      .populate("reviews.reviewer")
      .populate("reviews.party")
      .populate("reviews.party.creator")
      .populate("notifications.party")
      .populate("notifications.party.creator")
      .populate({
        path: "notifications.applicant",
        populate: {
          path: "applier",
        },
      })
      // .populate("notifications.sticker")
      .populate("notifications.user")
      .populate("contacts");

    return populatedUser;
  } catch (error) {
    console.error("update socket me error: ", error);
    return null;
  }
};

const updateReceiverContact = async (receiverId, senderId) => {
  try {
    const sender = await User.findById(senderId);
    if (!sender) return null;

    const receiver = await User.findById(receiverId);
    const alreadyAdded = receiver.contacts.some(
      (contact) => contact._id.toString() === senderId.toString()
    );

    if (alreadyAdded) return true;

    receiver.contacts.push(senderId);
    await receiver.save();

    const populatedReceiver = await User.findById(receiverId)
      .populate("reviews.reviewer")
      .populate("reviews.party")
      .populate("reviews.party.creator")
      .populate("notifications.party")
      .populate("notifications.party.creator")
      .populate({
        path: "notifications.applicant",
        populate: {
          path: "applier",
        },
      })
      // .populate("notifications.sticker")
      .populate("notifications.user")
      .populate("contacts");

    return populatedReceiver;
  } catch (error) {
    console.error("update receiver contact error: ", error);
    return null;
  }
};

module.exports = { updateMyStatus, updateMyContact, updateReceiverContact };
