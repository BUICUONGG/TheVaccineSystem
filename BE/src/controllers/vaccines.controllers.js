import { Router } from "express";
import VaccineService from "../services/vaccine.services.js";

const vaccineService = new VaccineService();

export const addVaccineController = async (req, res) => {
  try {
    const vaccine = await vaccineService.addVaccine(req.body);
    res.status(201).json({
      success: true,
      message: "Vaccine added successfully",
      data: vaccine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllVaccinesController = async (req, res) => {
  try {
    const vaccines = await vaccineService.getAllVaccines();
    res.status(200).json({
      success: true,
      data: vaccines
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getVaccineByIdController = async (req, res) => {
  try {
    const vaccine = await vaccineService.getVaccineById(req.params.id);
    if (!vaccine) {
      return res.status(404).json({
        success: false,
        message: "Vaccine not found"
      });
    }
    res.status(200).json({
      success: true,
      data: vaccine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateVaccineController = async (req, res) => {
  try {
    const updatedVaccine = await vaccineService.updateVaccine(req.params.id, req.body);
    if (!updatedVaccine) {
      return res.status(404).json({
        success: false,
        message: "Vaccine not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Vaccine updated successfully",
      data: updatedVaccine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteVaccineController = async (req, res) => {
  try {
    const deletedVaccine = await vaccineService.deleteVaccine(req.params.id);
    if (!deletedVaccine) {
      return res.status(404).json({
        success: false,
        message: "Vaccine not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Vaccine deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export default vaccinceRouter;