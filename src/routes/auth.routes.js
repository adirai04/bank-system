const express = require("express")
const authController = require("../controllers/auth.controller")

const router = express.Router()

/**
 * - POST /api/auth/register
 * - Create a new user
 */
router.post("/register", authController.userRegisterController)

/**
 * - POST /api/auth/login
 * - Login the existing user
 */
router.post("/login", authController.userLoginController)

/**
 * - POST /api/auth/logout
 * - Logout the existing user
 */
router.post("/logout", authController.userLogoutController)

module.exports = router