import feedbackService from "../services/feedBack.services.js";

export const createFeedBackController = async (req, res) => {
  try {
    const data = req.body;
    const result = await feedbackService.createFeedback(data);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getAllFeedbackController = async (req, res) => {
  try {
    const result = await feedbackService.getAllfeedback();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const updatefeedbackController = async (req, res) => {
  try {
    const id = req.params.id;
    const dataUpdate = req.body;
    const result = await feedbackService.updateFeedback(id, dataUpdate);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const deleteFeedbackController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await feedbackService.deleteFeedback(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
