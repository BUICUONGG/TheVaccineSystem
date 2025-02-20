import childService from "../services/child.services.js";

export const showChildController = async (req, res) => {
  const result = await childService.showData();
  return res.json(result);
};

export const createChildController = async (req, res) => {
  try {
    const child = await childService.create(req.body);
    res.status(201).json({ message: "Child created successfully", child });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
