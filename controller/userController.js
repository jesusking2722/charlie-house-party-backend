const User = require("../models/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("reviews.reviewer")
      .populate("reviews.party")
      .populate("reviews.party.creator")
      .populate("notifications.party")
      .populate("notifications.party.creator")
      .populate("notifications.user");

    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        user.notifications = await Promise.all(
          user.notifications.map(async (notification) => {
            if (notification.creator) {
              const creator = await User.findById(notification.creator);
              notification.creator = creator;
            }
            return notification;
          })
        );
        return user;
      })
    );

    res.json({ ok: true, data: { users: updatedUsers } });
  } catch (error) {
    console.log("get all users error: ", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

module.exports = { getAllUsers };
