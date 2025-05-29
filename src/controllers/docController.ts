import { Request, Response } from "express";
import * as path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

// Load the OpenAPI specification
const swaggerDocument = YAML.load(path.join(__dirname, "../../openapi.yaml"));

export const setupSwaggerDocs = (app: any) => {
  // Serve OpenAPI documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Serve OpenAPI specification as JSON
  app.get("/api-spec", (req: Request, res: Response) => {
    res.json(swaggerDocument);
  });
};
