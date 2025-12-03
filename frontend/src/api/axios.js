import axios from "axios";

// Base URL for your backend
const API_URL = "http://localhost:5000/api/v1/user";

// Create Axios instance
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies for auth
  headers: {
    "Content-Type": "application/json",
  },
});
