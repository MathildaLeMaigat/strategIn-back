const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

// IMPORT DB
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);

// IMPORT package Password
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// IMPORT Model
const User = require("./Model/User");
const Task = require("./Model/Task");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  console.log("OK");
  res.status(200).json({ message: "route *** /" });
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
    const user = await User.findOne({ email: email });
    if (user) {
      const newHash = SHA256(password + user.salt).toString(encBase64);
      if (newHash === user.hash) {
        res.json({
          _id: user.id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/users", async (req, res) => {
  try {
    // console.log(req.body);
    const users = await User.find();
    // console.log("userback", users);
    const response = [];
    users.map((user) => {
      const userMap = { email: user.email, username: user.account.username };
      response.push(userMap);
    });
    // console.log(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Second Part //

// app.get("/create", async (req, res) => {
//   try {
//     const newProject = new Project(req.body);
//     await newProject.save();
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

app.post("/", async (req, res) => {
  try {
    const task = await new Task(req.body).save();
    res.send(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.send(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id }, req.body);
    res.send(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    res.send(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.all("*", (req, res) => {
  console.log("Route Not Found");
  res.status(404).json({ message: "Route Not Found" });
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Server has started ????");
});
