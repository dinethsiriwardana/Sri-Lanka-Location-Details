# SL Cities API

An API to retrieve location details of Sri Lanka, including cities, districts, and provinces. Built with **Node.js**, **Express**, and **TypeScript**, this project is ideal for accessing and searching geographic information for Sri Lankan locations.

Available on: https://slcities.live/api/cities

Postman Collection: [LK Location Details Workspace](https://elements.getpostman.com/redirect?entityId=26460626-719284db-abf7-4258-84c4-4c21acc9b650&entityType=collection)

---

## Features

- Retrieve all cities, districts, and provinces in Sri Lanka
- Search cities by:
  - District
  - Province
  - Postcode
  - GPS coordinates (latitude, longitude, radius)
  - Query strings (name, language)
- Fetch districts by province name
- Get summary statistics of provinces with district and city counts
- Easy-to-use REST API with **OpenAPI 3.1.0** documentation

---

## Resources

The location data for this project was sourced from [madurapa's repository](https://github.com/madurapa/sri-lanka-provinces-districts-cities). You can visit the repository and download the data as SQL for your own projects.

---

## Technologies Used

- **Node.js**: Backend runtime
- **Express**: REST API framework
- **TypeScript**: Strongly typed JavaScript
- **Jest**: Testing framework
- **Docker**: Containerization
- **Azure**: Cloud deployment
- **ESLint & Prettier**: Code quality and formatting

---

## Installation

### Prerequisites

- Node.js (>= 18.x)
- Docker (optional for containerized deployment)
- Azure CLI (optional for Azure deployment)

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/dinethsiriwardana/Sri-Lanka-Location-Details.git
   cd sl-cities-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the environment:

   - Create a `.env` file in the root directory with the required variables.

4. Run the application:
   - In development mode:
     ```bash
     npm run dev
     ```
   - In production mode:
     ```bash
     npm start
     ```

---

## API Endpoints

### Base URL

- Local: `http://localhost:3000/api`
- Production: `https://slcities.live/api`
- Legacy: `http://slcities.centralindia.azurecontainer.io:3000/api`

### Endpoints

#### **Cities**

- `GET /cities`: Retrieve all cities.
- `GET /cities/district/{districtName}`: Retrieve cities by district.
- `GET /cities/province/{provinceName}`: Retrieve cities by province.
- `GET /cities/postcode/{postcode}`: Retrieve a city by postcode.
- `GET /cities/search?q={searchTerm}&lang={language}`: Search for cities by name and language.
- `GET /cities/nearby?lat={latitude}&lon={longitude}&radius={radius}`: Find cities near a GPS coordinate.

#### **Provinces**

- `GET /provinces`: Retrieve all provinces.

#### **Districts**

- `GET /districts`: Retrieve all districts.
- `GET /districts/province/{provinceId}`: Retrieve districts by province ID.
- `GET /districts/province-name/{provinceName}?lang={language}`: Retrieve districts by province name.

#### **Summary**

- `GET /summary`: Get a summary of provinces with district counts and city counts.

#### **Documentation**

- `GET /api-docs`: Interactive API documentation (Swagger UI).
- `GET /api-spec`: Raw OpenAPI specification in JSON format.

---

## Deployment Options

### Running with Docker

1. Build and start the container:

   ```bash
   docker-compose up --build
   ```

2. Access the API at `http://localhost:3000/api`.

3. For Azure Container Registry deployment:
   ```bash
   docker buildx build --platform linux/amd64 -t slcities.azurecr.io/slcities:latest . --push
   ```

### Deploying to Azure

#### Prerequisites

1. An Azure account with active subscription
2. Azure CLI installed on your machine

#### Steps

1. Login to Azure:

   ```bash
   az login
   ```

2. Create a Resource Group:

   ```bash
   az group create --name sl-cities-rg --location eastus
   ```

3. Create Azure Container Registry (ACR):

   ```bash
   az acr create --name slcitiesregistry --resource-group sl-cities-rg --sku Basic --admin-enabled true
   ```

4. Get ACR credentials:

   ```bash
   az acr credential show --name slcitiesregistry
   ```

5. Build and push Docker image to ACR:

   ```bash
   # Login to ACR
   az acr login --name slcitiesregistry

   # Build the image
   docker build -t slcitiesregistry.azurecr.io/sl-cities:latest .

   # Push the image to ACR
   docker push slcitiesregistry.azurecr.io/sl-cities:latest
   ```

6. Create an App Service Plan:

   ```bash
   az appservice plan create --name sl-cities-plan --resource-group sl-cities-rg --is-linux --sku B1
   ```

7. Create a Web App:

   ```bash
   az webapp create --resource-group sl-cities-rg --plan sl-cities-plan --name sl-cities --deployment-container-image-name slcitiesregistry.azurecr.io/sl-cities:latest
   ```

8. Configure the Web App to use ACR:
   ```bash
   az webapp config container set --name sl-cities --resource-group sl-cities-rg --docker-custom-image-name slcitiesregistry.azurecr.io/sl-cities:latest --docker-registry-server-url https://slcitiesregistry.azurecr.io --docker-registry-server-user slcitiesregistry --docker-registry-server-password <password_from_step_4>
   ```

Your app will be accessible at: https://slcities.live/

---

## Development Commands

- **Run in Development**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm start`
- **Lint**: `npm run lint`
- **Format**: `npm run format`
- **Test**: `npm run test`

---

## API Documentation

The API documentation is available in multiple formats:

- **Swagger UI**: Access the interactive API documentation at:
  - Local: `http://localhost:3000/api-docs`
  - Production: `https://slcities.live/api-docs`
- **OpenAPI Specification**: View or download the raw OpenAPI specification at:
  - Local: `http://localhost:3000/api-spec`
  - Production: `https://slcities.live/api-spec`
- **Postman Collection**: Available at the [Postman workspace](https://elements.getpostman.com/redirect?entityId=26460626-719284db-abf7-4258-84c4-4c21acc9b650&entityType=collection)

The API documentation follows the OpenAPI 3.1.0 specification and provides detailed information about all endpoints, request parameters, and response schemas.

---

## Project Structure

```
/src
  /controllers      # API business logic
    cityController.ts
    districtController.ts
    provinceController.ts
    homeController.ts
    docController.ts
    summaryController.ts
  /middlewares      # Express middlewares
    errorHandler.ts
  /routes           # API route definitions
    cityRoutes.ts
    districtRoutes.ts
    provinceRoutes.ts
    homeRoutes.ts
    summaryRoutes.ts
    index.ts
  /types            # TypeScript type definitions
    city.ts
  /utils            # Utility functions
    dataService.ts
  index.ts          # Application entry point
/data               # JSON data for locations
  cities.json
/public             # Static web frontend
  index.html
  app.js
  styles.css
  explorer.html
  provinces.html
  about.html
  /css
  /js
  /templates
/dist               # Compiled JavaScript output
docker-compose.yml
Dockerfile
openapi.yaml
package.json
tsconfig.json
azure-deployment.md
```

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit changes: `git commit -m "Add feature"`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

Feel free to reach out for any questions or issues! 🎉
