import connectToDatabase from "../config/database.js";
import notiService from "../services/noti.services.js";

export const createNotiController = async (req, res) => {
  try {
    const message = req.body;
    const noti = await notiService.createNoti(message);
    res.status(200).json(noti);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getNotiByCusIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const notis = await notiService.getNoti(id);
    res.status(200).json(notis);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
