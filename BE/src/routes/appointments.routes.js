import { Router } from "express";
import {
  createAptGoiController,
  createAptLeController,
  deleteAptLeController,
  getAppointmentsController,
  getAppointmentsWithDetailsByIdController,
  listAllAptGoiController,
  listAllAptLeController,
  searchAppointmentsController,
  updateAptLeController,
} from "../controllers/appointment.controllers.js";
import { validateAccessToken } from "../middlewares/user.middleware.js";

const aptLeRoutes = Router();
const aptGoiRoutes = Router();

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
// aptGoiRoutes.post("/update/:id", updateAptGoiController);
// aptGoiRoutes.post("/delete/:id", deleteAptGoiController);

export { aptGoiRoutes, aptLeRoutes };
