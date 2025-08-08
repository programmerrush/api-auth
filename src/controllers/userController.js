const User = require("../models/User");
const Company = require("../models/Company");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude password field
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, company } = req.body;
    const image = req.file ? req.file.filename : null;

    // Check if the user is an admin or the user themselves
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Prevent non-admin users from changing roles
    if (req.user.role !== "admin" && role) {
      return res.status(403).json({ message: "Only admins can change roles" });
    }

    // Validate role if provided
    const validRoles = ["admin", "manager", "supervisor", "analyst"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid user role" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, role, image, company },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude the password field

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User activated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deactivated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.managerGetUsers = async (req, res) => {
  try {
    const users = await User.find(
      { role: { $in: ["supervisor", "analyst"] } },
      "-password"
    );
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.managerGetUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne(
      { _id: userId, role: { $in: ["supervisor", "analyst"] } },
      "-password"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.managerUpdateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;
    const image = req.file ? req.file.filename : null;

    // Check if the user is a manager and not updating self or admin
    if (
      req.user.role !== "manager" ||
      req.user.id === userId ||
      req.user.role === "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, image },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude the password field

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.managerActivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is a manager and not updating self or admin
    if (
      req.user.role !== "manager" ||
      req.user.id === userId ||
      req.user.role === "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User activated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.managerDeactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is a manager and not updating self or admin
    if (
      req.user.role !== "manager" ||
      req.user.id === userId ||
      req.user.role === "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deactivated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.updateUserPicture = async (req, res) => {
  try {
    const { userId } = req.params;
    const image = req.file ? req.file.filename : null;

    // Check if the user is an admin or the user themselves
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude the password field

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
