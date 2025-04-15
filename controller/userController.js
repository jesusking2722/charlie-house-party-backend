const User = require("../models/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
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
      .populate("notifications.user");

    let updatedUsers = await Promise.all(
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
        // Sort notifications for each user by createdAt in descending order
        user.notifications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
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
