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
// import { validateAccessToken } from "../middlewares/user.middleware.js";

const aptLeRoutes = Router();
const aptGoiRoutes = Router();

//PATH:    hoá đơn lẻ       http://localhost:8080/appointmentLe/.......
//PATH     hoá đơn gói      http://localhost:8080/appointmentGoi/.......

//------------------Apt Lẻ -------------------------------------------
// show ra list cac hoa don
aptLeRoutes.get("/showInfo", listAllAptLeController);

// tao 1 hoa don dua theo id cus va id vaccine
aptLeRoutes.post("/create", createAptLeController);

// lay full thong tin chi tiet cac hoá đơn
aptLeRoutes.get("/getdetailallaptle", getAppointmentsController);

// lấy chi tiết 1 hoá đơn dựa theo id
aptLeRoutes.get(
  "/getdetailaptlee/:id",
  getAppointmentsWithDetailsByIdController
);

// cập nhật thông tin hoá đơn dựa trên id
aptLeRoutes.post("/update/:id", updateAptLeController);

// xoá 1 hoá đơn theo id
aptLeRoutes.post("/delete/:id", deleteAptLeController);

// tìm kiếm 1 hoá đơn chi tiết theo id
aptLeRoutes.post("/searchDetail/:id", searchAppointmentsController);
//-----------------Apt Gois ------------------------------------------
aptGoiRoutes.get("/showInfo", listAllAptGoiController);

aptGoiRoutes.post("/create", createAptGoiController);

//show chi tiet hoa ddon cua goi
aptGoiRoutes.get("/showDetailAptGoi", showDetailAptGoiController);

aptGoiRoutes.post("/update/:id", updateAptGoiController);

aptGoiRoutes.post("/delete/:id", deleteAptGoiController);

// New route for updating individual doses
aptGoiRoutes.post("/updateDose/:id", updateDoseController);

//lấy thông tin chi tiết của 1 apt Gói theo id
aptGoiRoutes.post("/searchAptGoiById/:id", searchAptGoiByIdController);

export { aptGoiRoutes, aptLeRoutes };
