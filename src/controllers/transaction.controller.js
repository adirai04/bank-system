const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")

async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: "FromAccount, toAccount, amount and idempotencyKey are required" })
    }

    const fromUserAccount = await accountModel.findOne({ _id: fromAccount })
    const toUserAccount = await accountModel.findOne({ _id: toAccount })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({ message: "Invalid fromAccount or toAccount" })
    }

    const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey: idempotencyKey })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({ message: "Transaction already processed", transaction: isTransactionAlreadyExists })
        }
        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(200).json({ message: "Transaction is still processing" })
        }
        if (isTransactionAlreadyExists.status === "FAILED") {
            return res.status(500).json({ message: "Transaction processing failed, please retry" })
        }
        if (isTransactionAlreadyExists.status === "REVERSED") {
            return res.status(500).json({ message: "Transaction was reversed, please retry" })
        }
    }

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({ message: "Both fromAccount and toAccount must be ACTIVE to process transaction" })
    }

    const balance = await fromUserAccount.getBalance()
    if (balance < amount) {
        return res.status(400).json({ message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}` })
    }

    // 1. Declare session and transaction OUTSIDE the try block
    let transaction;
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0]

        await ledgerModel.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )

        // 2. Commit transaction at the very end of the try block
        await session.commitTransaction()
        
    } catch (error) {
        // 3. If anything fails, abort the transaction safely
        await session.abortTransaction()
        console.error("Transaction Error:", error)
        return res.status(500).json({ message: "Transaction failed due to an internal issue, please retry" })
    } finally {
        // 4. Always end the session in the finally block
        session.endSession()
    }

    try {
        await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)
    } catch (emailError) {
        console.error("Email failed, but transfer succeeded:", emailError)
    }

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })
}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: "toAccount, amount and idempotencyKey are required" })
    }

    const toUserAccount = await accountModel.findOne({ _id: toAccount })
    if (!toUserAccount) {
        return res.status(400).json({ message: "Invalid toAccount" })
    }

    const fromUserAccount = await accountModel.findOne({ user: req.user._id })
    if (!fromUserAccount) {
        return res.status(400).json({ message: "System user account not found" })
    }

    // Add safe transaction handling to this function as well
    const session = await mongoose.startSession()
    session.startTransaction()
    let transaction;

    try {
        transaction = new transactionModel({
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        })

        await ledgerModel.create([{
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        transaction.status = "COMPLETED"
        await transaction.save({ session })

        await session.commitTransaction()
    } catch (error) {
        await session.abortTransaction()
        console.error("Initial Funds Error:", error)
        return res.status(500).json({ message: "Initial funds transaction failed" })
    } finally {
        session.endSession()
    }

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })
}

module.exports = { createTransaction, createInitialFundsTransaction } 