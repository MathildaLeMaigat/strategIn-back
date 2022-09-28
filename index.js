const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

// IMPORT DB
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/strategIn");

// IMPORT package Password
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// IMPORT Model
const User = require("./Model/User");

const { application } = require("express");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  console.log("OK");
  res.status(200).json({ message: "route >> /" });
});

app.post("/register", async (req, res) => {
  try {
    // console.log(req.body);
    const { username, email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (username) {
      if (user === null) {
        const token = uid2(64);
        const salt = uid2(16);

        const hash = SHA256(password + salt).toString(encBase64);
        console.log(hash);

        const newUser = new User({
          account: {
            username: username,
          },
          email: email,
          token: token,
          salt: salt,
          hash: hash,
        });
        await newUser.save();
        res.json({
          _id: newUser.id,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        res.status(409).json({ error: "This email already has an account" });
      }
    } else {
      res.status(400).json({ error: "Missing parameters" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;
    // Verifier que l'email existe dans DB
    const user = await User.findOne({ email: email });
    if (user) {
      // Verifier que le PW est le meme
      const newHash = SHA256(password + user.salt).toString(encBase64);
      if (newHash === user.hash) {
        res.json({
          _id: user.id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(401).json({ error: "Unauthorized1" });
      }
    } else {
      res.status(401).json({ error: "Unauthorized2" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/users", async (req, res) => {
  //   console.log(req.body);
  const users = await User.findOne({ email: req.body.email }).populate({
    path: "account",
    select: "username",
  });
  console.log(users);
  res.status(200).json({ users });
});

app.all("*", (req, res) => {
  console.log("Route Not Found");
  res.status(404).json({ message: "Route Not Found" });
});

app.listen(3001, () => {
  console.log("server has started 🔥");
});