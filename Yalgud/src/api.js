// api.js
import axios from "axios";
import { Platform } from "react-native";

// ✅ Set your local server IP (adjust if needed)
export const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.1.5:8000" // 👈 Replace with your system's IP
    : "http://localhost:8000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

export default api;
