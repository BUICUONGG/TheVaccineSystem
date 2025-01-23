import express from "express";
import mongoose from "mongoose";
import UserModel from "./usersdbTest.js";
const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());

import { Router } from "express";

app.use("./users", usersRouter);
app.use("./vaccince", vaccinceRouter);

const uri =
  "mongodb+srv://cuongbui10704:cuongbui10704@swp.lg53w.mongodb.net/test";
app.get("/", async (req, res) => {
  await mongoose.connect(uri);

  let users = await UserModel.find();

  res.send(users);
});

app.listen(port, () => {
  console.log("Your app running on port " + `${port}`);
});
