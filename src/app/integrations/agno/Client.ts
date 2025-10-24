import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const URL_BASE = process.env.AGNO_BASE_URL as string;
const TOKEN = process.env.AGNO_TOKEN as string;

console.log(URL_BASE);

const client = axios.create({
  baseURL: URL_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${TOKEN}`,
  },
  timeout: 180000,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error Response:");
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("No response received. Request:", error.request);
    } else {
      console.error("Error setting up the request:", error.message);
    }

    return Promise.reject(error);
  },
);

export default client;
