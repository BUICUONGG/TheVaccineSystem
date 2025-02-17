import jwt from "jsonwebtoken";
import "dotenv/config";
import connectToDatabase from "../config/database.js";
import { verifyToken } from "../utils/jwt.js";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export const registerValidate = (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
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

export const validateAccessToken = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ message: "You're not authenticated" });
    }
    // Kiểm tra token
    const decoded = await verifyToken({
      token: accessToken,
      secredOrPublickey: process.env.JWT_ACCESS_TOKEN,
    });

    req.user = decoded; // Gán user vào request
    next();
  } catch (error) {
    console.error("Access Token expired or invalid:", error);
    return res.status(401).json({ message: "Access Token expired" }); // Trả về lỗi 401
  }
};

export const validateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Không có Refresh Token" });
    }
    let decoded;
    try {
      // 🟢 Giải mã token để kiểm tra hạn sử dụng
      decoded = await verifyToken({
        token: refreshToken,
        secredOrPublickey: process.env.JWT_REFRESH_TOKEN,
      });
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Refresh Token đã hết hạn" });
      }
      return res.status(403).json({ message: "Refresh Token không hợp lệ" });
    }

    const user = await connectToDatabase.users.findOne({
      _id: new ObjectId(decoded.id),
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res
        .status(403)
        .json({ message: "Refresh Token không hợp lệ hoặc đã bị thu hồi" });
    }
    console.log(decoded);
    req.user = {
      _id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    console.error("Lỗi xác thực Refresh Token:", error);
    res.status(500).json({ message: "Lỗi xác thực Refresh Token" });
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
    next();
  } catch (error) {
    console.error("Staff verification error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
