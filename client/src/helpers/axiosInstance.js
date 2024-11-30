import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api", // Ensure this is correct
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`, // Make sure the token exists
  },
});
