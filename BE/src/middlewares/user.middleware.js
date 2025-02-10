import jwt from "jsonwebtoken";
// import { User } from "../models/user.js";

export const registerValidate = (req, res, next) => {
  const { username, email, password, phone } = req.body;
  if (!username || !email || !password || !phone) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
  }
  next();
};

export const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
  next();
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
