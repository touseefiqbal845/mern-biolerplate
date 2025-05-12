const express = require("express");
const passport = require("passport");
const { userController } = require("../Controllers");
const { localAuth, jwtAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", userController.createUser);
router.post("/verify", userController.verifyEmail);
router.post("/login", localAuth, userController.loginUser);
router.get("/protected-route", jwtAuth, userController.checkAuth);
router.get("/logout", userController.logout);
router.post("/reset-password-request", userController.resetPasswordRequest);
router.post("/reset-password", userController.resetPassword);

module.exports = router;
