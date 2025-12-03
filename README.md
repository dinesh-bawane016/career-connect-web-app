# Career Connect Web App

This is the Career Connect web application, including a React frontend and a Node.js backend.

## Docker Compose Setup and Usage

This project is dockerized with a multi-service setup including a backend API and a frontend React app. Follow the instructions below to build and run the services using Docker Compose.

### Prerequisites

- Docker and Docker Compose installed on your system.
- Access to the MongoDB instance specified in the `MONGO_URI` environment variable in `docker-compose.yml`.
- Optional: Set the `REACT_APP_API_URL` environment variable for the frontend API endpoint.

### Build and Run with Docker Compose

```bash
# Build Docker images for backend and frontend
docker-compose build

# Start the containers in detached mode
docker-compose up -d

# Backend API will be available at http://localhost:5000
# Frontend React app will be available at http://localhost:3000

# Monitor logs of both services
docker-compose logs -f

# Stop and remove containers, networks, and volumes created by Docker Compose
docker-compose down
```

### Notes

- The backend service listens on port 5000 and connects to MongoDB using the configured `MONGO_URI` environment variable.
- The frontend service serves the React app using nginx on port 80 inside the container, mapped to host port 3000.
- Make sure your environment variables are set properly before running Docker Compose.
- For local development with code hot reloading, consider additional volume mounting and Docker Compose override files.

If you encounter issues or need further customization, feel free to ask.
