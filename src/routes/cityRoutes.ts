import { Router } from "express";
import * as cityController from "../controllers/cityController";

const router = Router();

router.get("/", cityController.getAllCities);
router.get("/district/:districtName", cityController.getCitiesByDistrict);
router.get("/province/:provinceName", cityController.getCitiesByProvince);
router.get("/postcode/:postcode", cityController.getCityByPostcode);
router.get("/search", cityController.searchCities);
router.get("/nearby", cityController.findNearbyCities);

export default router;
