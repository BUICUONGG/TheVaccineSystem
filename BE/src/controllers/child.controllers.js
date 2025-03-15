import childService from "../services/child.services.js";

export const showChildController = async (req, res) => {
  try {
    const result = await childService.showData();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const createChildController = async (req, res) => {
  try {
    const child = await childService.create(req.body);
    res.status(201).json({ message: "Child created successfully", child });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const updateChildController = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const result = await childService.updateChild(id, data);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const deleteChildController = async (req, res) => {
  try {
    const id = req.id.params;
    const result = await childService.deleteChild(id);
    res.status(200).json("Xoa thanh cong");
  } catch (error) {
    res.status(500).json(error.message);
  }
};
