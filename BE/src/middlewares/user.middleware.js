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

export const userDataValidate = (req, res, next) => {
  const { error } = userSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: error.details.map((err) => err.message),
    });
  }

  next();
};

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "You're not authenticated" });
    }
    const accessToken = token.split(" ")[1]; // Lấy token từ "Bearer <token>"

    jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Token is not valid" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ message: "Internal Server Error" });
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

export const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You're not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You do not have Admin privileges" });
    }

    next(); // Cho phép tiếp tục nếu là admin
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyStaff = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You're not authenticated" });
    }
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You do not have Staff privileges" });
    }
  } catch (error) {
    console.error("Staff verification error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
