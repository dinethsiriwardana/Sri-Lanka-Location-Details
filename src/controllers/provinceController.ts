import { Request, Response } from "express";
import dataService from "../utils/dataService";

export const getAllProvinces = (req: Request, res: Response) => {
  try {
    const provinces = dataService.getProvinces();
    res.json(provinces);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};
