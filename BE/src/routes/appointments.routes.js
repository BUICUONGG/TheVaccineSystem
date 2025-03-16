import { Router } from "express";
import {
  createAptGoiController,
  createAptLeController,
  deleteAptGoiController,
  deleteAptLeController,
  getAppointmentsController,
  getAppointmentsWithDetailsByIdController,
  listAllAptGoiController,
  listAllAptLeController,
  searchAppointmentsController,
  searchAptGoiByIdController,
  showDetailAptGoiController,
  updateAptGoiController,
  updateAptLeController,
  updateDoseController,
} from "../controllers/appointment.controllers.js";
import { validateAccessToken } from "../middlewares/user.middleware.js";
// import { validateAccessToken } from "../middlewares/user.middleware.js";

const aptLeRoutes = Router();
const aptGoiRoutes = Router();

//PATH:    hoá đơn lẻ       http://localhost:8080/appointmentLe/.......
//PATH     hoá đơn gói      http://localhost:8080/appointmentGoi/.......

//------------------Apt Lẻ -------------------------------------------
// show ra list cac hoa don
aptLeRoutes.get("/showInfo", validateAccessToken, listAllAptLeController);

// tao 1 hoa don dua theo id cus va id vaccine
aptLeRoutes.post("/create", validateAccessToken, createAptLeController);

// lay full thong tin chi tiet cac hoá đơn
aptLeRoutes.get(
  "/getdetailallaptle",
  validateAccessToken,
  getAppointmentsController
);

// lấy chi tiết 1 hoá đơn dựa theo id
aptLeRoutes.get(
  "/getdetailaptlee/:id",
  validateAccessToken,
  getAppointmentsWithDetailsByIdController
);

// cập nhật thông tin hoá đơn dựa trên id
aptLeRoutes.post("/update/:id", validateAccessToken, updateAptLeController);

// xoá 1 hoá đơn theo id
aptLeRoutes.post("/delete/:id", validateAccessToken, deleteAptLeController);

// tìm kiếm 1 hoá đơn chi tiết theo id
aptLeRoutes.post(
  "/searchDetail/:id",
  validateAccessToken,
  searchAppointmentsController
);
//-----------------Apt Gois ------------------------------------------
aptGoiRoutes.get("/showInfo", validateAccessToken, listAllAptGoiController);

aptGoiRoutes.post("/create", validateAccessToken, createAptGoiController);

//show chi tiet hoa ddon cua goi
aptGoiRoutes.get(
  "/showDetailAptGoi",
  validateAccessToken,
  showDetailAptGoiController
);

aptGoiRoutes.post("/update/:id", validateAccessToken, updateAptGoiController);

aptGoiRoutes.post("/delete/:id", validateAccessToken, deleteAptGoiController);

// New route for updating individual doses
aptGoiRoutes.post("/updateDose/:id", validateAccessToken, updateDoseController);

//lấy thông tin chi tiết của 1 apt Gói theo id
aptGoiRoutes.post(
  "/searchAptGoiById/:id",
  validateAccessToken,
  searchAptGoiByIdController
);

export { aptGoiRoutes, aptLeRoutes };
