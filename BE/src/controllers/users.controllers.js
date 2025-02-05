import userService from "../services/user.services.js";

export const showInFoController = async (req, res) => {
  const result = await userService.showInfo();
  return res.json({
    message: "khong the show",
    result,
  });
};
