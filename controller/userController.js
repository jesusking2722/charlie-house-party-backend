const User = require("../models/User");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json({ok: true, data: {users}});
    } catch (error) {
        console.log("get all users error: ", error);
    }
}

module.exports = {getAllUsers};