import customerService from "../services/customer.services.js";

export const getOneCusController = async (req, res) => {
  try {
    const id = req.params.id;
    const customer = await customerService.getOneCustomer(id);
    if (!customer) {
      throw new Error("Khong co thong tin nay");
    }
    return res.json(customer);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getAllCusController = async (req, res) => {
  const result = await customerService.getAllCustomer();
  res.json({ result });
};

export const updatemeController = async (req, res) => {
  try {
    const customerID = req.params.id;
    const updateData = req.body;
    const result = await customerService.updateCustomer(customerID, updateData);
    if (!result) {
      throw new Error("Khong the cap nhat");
    }
    res.status(200).json("Cap nhat thanh cong");
  } catch (error) {
    res.status(500).json(error.message);
  }
};
