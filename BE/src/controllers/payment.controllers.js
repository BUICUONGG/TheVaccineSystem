import paymentService from "../services/payment.services.js";

export const createpaymentController = async (req, res) => {
  try {
    const result = await paymentService.createPayment(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const callbackController = async (req, res) => {
  try {
    const result = await paymentService.callbackPayment(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const orderStatusController = async (req, res) => {
  try {
    const result = await paymentService.checkOrderStatus(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
