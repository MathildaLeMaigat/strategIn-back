const mongoose = require("mongoose");

const User = mongoose.model("User", {
  account: {
    username: { required: true, type: String },
    avatar: Object,
  },
  email: { unique: true, type: String },
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
