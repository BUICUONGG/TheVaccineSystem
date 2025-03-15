import Router from "express";
import {
  createFeedBackController,
  deleteFeedbackController,
  getAllFeedbackController,
  updatefeedbackController,
} from "../controllers/feedBack.controllers.js";

const feedbackRoutes = Router();

// PATH               http://localhost:8080/feedback/.............

feedbackRoutes.get("/getAllFeedback", getAllFeedbackController);
feedbackRoutes.post("/createFeedback", createFeedBackController);
feedbackRoutes.post("/updateFeedbackByid/:id", updatefeedbackController);
feedbackRoutes.post("/deleteFeedback/:id", deleteFeedbackController);

export default feedbackRoutes;
