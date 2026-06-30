const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const accountController = require("../controllers/account.controller")

const router = express.Router()

/** 
 * - POST /api/accounts/ 
 * - protected route
 * - Create a new account
 */
router.post("/", authMiddleware.authMiddleware, accountController.createAccountController)

/**
 * - GET /api/accounts/
 * - protected route
 * - Get all accounts of the logged-in user
 */
router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountController)

/**
 * - GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController)

module.exports = router