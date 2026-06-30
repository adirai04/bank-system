const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required for creating an account"],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address"],
        unique: [true, "Email already exists"]
    },
    name: {
        type: String,
        required: [true, "Name is required for creating an account"]
    },
    password: {
        type: String,
        required: [true, "Password is required for creating an account"],
        minLength: [6, "Passoword should contain minimum 6 characters"],
        select: false // ---> tells Mongoose not to include this field when querying documents, unless you explicitly ask for it.
    },
    systemUser: {
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }
}, {
    timestamps: true
})

/* When user modifies the password */
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return; 
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    
});

/* creating custom function for checking passwords */
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const userModel = mongoose.model("user", userSchema)

module.exports = userModel