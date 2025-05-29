import { Request, Response } from "express";
import dataService from "../utils/dataService";

export const getAllCities = (req: Request, res: Response) => {
  const cities = dataService.getCities();
  res.json(cities);
};

export const getCitiesByDistrict = (req: Request, res: Response) => {
  const cities = dataService.getCitiesByDistrict(req.params.districtName);

  if (cities.length === 0) {
    return res
      .status(404)
      .json({ message: "No cities found in this district" });
  }

  res.json(cities);
};

export const getCitiesByProvince = (req: Request, res: Response) => {
  const cities = dataService.getCitiesByProvince(req.params.provinceName);

  if (cities.length === 0) {
    return res
      .status(404)
      .json({ message: "No cities found in this province" });
  }

  res.json(cities);
};

export const getCityByPostcode = (req: Request, res: Response) => {
  const city = dataService.getCityByPostcode(req.params.postcode);

  if (!city) {
    return res.status(404).json({ message: "City not found" });
  }

  res.json(city);
};

export const searchCities = (req: Request, res: Response) => {
  const searchTerm = req.query.q as string;
  const lang = req.query.lang as "en" | "si" | "ta";

  if (!searchTerm) {
    return res.status(400).json({ message: "Search term is required" });
  }

  try {
    const cities = dataService.searchCities(searchTerm, lang);
    if (cities.length === 0) {
      return res
        .status(404)
        .json({ message: "No cities found matching search criteria" });
    }

    res.json(cities);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: "An unknown error occurred" });
    }
  }
};

export const findNearbyCities = (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  const radius = parseFloat(req.query.radius as string) || 5;

  if (isNaN(lat) || isNaN(lon)) {
    return res
      .status(400)
      .json({ message: "Valid latitude and longitude are required" });
  }

  const cities = dataService.findNearbyCities(lat, lon, radius);

  if (cities.length === 0) {
    return res
      .status(404)
      .json({ message: "No cities found within specified radius" });
  }

  res.json(cities);
};
