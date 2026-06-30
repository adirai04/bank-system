const tokenBlackListModel = require("../models/blackList.model")
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")

async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    const isBlackListed = tokenBlackListModel.findOne({ token })

    if (isBlackListed) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

    try {

        /* If token is correct it will proceed otherwise it will throw an error */
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.userId)

        /* middleware ne req ke andar ek 'user' naam ki property add kardi jiske value user hai */
        req.user = user

        next()

    } catch (error) { /* Wrong token */
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    const isBlackListed = tokenBlackListModel.findOne({ token })

    if (isBlackListed) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

    try {

        /* If token is correct it will proceed otherwise it will throw an error */
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.userId).select("+systemUser")
        if (!user.systemUser) {
            return res.status(403).json({
                message: "Forbidden access, not a system user"
            })
        }

        /* middleware ne req ke andar ek 'user' naam ki property add kardi jiske value user hai */
        req.user = user

        next()

    } catch (error) { /* Wrong token */
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}

module.exports = { authMiddleware, authSystemUserMiddleware }
