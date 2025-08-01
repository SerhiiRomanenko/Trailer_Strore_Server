const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String,
    password: String,
    role: {type: String, enum: ["admin", "customer"], default: "customer"},
    avatar: {type: String, default: null},
});

module.exports = mongoose.model("User", userSchema);
