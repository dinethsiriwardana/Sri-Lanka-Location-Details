import { Request, Response } from "express";
import dataService from "../utils/dataService";

export const getAllDistricts = (req: Request, res: Response) => {
  try {
    const districts = dataService.getDistricts();
    res.json(districts);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getDistrictsByProvince = (req: Request, res: Response) => {
  try {
    const districts = dataService.getDistrictsByProvince(req.params.provinceId);
    if (districts.length === 0) {
      return res
        .status(404)
        .json({ message: "No districts found for this province" });
    }
    res.json(districts);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getDistrictsByProvinceName = (req: Request, res: Response) => {
  try {
    const lang = (req.query.lang as "en" | "si" | "ta") || "en";
    const districts = dataService.getDistrictsByProvinceName(
      req.params.provinceName,
      lang
    );
    if (districts.length === 0) {
      return res
        .status(404)
        .json({ message: "No districts found for this province" });
    }
    res.json(districts);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};
