import { Router } from "express";
import * as provinceController from "../controllers/provinceController";

const router = Router();

router.get("/", provinceController.getAllProvinces);

export default router;
