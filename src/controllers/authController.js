const User = require("../models/User");
const Company = require("../models/Company");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../services/jwtService");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid"); // Import UUID library
const { sendResetEmail } = require("../services/emailService");

const MAX_SESSIONS = 1; // Set the maximum number of allowed sessions

exports.register = async (req, res) => {
  try {
    // console.log(req.body);
    const { name, mobile, email, password, role, companyId } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingUser2 = await User.findOne({ mobile });
    if (existingUser2) {
      return res.status(400).json({ message: "Mobile already in use" });
    }

    // const company = await Company.findById(companyId);
    // if (!company) {
    //   return res.status(400).json({ message: "Invalid company ID" });
    // }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate role
    const validRoles = ["admin", "manager", "supervisor", "analyst"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid user role" });
    }

    const image = req.file ? req.file.filename : null;

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      company: companyId,
      // company: role !== "admin" ? companyId : undefined,
      image,
      mobile,
    });
    res
      .status(201)
      .json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .select("+password")
      .populate("company");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive || (user.company && !user.company.isActive)) {
      return res.status(403).json({
        message:
          "Account is deactivated. Please contact admin to activate your account.",
      });
    }

    // Generate new session ID
    const newSessionId = uuidv4();

    await user.save();

    const accessToken = generateAccessToken({
      userId: user._id,
      session: newSessionId,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id,
      session: newSessionId,
      email: user.email,
      role: user.role,
    });

    const userData = {
      image: user.image,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      userData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    // .populate("company");
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (!user.isActive || (user.company && !user.company.isActive)) {
      return res.status(403).json({
        message:
          "Account is deactivated. Please contact admin to activate your account.",
      });
    }

    const accessToken = generateAccessToken({
      userId: user._id,
      session: decoded.session,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id,
      session: decoded.session,
      email: user.email,
      role: user.role,
    });

    const userData = {
      image: user.image,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({ accessToken, refreshToken, userData });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // Validate input
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Fetch user by ID
    const user = await User.findById(userId);
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure the user has a password stored in the database
    if (!user.password) {
      return res.status(500).json({ message: "User has no password set." });
    }

    // Check if the old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // For security, do not reveal if the email exists
      return res.status(200).json({
        message: "If the email exists, a reset link/code will be sent.",
      });
    }
    // Generate a secure token
    const resetToken = require("crypto").randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour expiry
    // Generate a 4-digit numeric code
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    const resetCodeExpiry = Date.now() + 1000 * 60 * 10; // 10 min expiry
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    user.resetPasswordCode = resetCode;
    user.resetPasswordCodeExpires = resetCodeExpiry;
    await user.save();
    // Send email with code and token
    await sendResetEmail(user.email, resetCode, resetToken);
    console.log("Forgot user:", user); // Debug log to verify token/code is saved
    return res.status(200).json({
      message: "If the email exists, a reset link/code will be sent.",
      resetToken, // TEMP: Only for development/testing, remove in production!
      resetCode, // TEMP: Only for development/testing, remove in production!
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { resetToken, resetCode, newPassword } = req.body;
  if ((!resetToken && !resetCode) || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token or code and new password are required." });
  }
  try {
    // Find user by either token or code (and check expiry)
    let user = null;
    if (resetToken) {
      user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: Date.now() },
      });
    } else if (resetCode) {
      user = await User.findOne({
        resetPasswordCode: resetCode,
        resetPasswordCodeExpires: { $gt: Date.now() },
      });
    }
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token/code." });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;
    await user.save();
    return res
      .status(200)
      .json({ message: "Password has been reset successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};
