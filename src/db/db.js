const mongoose = require("mongoose")
const dns = require("dns")

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Server connected to database ✅✅✅")
    } catch (error) {
        console.log("Database connection error", error)
        process.exit(1)  // ---> shut down server if database fails to connect with server
    }
}

module.exports = connectDB