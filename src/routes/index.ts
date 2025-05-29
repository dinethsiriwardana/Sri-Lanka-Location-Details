import { Router } from "express";
import cityRoutes from "./cityRoutes";
import districtRoutes from "./districtRoutes";
import provinceRoutes from "./provinceRoutes";
import homeRoutes from "./homeRoutes";
import summaryRoutes from "./summaryRoutes";

const router = Router();

// Register all routes
router.use("/api/cities", cityRoutes);
router.use("/api/districts", districtRoutes);
router.use("/api/provinces", provinceRoutes);
router.use("/api/summary", summaryRoutes);
router.use("/", homeRoutes);

export default router;
