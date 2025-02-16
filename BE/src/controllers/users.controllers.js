import connectToDatabase from "../config/database.js";
import userService from "../services/user.services.js";
import { signToken } from "../utils/jwt.js";

export const showInFoController = async (req, res) => {
  const result = await userService.showData();
  return res.json({ result });
};

export const registerController = async (req, res) => {
  try {
    const user = await userService.resgister(req.body);
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; // Lấy từ Cookie
    if (!refreshToken)
      return res.status(401).json({ message: "Không có Refresh Token" });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Refresh Token không hợp lệ" });

      const newAccessToken = userService.signAccessToken(decoded);
      const newRefreshToken = userService.signRefreshToken(decoded);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true, // Chặn truy cập từ JavaScript (Bảo mật XSS)
        secure: true, // Chỉ gửi qua HTTPS
        sameSite: "None", // Chống CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });
      return res.json({ accesstoken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Không thể làm mới Access Token" });
  }
};

export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      throw new Error("Vui lòng nhập email và mật khẩu");
    const { userId, role, accesstoken, refreshtoken } = await userService.login(
      username,
      password
    );
    res.cookie("refreshToken", refreshtoken, {
      httpOnly: true, // Chặn truy cập từ JavaScript (Bảo mật XSS)
      secure: true, // Chỉ gửi qua HTTPS
      sameSite: "None", // Chống CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });
    res.status(200).json({ userId, role, accesstoken, refreshtoken });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const deleteController = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ URL params
    const user = await userService.delete(id);
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json("User deleted successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await userService.update(id, updateData);
    if (!id || !result) {
      throw new Error("Cannot update user");
    }
    res.status(200).json("User update successfully");
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const logoutController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.logout(id);
    if (!result) {
      throw new Error("Can not logout");
    }
    res.status(200).json("User logoutt successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
