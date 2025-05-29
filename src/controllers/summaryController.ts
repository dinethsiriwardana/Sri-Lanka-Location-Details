import { Request, Response } from "express";
import dataService from "../utils/dataService";

export const getSummary = (req: Request, res: Response) => {
  try {
    const summary = dataService.getSummary();
    res.json(summary);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};
