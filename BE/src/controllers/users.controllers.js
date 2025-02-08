import { ClientSession } from "mongodb";
import userService from "../services/user.services.js";

export const showInFoController = async (req, res) => {
  const result = await userService.showData();
  return res.json({ result });
};

export const addUserController = async (req, res) => {
  try {
    const user = await userService.addUser(req.body);
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = await userService.login(req.body);
    if (!email || !password) throw new Error("Vui lòng nhập email và mật khẩu");
    res.status(200).json({ message: "Login successfully", ...account });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
