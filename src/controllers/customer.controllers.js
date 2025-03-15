import customerService from "../services/customer.services.js";

export const getOneCusController = async (req, res) => {
  try {
    const id = req.params.id;
    const customer = await customerService.getOneCustomer(id);
    return res.json(customer);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getAllCusController = async (req, res) => {
  try {
    const result = await customerService.getAllCustomer();
    res.json({ result });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const updatemeController = async (req, res) => {
  try {
    const customerID = req.params.id;
    const updateData = req.body;
    await customerService.updateCustomer(customerID, updateData);
    res.status(200).json("Cap nhat thanh cong");
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const getAptleAndAptGoiByCusIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await customerService.getAptleAndAptGoiByCusId(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
