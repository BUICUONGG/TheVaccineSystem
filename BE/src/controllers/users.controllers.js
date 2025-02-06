import userService from "../services/user.services.js";

export const showInFoController = async (req, res) => {
  const result = await userService.showInfo();
  return res.json({
    message: "khong the show",
    result,
  });
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
  return res.json(result);
};
