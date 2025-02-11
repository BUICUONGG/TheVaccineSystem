import connectToDatabase from "../config/database.js";
import userService from "../services/user.services.js";

export const showInFoController = async (req, res) => {
  const result = await userService.showData();
  return res.json({ result });
};

export const registerController = async (req, res) => {
  try {
    const user = await userService.resgister(req.body);
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = await userService.login(username, password);
    if (!username || !password)
      throw new Error("Vui lòng nhập email và mật khẩu");
    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteController = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ URL
    const user = await userService.delete(id);
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json({ message: "User deleted successfully" });
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
    res.status(200).json({ message: "User update successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logoutController = async (req, res) => {};
