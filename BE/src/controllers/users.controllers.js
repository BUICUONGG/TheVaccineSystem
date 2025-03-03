import connectToDatabase from "../config/database.js";
import userService from "../services/user.services.js";

export const showInFoController = async (req, res) => {
  try {
    const result = await userService.showDataUser();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
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
    const user = req.user; // Lấy thông tin user từ middleware
    console.log(user);
    const newAccessToken = await userService.signAccessToken(user);

    return res.json({
      accessToken: newAccessToken,
      // refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Không thể làm mới Access Tokenn" });
  }
};

export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      throw new Error("Vui lòng nhập email và mật khẩu");
    const { userId, cusId, role, accesstoken, refreshtoken } =
      await userService.login(username, password);
    res.cookie("refreshToken", refreshtoken, {
      httpOnly: true, // Chặn truy cập từ JavaScript (Bảo mật XSS)
      secure: true, // Chỉ gửi qua HTTPS
      sameSite: "None", // Chống CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });
    res.status(200).json({ userId, cusId, role, accesstoken, refreshtoken });
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

// export const checkUsernameController = async (req, res) => {
//   try {
//     const { username } = req.body;
//     const user = await userService.findByUsername(username);
//     if (user) {
//       res.json({ exists: true, userId: user._id });
//     } else {
//       res.status(404).json({ exists: false, message: "Username not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const updateController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await userService.update(id, updateData);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.logout(id);
    if (!result) {
      throw new Error("Can not logout");
    }
    // Xóa Refresh Token khỏi cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json("User logoutt successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const username = req.body;
    const newPassword = req.body;
    const result = await userService.forgotPassword(username, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(200).json(error.message);
  }
};
