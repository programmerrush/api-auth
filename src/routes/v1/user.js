const express = require("express");
const {
  getProfile,
  getAllUsers,
  updateUser,
  getUserById,
  deleteUser,
  activateUser,
  deactivateUser,
  managerGetUsers,
  managerGetUserById,
  managerUpdateUser,
  managerActivateUser,
  managerDeactivateUser,
  updateUserPicture,
} = require("../../controllers/userController");
const authenticateToken = require("../../middlewares/auth");
const checkAdmin = require("../../middlewares/checkAdmin");
const checkManager = require("../../middlewares/checkManager");
const upload = require("../../middlewares/upload");
const router = express.Router();

// Admin routes

router.get("/profile", authenticateToken, getProfile);

router.get("/getAllUsers", authenticateToken, checkAdmin, getAllUsers);

router.put(
  "/updateUser/:userId",
  authenticateToken,
  upload.single("image"),
  updateUser
);

router.put(
  "/updateUserPicture/:userId",
  authenticateToken,
  upload.single("image"),
  updateUserPicture
);

router.get("/getUserById/:userId", authenticateToken, checkAdmin, getUserById);

router.delete("/deleteUser/:userId", authenticateToken, checkAdmin, deleteUser);

router.put(
  "/activateUser/:userId",
  authenticateToken,
  checkAdmin,
  activateUser
);

router.put(
  "/deactivateUser/:userId",
  authenticateToken,
  checkAdmin,
  deactivateUser
);

// Manager routes
router.get(
  "/manager/getUsers",
  authenticateToken,
  checkManager,
  managerGetUsers
);

router.get(
  "/manager/getUserById/:userId",
  authenticateToken,
  checkManager,
  managerGetUserById
);

router.put(
  "/manager/updateUser/:userId",
  authenticateToken,
  checkManager,
  upload.single("image"),
  managerUpdateUser
);

router.put(
  "/manager/activateUser/:userId",
  authenticateToken,
  checkManager,
  managerActivateUser
);

router.put(
  "/manager/deactivateUser/:userId",
  authenticateToken,
  checkManager,
  managerDeactivateUser
);

module.exports = router;
