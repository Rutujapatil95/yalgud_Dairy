// api.js
import axios from "axios";
import { Platform } from "react-native";

// ✅ Set your local server IP (adjust if needed)
export const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.43.207:8000" 
    : "http://10.0.2.2:8000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

export default api;
