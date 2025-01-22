import express from "express";
import mongoose from "mongoose";
import UserModel from "./usersdbTest.js";
const app = express();
const port = 8080;

app.listen(port, () => {
  console.log("Your app running on port " + `${port}`);
});

const uri = "mongodb+srv://cuongbui10704:cuongbui10704@swp.lg53w.mongodb.net/";

app.get("/", async (req, res) => {
  await mongoose.connect(uri);

  let users = await UserModel.find();

  res.send(users);
});
