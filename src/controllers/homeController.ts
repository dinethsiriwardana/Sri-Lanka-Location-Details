import { Request, Response } from "express";
import * as path from "path";

export const serveHomepage = (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
};

export const serveDashboard = (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/dashboard.html"));
};
