import { Router } from "express";
import * as homeController from "../controllers/homeController";

const router = Router();

// Use the dashboard as the homepage
router.get("/", homeController.serveDashboard);
router.get("/dashboard", homeController.serveDashboard);

export default router;
