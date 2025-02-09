import jwt from "jsonwebtoken";
// import { User } from "../models/user.js";

export const validateRegister = (req, res, next) => {
  const { username, email, password, phone } = req.body;
  if (!username || !email || !password || !phone) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
  }
  next();
};

export const verifyToken = (req, res, next) => {
  const token = req.header.token;
  if (token) {
    const accesstoken = token.slipt;
  }
};
