import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as path from "path";
import dataService from "./utils/dataService";
import { errorHandler } from "./middlewares/errorHandler";
import routes from "./routes";
import { setupSwaggerDocs } from "./controllers/docController";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const initializeData = async () => {
  try {
    await dataService.loadData();
    console.log("Data initialization completed");
  } catch (error) {
    console.error("Failed to initialize data:", error);
    process.exit(1);
  }
};

// Setup API documentation
setupSwaggerDocs(app);

// Register all routes
app.use(routes);

// Error handling middleware
app.use(errorHandler);

initializeData()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Visit http://localhost:${port} to view the application`);
      console.log(
        `Visit http://localhost:${port}/api-docs to access API documentation`
      );
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
