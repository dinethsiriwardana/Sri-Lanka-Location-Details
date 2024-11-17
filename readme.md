# Sri Lanka Cities API

An API to retrieve location details of Sri Lanka, including cities, districts, and provinces. Built with **Node.js**, **Express**, and **TypeScript**, this project is ideal for accessing and searching geographic information for Sri Lankan locations.

---

## Features
- Retrieve all cities, districts, and provinces.
- Search cities by:
  - District
  - Province
  - Postcode
  - GPS coordinates (latitude, longitude, radius)
  - Query strings (name, language).
- Fetch districts by province name.
- Easy-to-use REST API with **OpenAPI 3.1.0** documentation.

---

## Resources
The location data for this project was sourced from [madurapa's repository](https://github.com/madurapa/sri-lanka-provinces-districts-cities). You can visit the repository and download the data as SQL for your own projects.

---

## Technologies Used
- **Node.js**: Backend runtime.
- **Express**: REST API framework.
- **TypeScript**: Strongly typed JavaScript.
- **Jest**: Testing framework.
- **Docker**: Containerization.
- **ESLint & Prettier**: Code quality and formatting.

---

## Installation

### Prerequisites
- Node.js (>= 18.x)
- Docker (optional for containerized deployment)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/dinethsiriwardana/Sri-Lanka-Location-Details.git
   cd sri-lanka-cities-api
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

### Endpoints

#### **Cities**
- `GET /cities`: Retrieve all cities.
- `GET /cities/district/{district}`: Retrieve cities by district.
- `GET /cities/province/{province}`: Retrieve cities by province.
- `GET /cities/postcode/{postcode}`: Retrieve a city by postcode.
- `GET /cities/search`: Search for cities by name and language.
- `GET /cities/nearby`: Find cities near a GPS coordinate.

#### **Provinces**
- `GET /provinces`: Retrieve all provinces.

#### **Districts**
- `GET /districts`: Retrieve all districts.
- `GET /districts/province-name/{province}`: Retrieve districts in a province.

---

## Running with Docker
1. Build and start the container:
   ```bash
   docker-compose up --build
   ```
2. Access the API at `http://localhost:3000/api`.

---

## Development Commands
- **Run in Development**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm start`
- **Lint**: `npm run lint`
- **Format**: `npm run format`
- **Test**: `npm run test`

---

## OpenAPI Documentation
The API documentation is described in the [OpenAPI 3.1.0 specification](openapi.yaml). Use tools like Swagger UI or Postman to visualize and test the API.

---

## Project Structure
```
/src
  /data       # JSON data for locations
  /routes     # API routes
  index.ts    # Application entry point
/dist         # Compiled JavaScript output
docker-compose.yml
Dockerfile
package.json
tsconfig.json
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