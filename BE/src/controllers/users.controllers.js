import { ClientSession } from "mongodb";
import userService from "../services/user.services.js";

export const showInFoController = async (req, res) => {
  const result = await userService.showData();
  return res.json(result);
};

export const addUserController = async (req, res) => {
  const { username, email, phone, password, role } = req.body;
  const result = await userService.addUser({
    username,
    email,
    phone,
    password,
    role,
  });
  console.log(result);
  return res.json({ result });
};

export const loginController = async (req, res) => {
  const { email, password } = req.body;
  const result = await userService.login(email, password);
  return res.json({ result });
};
