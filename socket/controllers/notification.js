const User = require("../../models/User");

const addNewPartyOpenedNotification = async (newNotification, myId) => {
  try {
    const users = await User.find({ _id: { $ne: myId } });
    const updatePromises = users.map((user) => {
      return User.updateOne(
        { _id: user._id },
        { $push: { notifications: newNotification } },
        { new: true }
      );
    });

    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.log("add new notification error: ", error);
  }
};

const addNewAppliedNotification = async (newNotification, creatorId) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      creatorId,
      {
        $push: { notifications: newNotification },
      },
      { new: true }
    );
    return updatedUser.notifications[updatedUser.notifications.length - 1];
  } catch (error) {
    console.error("add new applicant notification error: ", error);
    return null;
  }
};

module.exports = { addNewPartyOpenedNotification, addNewAppliedNotification };
