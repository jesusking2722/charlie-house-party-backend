const User = require("../../models/User");

const addNewPartyOpenedNotification = async (newNotification, myId) => {
  try {
    const users = await User.find({ _id: { $ne: myId } });

    const updatePromises = users.map((user) => {
      return User.updateOne(
        { _id: user._id },
        { $push: { notifications: newNotification } }
      );
    });

    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.log("add new notification error: ", error);
  }
};

module.exports = { addNewPartyOpenedNotification };
