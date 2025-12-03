# Instructions for Creating and Running Docker Images using Docker-Compose

This document explains how to use the existing `docker-compose.yml` and Dockerfiles to create and run Docker images for the backend and frontend of this project using Docker Compose commands.

## Prerequisites
- Docker installed on your system: [Install Docker](https://docs.docker.com/get-docker/)
- Docker Compose installed: Usually included with Docker Desktop or install separately [Install Docker Compose](https://docs.docker.com/compose/install/)

---

## 1. Build Docker Images
To build the Docker images for both backend and frontend services as defined in the `docker-compose.yml`, run:

```bash
docker-compose build
```

This command will:
- Build the backend image based on `backend/dockerfile`
- Build the frontend image based on `frontend/dockerfile`

---

## 2. Run Containers
To start the backend and frontend containers in detached mode (running in the background), run:

```bash
docker-compose up -d
```

This will:
- Create and start containers named `my-backend` and `my-frontend`.
- Map ports as defined:
  - Backend container port `5000` exposed on host port `5000`
  - Frontend container port `80` exposed on host port `3000`
- Both containers will be connected to a custom network `app-network`.

---

## 3. Check Running Containers
To see the status of the running containers, run:

```bash
docker-compose ps
```

---

## 4. View Logs
To view the logs of backend or frontend containers, run:

```bash
docker-compose logs backend
docker-compose logs frontend
```

Add `-f` flag to follow logs in real time, e.g., `docker-compose logs -f backend`

---

## 5. Stop and Remove Containers
To stop the running containers and remove the containers and network, run:

```bash
docker-compose down
```

---

## 6. Environment Variables & Ports
- Backend sets environment variables like `NODE_ENV`, `PORT`, and `MONGO_URI` from the `docker-compose.yml`.
- Frontend uses an environment variable `REACT_APP_API_URL` which should be set in your shell environment before running compose, or you can configure a `.env` file.
- Ports are mapped as:
  - Backend: host `5000` -> container `5000`
  - Frontend: host `3000` -> container `80`

---

## 7. Optional: .env File
To avoid exporting environment variables each time, you can create a `.env` file in the project root with variables like:

```
REACT_APP_API_URL=http://localhost:5000
```

Docker Compose will automatically load environment variables from `.env`.

---

## Summary Commands

| Command                         | Description                    |
|--------------------------------|-------------------------------|
| `docker-compose build`          | Build backend and frontend images |
| `docker-compose up -d`          | Start containers in detached mode  |
| `docker-compose ps`             | Check running containers          |
| `docker-compose logs <service>` | View logs of a service            |
| `docker-compose down`           | Stop and remove containers/network |

---

If you have any questions or need further assistance, feel free to ask.
