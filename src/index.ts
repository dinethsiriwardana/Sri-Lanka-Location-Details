import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import dataService from "./utils/dataService";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const initializeData = async () => {
  try {
    await dataService.loadData();
    console.log("Data initialization completed");
  } catch (error) {
    console.error("Failed to initialize data:", error);
    process.exit(1);
  }
};

// Routes
app.get("/api/cities", (req: Request, res: Response) => {
  const cities = dataService.getCities();
  res.json(cities);
});

app.get("/api/cities/district/:districtName", (req: Request, res: Response) => {
  const cities = dataService.getCitiesByDistrict(req.params.districtName);

  if (cities.length === 0) {
    return res
      .status(404)
      .json({ message: "No cities found in this district" });
  }

  res.json(cities);
});

app.get("/api/cities/province/:provinceName", (req: Request, res: Response) => {
  const cities = dataService.getCitiesByProvince(req.params.provinceName);

  if (cities.length === 0) {
    return res
      .status(404)
      .json({ message: "No cities found in this province" });
  }

  res.json(cities);
});

app.get("/api/cities/postcode/:postcode", (req: Request, res: Response) => {
  const city = dataService.getCityByPostcode(req.params.postcode);

  if (!city) {
    return res.status(404).json({ message: "City not found" });
  }

  res.json(city);
});

app.get("/api/cities/search", (req: Request, res: Response) => {
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
});

app.get("/api/cities/nearby", (req: Request, res: Response) => {
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
});

app.get("/api/districts", (req: Request, res: Response) => {
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
});

// Get all provinces
app.get("/api/provinces", (req: Request, res: Response) => {
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
});

// Get districts by province ID
app.get(
  "/api/districts/province/:provinceId",
  (req: Request, res: Response) => {
    try {
      const districts = dataService.getDistrictsByProvince(
        req.params.provinceId
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
  }
);

// Get districts by province name (with optional language parameter)
app.get(
  "/api/districts/province-name/:provinceName",
  (req: Request, res: Response) => {
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
  }
);

// Error handling middleware
app.use(errorHandler);

initializeData()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
