import connectToDatabase from "../config/database.js";
import notiService from "../services/noti.services.js";

export const createNotiController = async (req, res) => {
  try {
    const cusId = req.paramas.id;
    const message = req.body;
    const noti = await notiService.createNoti(cusId, message);
    res.status(200).json(noti);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getNotiByCusIdController = async (req, res) => {
  try {
    const data = req.body;
    const notis = await notiService.getNoti(cusId);
    res.status(200).json(notis);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
