import jwt from "jsonwebtoken";
// import { User } from "../models/user.js";
import "dotenv/config";
export const registerValidate = (req, res, next) => {
  const { username, email, password, phone } = req.body;
  if (!username || !email || !password || !phone) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
  }
  next();
};

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const accesstoken = token.split(" ")[1];

    jwt.verify(accesstoken, process.env.JWT_ACCESS_TOKEN, (err, user) => {
      if (err) {
        res.status(403).json("Token is not valid");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You're not authenticated");
  }
};

export const loginValidate = (req, res, next) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Vui long nhap username." });
  }
  if (!password) {
    return res.status(400).json({ message: "Vui long nhap password" });
  }
  next();
};
