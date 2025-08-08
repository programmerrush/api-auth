const { body } = require("express-validator");
const validateRequest = require("../../middlewares/validate");
const authenticateToken = require("../../middlewares/auth");

const express = require("express");
const {
  register,
  login,
  refreshToken,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require("../../controllers/authController");
const router = express.Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  // [
  //   body("email").isEmail().withMessage("Invalid email"),
  //   body("password").notEmpty().withMessage("Password is required"),
  //   body("tokan").notEmpty().withMessage("Tokan is required"),
  // ],
  validateRequest,
  login
);

router.post(
  "/refresh-token",
  [body("token").notEmpty().withMessage("Refresh token is required")],
  validateRequest,
  refreshToken
);

// Update password route
router.put("/up", authenticateToken, updatePassword);

// Forgot password route
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Invalid email")],
  validateRequest,
  forgotPassword
);

// Reset password route
router.post(
  "/reset-password",
  // [
  //   body("resetToken").notEmpty().withMessage("Reset token is required"),
  //   body("newPassword")
  //     .isLength({ min: 6 })
  //     .withMessage("Password must be at least 6 characters"),
  // ],
  validateRequest,
  resetPassword
);

module.exports = router;
