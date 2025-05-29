import { Router } from "express";
import * as districtController from "../controllers/districtController";

const router = Router();

router.get("/", districtController.getAllDistricts);
router.get("/province/:provinceId", districtController.getDistrictsByProvince);
router.get(
  "/province-name/:provinceName",
  districtController.getDistrictsByProvinceName
);

export default router;
